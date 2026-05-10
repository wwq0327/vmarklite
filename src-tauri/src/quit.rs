//! # Coordinated Quit
//!
//! Purpose: Manages graceful application shutdown for read-only preview.
//!
//! Pipeline: Cmd+Q → `start_quit` → emit `app:quit-requested` to each document
//! window → windows close one by one → `handle_window_destroyed` → when all
//! targets gone → `finalize_quit` → `app.exit(0)`.
//!
//! Key decisions:
//!   - EXIT_ALLOWED is only set to true immediately before `app.exit(0)` to prevent
//!     premature exit during the coordinated quit flow.
//!   - No confirm-quit gate — VMark Lite is read-only with no unsaved documents.

use std::collections::HashSet;
use std::sync::{Mutex, LazyLock, atomic::{AtomicBool, Ordering}};
use tauri::{AppHandle, Emitter, Manager};

static QUIT_IN_PROGRESS: AtomicBool = AtomicBool::new(false);

// IMPORTANT: A coordinated quit can be "in progress" while we still need to
// block OS quit requests until all windows have handled unsaved changes.
// This flag is only set to true immediately before calling `app.exit(0)`.
static EXIT_ALLOWED: AtomicBool = AtomicBool::new(false);
static QUIT_TARGETS: LazyLock<Mutex<HashSet<String>>> =
    LazyLock::new(|| Mutex::new(HashSet::new()));

/// Return `true` if the label identifies a document window (`main` or `doc-*`).
pub fn is_document_window_label(label: &str) -> bool {
    label == "main" || label.starts_with("doc-")
}

/// Return `true` when the app is ready to terminate (set just before `app.exit(0)`).
pub fn is_exit_allowed() -> bool {
    EXIT_ALLOWED.load(Ordering::SeqCst)
}

fn set_exit_allowed(allowed: bool) {
    EXIT_ALLOWED.store(allowed, Ordering::SeqCst);
}

fn set_quit_targets(targets: HashSet<String>) {
    let mut guard = QUIT_TARGETS.lock().unwrap_or_else(|p| p.into_inner());
    *guard = targets;
}

fn remove_quit_target(label: &str) -> bool {
    let mut guard = QUIT_TARGETS.lock().unwrap_or_else(|p| p.into_inner());
    guard.remove(label);
    guard.is_empty()
}

/// No-op retained for frontend compatibility (confirm-quit setting is unused in VMark Lite).
#[tauri::command]
pub fn set_confirm_quit(_enabled: bool) {}

/// Final quit: allow exit and terminate the process.
fn finalize_quit(app: &AppHandle) {
    set_exit_allowed(true);
    app.exit(0);
}

/// Start coordinated quit: request close of all document windows.
pub fn start_quit(app: &AppHandle) {
    if QUIT_IN_PROGRESS.swap(true, Ordering::SeqCst) {
        return;
    }
    set_exit_allowed(false);

    let mut targets = HashSet::new();
    for (label, window) in app.webview_windows() {
        if is_document_window_label(&label) {
            targets.insert(label.clone());
            let _ = window.emit("app:quit-requested", label);
        } else {
            // Close non-document windows immediately
            let _ = window.close();
        }
    }

    if targets.is_empty() {
        finalize_quit(app);
        return;
    }

    set_quit_targets(targets);
}

/// Cancel an in-progress quit (e.g., user cancelled save prompt).
#[tauri::command]
pub fn cancel_quit() {
    QUIT_IN_PROGRESS.store(false, Ordering::SeqCst);
    set_exit_allowed(false);
    set_quit_targets(HashSet::new());
}

/// Handle a window being destroyed while quit is in progress.
pub fn handle_window_destroyed(app: &AppHandle, label: &str) {
    let quit_in_progress = QUIT_IN_PROGRESS.load(Ordering::SeqCst);
    log::debug!("[Tauri] handle_window_destroyed: label={}, quit_in_progress={}", label, quit_in_progress);

    if !quit_in_progress {
        return;
    }

    if !is_document_window_label(label) {
        return;
    }

    if remove_quit_target(label) {
        log::debug!("[Tauri] handle_window_destroyed: all targets done, calling app.exit(0)");
        finalize_quit(app);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Tests mutate shared statics, so they must run serially.
    // Use a global mutex to prevent parallel test interference.
    static TEST_LOCK: Mutex<()> = Mutex::new(());

    #[test]
    fn test_is_document_window_label() {
        assert!(is_document_window_label("main"));
        assert!(is_document_window_label("doc-0"));
        assert!(is_document_window_label("doc-123"));
        assert!(!is_document_window_label("settings"));
    }

    #[test]
    fn cancel_clears_all_quit_state() {
        let _lock = TEST_LOCK.lock().unwrap_or_else(|p| p.into_inner());

        // Set up quit-in-progress state
        QUIT_IN_PROGRESS.store(true, Ordering::SeqCst);
        EXIT_ALLOWED.store(true, Ordering::SeqCst);
        set_quit_targets(HashSet::from(["main".to_string(), "doc-0".to_string()]));

        cancel_quit();

        // All state should be cleared
        assert!(!QUIT_IN_PROGRESS.load(Ordering::SeqCst));
        assert!(!EXIT_ALLOWED.load(Ordering::SeqCst));
        assert!(QUIT_TARGETS.lock().unwrap_or_else(|p| p.into_inner()).is_empty());
    }

    // --- Exit allowed flag ---

    #[test]
    fn exit_allowed_initially_false() {
        let _lock = TEST_LOCK.lock().unwrap_or_else(|p| p.into_inner());
        set_exit_allowed(false);
        assert!(!is_exit_allowed());
    }

    #[test]
    fn exit_allowed_set_and_clear() {
        let _lock = TEST_LOCK.lock().unwrap_or_else(|p| p.into_inner());

        set_exit_allowed(true);
        assert!(is_exit_allowed());

        set_exit_allowed(false);
        assert!(!is_exit_allowed());
    }

    #[test]
    fn exit_allowed_toggled_multiple_times() {
        let _lock = TEST_LOCK.lock().unwrap_or_else(|p| p.into_inner());

        for _ in 0..10 {
            set_exit_allowed(true);
            assert!(is_exit_allowed());
            set_exit_allowed(false);
            assert!(!is_exit_allowed());
        }
    }

    // --- Quit targets ---

    #[test]
    fn remove_quit_target_returns_true_when_last_removed() {
        let _lock = TEST_LOCK.lock().unwrap_or_else(|p| p.into_inner());

        set_quit_targets(HashSet::from(["main".to_string()]));
        assert!(remove_quit_target("main"));
    }

    #[test]
    fn remove_quit_target_returns_false_when_others_remain() {
        let _lock = TEST_LOCK.lock().unwrap_or_else(|p| p.into_inner());

        set_quit_targets(HashSet::from(["main".to_string(), "doc-0".to_string()]));
        assert!(!remove_quit_target("main"));
    }

    #[test]
    fn remove_nonexistent_target_checks_emptiness() {
        let _lock = TEST_LOCK.lock().unwrap_or_else(|p| p.into_inner());

        set_quit_targets(HashSet::from(["main".to_string()]));
        assert!(!remove_quit_target("doc-999"));
    }

    #[test]
    fn remove_all_targets_one_by_one() {
        let _lock = TEST_LOCK.lock().unwrap_or_else(|p| p.into_inner());

        set_quit_targets(HashSet::from([
            "main".to_string(),
            "doc-0".to_string(),
            "doc-1".to_string(),
        ]));
        assert!(!remove_quit_target("doc-0"));
        assert!(!remove_quit_target("main"));
        assert!(remove_quit_target("doc-1"));
    }

    #[test]
    fn empty_quit_targets_remove_returns_true() {
        let _lock = TEST_LOCK.lock().unwrap_or_else(|p| p.into_inner());

        set_quit_targets(HashSet::new());
        assert!(remove_quit_target("anything"));
    }

    // --- is_document_window_label edge cases ---

    #[test]
    fn is_document_window_label_empty_string() {
        assert!(!is_document_window_label(""));
    }

    #[test]
    fn is_document_window_label_doc_prefix_only() {
        assert!(is_document_window_label("doc-"));
    }

    #[test]
    fn is_document_window_label_main_substring() {
        assert!(!is_document_window_label("main-window"));
        assert!(!is_document_window_label("not-main"));
        assert!(!is_document_window_label("mainsettings"));
    }

    #[test]
    fn is_document_window_label_doc_variations() {
        assert!(!is_document_window_label("doc"));
        assert!(!is_document_window_label("docs-0"));
        assert!(!is_document_window_label("DOC-0"));
        assert!(is_document_window_label("doc-abc"));
    }

    // --- Thread safety ---

    #[test]
    fn concurrent_cancel_and_quit_no_panic() {
        let _lock = TEST_LOCK.lock().unwrap_or_else(|p| p.into_inner());
        QUIT_IN_PROGRESS.store(false, Ordering::SeqCst);
        set_exit_allowed(false);
        set_quit_targets(HashSet::new());

        let barrier = std::sync::Arc::new(std::sync::Barrier::new(6));
        let mut handles = Vec::new();

        // 3 threads calling set_confirm_quit
        for _ in 0..3 {
            let b = barrier.clone();
            handles.push(std::thread::spawn(move || {
                b.wait();
                set_confirm_quit(false);
            }));
        }

        // 3 threads calling cancel_quit
        for _ in 0..3 {
            let b = barrier.clone();
            handles.push(std::thread::spawn(move || {
                b.wait();
                cancel_quit();
            }));
        }

        for h in handles {
            h.join().expect("thread should not panic");
        }
    }

    #[test]
    fn concurrent_exit_allowed_toggle_no_panic() {
        let _lock = TEST_LOCK.lock().unwrap_or_else(|p| p.into_inner());
        set_exit_allowed(false);

        let barrier = std::sync::Arc::new(std::sync::Barrier::new(10));
        let handles: Vec<_> = (0..10)
            .map(|i| {
                let b = barrier.clone();
                std::thread::spawn(move || {
                    b.wait();
                    if i % 2 == 0 {
                        set_exit_allowed(true);
                    } else {
                        set_exit_allowed(false);
                    }
                    let _val = is_exit_allowed();
                })
            })
            .collect();

        for h in handles {
            h.join().expect("thread should not panic");
        }
    }
}
