//! # External Editor
//!
//! Purpose: Launch the user's `$EDITOR` (or platform default) on a file
//! path. Backs the "Open in external editor" button surfaced
//! inside the read-only code viewer.
//!
//! Pipeline: frontend `invoke("open_in_external_editor", { path })` →
//! resolve editor command via `$VMARK_EXTERNAL_EDITOR` → `$VISUAL` →
//! `$EDITOR` → platform default → spawn detached → return.
//!
//! Key decisions:
//!   - macOS GUI apps inherit a minimal PATH from launchd, so we use
//!     std::env::var("SHELL") to get the login shell path.
//!   - Spawn detached: we don't wait for the editor to exit. The
//!     Tauri command returns as soon as the child is launched.
//!   - Best-effort: spawn failures return a `Result::Err` with a
//!     human-readable message. The frontend toasts it.

use std::path::Path;
use std::process::Command;

/// Build a `std::process::Command` for the given executable and args.
///
/// On Windows, `.cmd`/`.bat` shims (created by npm/yarn global installs)
/// must run through `cmd.exe /c`. On macOS/Linux this is a plain spawn.
fn build_command(exe: &str, args: &[&str]) -> Command {
    #[cfg(target_os = "windows")]
    {
        let lower = exe.to_lowercase();
        if lower.ends_with(".cmd") || lower.ends_with(".bat") {
            let system_root =
                std::env::var("SystemRoot").unwrap_or_else(|_| r"C:\Windows".to_string());
            let cmd_path = std::path::PathBuf::from(system_root)
                .join("System32")
                .join("cmd.exe");
            let mut c = Command::new(cmd_path);
            c.args(["/c", exe]);
            c.args(args);
            return c;
        }
    }
    #[cfg(not(target_os = "windows"))]
    let mut c = Command::new(exe);
    #[cfg(not(target_os = "windows"))]
    {
        c.args(args);
    }
    c
}

/// Return the login shell's PATH for external editor launches.
fn login_shell_path() -> String {
    std::env::var("SHELL").unwrap_or_else(|_| "/bin/sh".to_string())
}

/// Reject editor overrides that look like shell commands.
///
/// `editor_override` is webview-supplied (the GUI Settings value). The
/// threat model is: a compromised webview (XSS-style attack) calls
/// `invoke("open_in_external_editor", { editorOverride: "<malicious>" })`.
/// We never invoke a shell, so the malicious string isn't *interpreted*
/// as shell — but `python -c "..."` style overrides would still execute
/// arbitrary code via the editor's own interpreter.
///
/// Mitigation: the override must be a SINGLE token (no whitespace, no
/// args). Multi-arg invocations belong in `$VMARK_EXTERNAL_EDITOR` env
/// var — env vars aren't webview-supplied so they can't be poisoned by
/// XSS. Combined with the no-shell-metachar check and the exists-on-disk
/// check, this leaves a webview attacker with only two options: pick a
/// bare command name (where they don't control the args) or pick an
/// existing absolute path (which they don't control either).
///
/// Returns the trimmed override on success, or an `Err` describing why
/// the input was refused.
fn validate_editor_override(raw: &str) -> Result<String, String> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Ok(String::new());
    }
    const FORBIDDEN: &[char] = &[
        ';', '|', '&', '`', '$', '<', '>', '\n', '\r', '\0', '"', '\'',
    ];
    if let Some(c) = trimmed.chars().find(|c| FORBIDDEN.contains(c)) {
        return Err(format!(
            "external editor override contains forbidden character {c:?}; \
             pick an executable path or app bundle without shell metacharacters"
        ));
    }
    if trimmed.starts_with('-') {
        return Err(format!(
            "external editor override must not start with '-' (looks like a \
             command-line flag). Got: {trimmed:?}"
        ));
    }
    let is_absolute = trimmed.starts_with('/')
        || trimmed.starts_with('\\')
        || (trimmed.len() >= 2 && trimmed.chars().nth(1) == Some(':'));
    if is_absolute {
        if !Path::new(trimmed).exists() {
            return Err(format!(
                "external editor override path '{trimmed}' does not exist"
            ));
        }
    } else {
        if trimmed.contains(char::is_whitespace) {
            return Err(format!(
                "external editor override with whitespace must be an absolute \
                 path that exists on disk (e.g. /Applications/My App.app). To \
                 pass arguments, set the $VMARK_EXTERNAL_EDITOR environment \
                 variable instead. Got: {trimmed:?}"
            ));
        }
    }
    Ok(trimmed.to_string())
}

/// Resolve which editor command to launch. Order:
///   1. `editor_override` from the GUI setting (explicit beats implicit;
///      already validated by `validate_editor_override`)
///   2. `$VMARK_EXTERNAL_EDITOR` (project override)
///   3. `$VISUAL`
///   4. `$EDITOR`
///   5. Platform default (`open -t` on macOS, `notepad.exe` on Windows,
///      `xdg-open` on Linux/BSD)
fn resolve_editor(editor_override: Option<&str>) -> String {
    if let Some(v) = editor_override {
        if !v.trim().is_empty() {
            return v.to_string();
        }
    }
    if let Ok(v) = std::env::var("VMARK_EXTERNAL_EDITOR") {
        if !v.trim().is_empty() {
            return v;
        }
    }
    if let Ok(v) = std::env::var("VISUAL") {
        if !v.trim().is_empty() {
            return v;
        }
    }
    if let Ok(v) = std::env::var("EDITOR") {
        if !v.trim().is_empty() {
            return v;
        }
    }
    #[cfg(target_os = "macos")]
    {
        return "open -t".to_string();
    }
    #[cfg(target_os = "windows")]
    {
        return "notepad.exe".to_string();
    }
    #[cfg(all(not(target_os = "macos"), not(target_os = "windows")))]
    {
        return "xdg-open".to_string();
    }
}

/// macOS-only: when the resolved executable is an `.app` bundle directory,
/// rewrite the spawn arguments to `open -a <bundle> <file>` so Launch
/// Services routes the open through the bundle's main executable.
#[cfg(target_os = "macos")]
fn maybe_open_app_bundle(
    exe: &str,
    extra_args: &[&str],
    file_path: &str,
) -> Option<(String, Vec<String>)> {
    let p = Path::new(exe);
    if exe.ends_with(".app") && p.is_dir() {
        let mut args = vec!["-a".to_string(), exe.to_string()];
        args.extend(extra_args.iter().map(|a| a.to_string()));
        args.push(file_path.to_string());
        Some(("open".to_string(), args))
    } else {
        None
    }
}

/// Open `path` in the user's external editor. Returns `Ok(())` once
/// the child has been spawned (we do NOT wait). On spawn failure,
/// returns a human-readable error so the frontend can toast it.
#[tauri::command]
pub fn open_in_external_editor(
    path: String,
    editor_override: Option<String>,
) -> Result<(), String> {
    let canonical = Path::new(&path)
        .canonicalize()
        .map_err(|e| format!("invalid path '{path}': {e}"))?;
    if !canonical.is_file() {
        return Err(format!("path '{path}' is not a regular file"));
    }
    if !crate::is_openable_supported(&canonical) {
        return Err(format!(
            "path '{path}' is not an openable VMark file"
        ));
    }

    let validated_override = match editor_override.as_deref() {
        Some(raw) => Some(validate_editor_override(raw)?),
        None => None,
    };
    let editor_cmd = resolve_editor(validated_override.as_deref());
    let (exe, extra_args): (&str, Vec<&str>) =
        if validated_override.as_deref().is_some_and(|s| !s.is_empty()) {
            (editor_cmd.as_str(), Vec::new())
        } else {
            let mut parts = editor_cmd.split_whitespace();
            let first = parts.next().unwrap_or("");
            let rest: Vec<&str> = parts.collect();
            (first, rest)
        };
    if exe.is_empty() {
        return Err("No editor configured (EDITOR / VISUAL unset)".to_string());
    }

    #[cfg(target_os = "macos")]
    let (exe_owned, args_owned): (String, Vec<String>) =
        match maybe_open_app_bundle(exe, &extra_args, &path) {
            Some((e, a)) => (e, a),
            None => {
                let mut a: Vec<String> =
                    extra_args.iter().map(|s| s.to_string()).collect();
                a.push(path.clone());
                (exe.to_string(), a)
            }
        };
    #[cfg(not(target_os = "macos"))]
    let (exe_owned, args_owned): (String, Vec<String>) = {
        let mut a: Vec<String> =
            extra_args.iter().map(|s| s.to_string()).collect();
        a.push(path.clone());
        (exe.to_string(), a)
    };

    let args_refs: Vec<&str> = args_owned.iter().map(|s| s.as_str()).collect();
    let mut cmd = build_command(&exe_owned, &args_refs);
    cmd.env("PATH", login_shell_path());
    match cmd.spawn() {
        Ok(mut child) => {
            std::thread::spawn(move || {
                let _ = child.wait();
            });
            Ok(())
        }
        Err(e) => Err(format!(
            "Failed to launch editor '{exe_owned}' for '{path}': {e}"
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    static ENV_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

    #[test]
    fn resolve_editor_prefers_gui_override_above_all() {
        let _guard = ENV_LOCK.lock().unwrap_or_else(|e| e.into_inner());
        let _vmark = std::env::var("VMARK_EXTERNAL_EDITOR").ok();
        let _visual = std::env::var("VISUAL").ok();
        let _editor = std::env::var("EDITOR").ok();
        std::env::set_var("VMARK_EXTERNAL_EDITOR", "vmark-env");
        std::env::set_var("VISUAL", "visual-env");
        std::env::set_var("EDITOR", "editor-env");
        assert_eq!(resolve_editor(Some("/Applications/Cursor.app")), "/Applications/Cursor.app");
        assert_eq!(resolve_editor(Some("")), "vmark-env");
        assert_eq!(resolve_editor(Some("   ")), "vmark-env");
        std::env::remove_var("VMARK_EXTERNAL_EDITOR");
        std::env::remove_var("VISUAL");
        std::env::remove_var("EDITOR");
        if let Some(v) = _vmark { std::env::set_var("VMARK_EXTERNAL_EDITOR", v); }
        if let Some(v) = _visual { std::env::set_var("VISUAL", v); }
        if let Some(v) = _editor { std::env::set_var("EDITOR", v); }
    }

    #[test]
    fn resolve_editor_prefers_vmark_env_when_no_override() {
        let _guard = ENV_LOCK.lock().unwrap_or_else(|e| e.into_inner());
        let _vmark = std::env::var("VMARK_EXTERNAL_EDITOR").ok();
        let _visual = std::env::var("VISUAL").ok();
        let _editor = std::env::var("EDITOR").ok();
        std::env::set_var("VMARK_EXTERNAL_EDITOR", "myeditor");
        std::env::set_var("VISUAL", "should-be-ignored");
        std::env::set_var("EDITOR", "should-be-ignored");
        assert_eq!(resolve_editor(None), "myeditor");
        std::env::remove_var("VMARK_EXTERNAL_EDITOR");
        std::env::remove_var("VISUAL");
        std::env::remove_var("EDITOR");
        if let Some(v) = _vmark { std::env::set_var("VMARK_EXTERNAL_EDITOR", v); }
        if let Some(v) = _visual { std::env::set_var("VISUAL", v); }
        if let Some(v) = _editor { std::env::set_var("EDITOR", v); }
    }

    #[test]
    fn validate_editor_override_accepts_empty_and_whitespace() {
        assert_eq!(validate_editor_override("").unwrap(), "");
        assert_eq!(validate_editor_override("   ").unwrap(), "");
    }

    #[test]
    fn validate_editor_override_accepts_bare_command_names() {
        assert_eq!(validate_editor_override("code").unwrap(), "code");
        assert_eq!(validate_editor_override("subl").unwrap(), "subl");
        assert_eq!(validate_editor_override("nvim").unwrap(), "nvim");
    }

    #[test]
    fn validate_editor_override_rejects_relative_with_whitespace() {
        for input in &["code --wait", "subl -n", "nvim +0", "python -c x"] {
            let result = validate_editor_override(input);
            assert!(
                result.is_err(),
                "multi-token bare override must be rejected (XSS gate): {input:?}"
            );
        }
    }

    #[test]
    fn validate_editor_override_rejects_shell_metacharacters() {
        for input in &[
            "code;",
            "code|",
            "code&",
            "code`",
            "code$",
            "code>",
            "code\"",
            "code'",
            "code\nrm",
        ] {
            let result = validate_editor_override(input);
            assert!(
                result.is_err(),
                "must reject shell metacharacters in: {input:?}"
            );
        }
    }

    #[test]
    fn validate_editor_override_rejects_flag_prefix() {
        let result = validate_editor_override("-c");
        assert!(
            result.is_err(),
            "must reject overrides that start with '-'"
        );
    }

    #[test]
    fn validate_editor_override_rejects_nonexistent_absolute_paths() {
        let result = validate_editor_override("/totally/not/a/real/path/code");
        assert!(
            result.is_err(),
            "non-existent absolute paths must be rejected (XSS gate)"
        );
    }

    #[test]
    fn validate_editor_override_accepts_existing_absolute_path() {
        #[cfg(unix)]
        {
            let result = validate_editor_override("/bin/sh");
            assert!(
                result.is_ok(),
                "existing absolute paths should validate; got {result:?}"
            );
        }
    }
}
