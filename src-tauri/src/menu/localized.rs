//! Localized menu builder (unified).
//!
//! Purpose: Creates the application menu with localized labels and optional custom
//! keyboard shortcuts for the read-only preview build.
//!
//! Also seeds the differential-update baseline: the function calls
//! `accelerators::begin_rebuild()` up-front, and the `accel()` closure records
//! every resolved accelerator into `ACCEL_CACHE` so the next
//! `update_menu_accelerators` call diffs against a correct snapshot.
//!
//! @coordinates-with `en.yml` (locale strings)
//! @coordinates-with `macos_menu.rs` (applies SF Symbol icons post-build)
//! @coordinates-with `commands.rs` (calls this on rebuild)
//! @coordinates-with `accelerators.rs` (consumes the seeded ACCEL_CACHE)
//! @coordinates-with `src/hooks/useExportMenuEvents.ts` (consumes `menu:export-*` events)

use std::collections::HashMap;

use rust_i18n::t;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};

use super::{RECENT_FILES_SUBMENU_ID, RECENT_WORKSPACES_SUBMENU_ID};

/// Build the application menu with localized labels and optional custom shortcuts.
///
/// When `custom_shortcuts` is `None`, default accelerators are used (startup path).
/// When `Some`, the map overrides defaults: `menu_item_id -> accelerator_string`.
pub fn create_localized_menu(
    app: &tauri::AppHandle,
    custom_shortcuts: Option<&HashMap<String, String>>,
) -> tauri::Result<Menu<tauri::Wry>> {
    // Clear the diff caches so the accel() closure below can repopulate the
    // accelerator baseline as it builds the tree. This makes both startup
    // (custom_shortcuts = None) and rebuild paths leave a correct baseline
    // for the next differential update.
    super::accelerators::begin_rebuild();

    // Helper: resolve accelerator from custom map or use default.
    // Returns `Some(accel)` or `None` if the resolved string is empty.
    // Also records the resolved value in the accelerator cache so
    // `update_menu_accelerators` can diff against reality without a separate
    // accounting pass.
    let accel = |id: &str, default: &str| -> Option<String> {
        let value = custom_shortcuts
            .and_then(|map| map.get(id).map(|s| s.as_str()))
            .unwrap_or(default);
        super::accelerators::record_applied(id, value);
        if value.is_empty() {
            None
        } else {
            Some(value.to_string())
        }
    };

    // ========================================================================
    // App menu (macOS only)
    // ========================================================================
    #[cfg(target_os = "macos")]
    let app_menu = Submenu::with_id_and_items(
        app,
        "app-menu",
        &t!("menu.app").to_string(),
        true,
        &[
            &MenuItem::with_id(app, "about", &t!("menu.app.about").to_string(), true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "preferences", &t!("menu.app.settings").to_string(), true, accel("preferences", "CmdOrCtrl+,"))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::services(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::hide(app, None)?,
            &PredefinedMenuItem::hide_others(app, None)?,
            &PredefinedMenuItem::show_all(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "save-all-quit", &t!("menu.app.saveAllQuit").to_string(), true, accel("save-all-quit", "Alt+CmdOrCtrl+Shift+Q"))?,
            &MenuItem::with_id(app, "quit", &t!("menu.app.quit").to_string(), true, accel("quit", "CmdOrCtrl+Q"))?,
        ],
    )?;

    // ========================================================================
    // File menu
    // ========================================================================
    let recent_submenu = Submenu::with_id_and_items(
        app,
        RECENT_FILES_SUBMENU_ID,
        &t!("menu.file.openRecent").to_string(),
        true,
        &[
            &MenuItem::with_id(app, "no-recent", &t!("menu.recentFiles.empty").to_string(), false, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "clear-recent", &t!("menu.recentFiles.clear").to_string(), true, None::<&str>)?,
        ],
    )?;

    let recent_workspaces_submenu = Submenu::with_id_and_items(
        app,
        RECENT_WORKSPACES_SUBMENU_ID,
        &t!("menu.file.openRecentWorkspace").to_string(),
        true,
        &[
            &MenuItem::with_id(app, "no-recent-workspace", &t!("menu.recentWorkspaces.empty").to_string(), false, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "clear-recent-workspaces", &t!("menu.recentWorkspaces.clear").to_string(), true, None::<&str>)?,
        ],
    )?;

    let export_submenu = Submenu::with_id_and_items(
        app,
        "export-submenu",
        &t!("menu.file.export").to_string(),
        true,
        &[
            &MenuItem::with_id(app, "export-html", &t!("menu.file.export.html").to_string(), true, accel("export-html", ""))?,
            &MenuItem::with_id(app, "export-pdf-native", &t!("menu.file.export.pdf").to_string(), true, accel("export-pdf-native", ""))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "copy-html", &t!("menu.file.export.copyHtml").to_string(), true, accel("copy-html", "CmdOrCtrl+Shift+C"))?,
        ],
    )?;

    let history_submenu = Submenu::with_id_and_items(
        app,
        "doc-history-submenu",
        &t!("menu.file.docHistory").to_string(),
        true,
        &[
            &MenuItem::with_id(app, "clear-workspace-history", &t!("menu.file.docHistory.clearWorkspace").to_string(), true, None::<&str>)?,
            &MenuItem::with_id(app, "clear-history", &t!("menu.file.docHistory.clearAll").to_string(), true, None::<&str>)?,
        ],
    )?;

    #[cfg(target_os = "macos")]
    let file_menu = Submenu::with_id_and_items(
        app,
        "file-menu",
        &t!("menu.file").to_string(),
        true,
        &[
            &MenuItem::with_id(app, "new", &t!("menu.file.new").to_string(), true, accel("new", "CmdOrCtrl+N"))?,
            &MenuItem::with_id(app, "new-window", &t!("menu.file.newWindow").to_string(), true, accel("new-window", "CmdOrCtrl+Shift+N"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "quick-open", &t!("menu.file.quickOpen").to_string(), true, accel("quick-open", "CmdOrCtrl+O"))?,
            &MenuItem::with_id(app, "open", &t!("menu.file.openFile").to_string(), true, accel("open", ""))?,
            &MenuItem::with_id(app, "open-folder", &t!("menu.file.openWorkspace").to_string(), true, accel("open-folder", "CmdOrCtrl+Shift+O"))?,
            &recent_submenu,
            &recent_workspaces_submenu,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "close", &t!("menu.file.close").to_string(), true, accel("close", "CmdOrCtrl+W"))?,
            &MenuItem::with_id(app, "close-workspace", &t!("menu.file.closeWorkspace").to_string(), true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "save", &t!("menu.file.save").to_string(), true, accel("save", "CmdOrCtrl+S"))?,
            &MenuItem::with_id(app, "save-as", &t!("menu.file.saveAs").to_string(), true, accel("save-as", "CmdOrCtrl+Shift+S"))?,
            &MenuItem::with_id(app, "move-to", &t!("menu.file.moveTo").to_string(), true, accel("move-to", ""))?,
            &PredefinedMenuItem::separator(app)?,
            &export_submenu,
            &MenuItem::with_id(app, "export-pdf", &t!("menu.file.print").to_string(), true, accel("export-pdf", "CmdOrCtrl+P"))?,
            &PredefinedMenuItem::separator(app)?,
            &history_submenu,
        ],
    )?;

    #[cfg(not(target_os = "macos"))]
    let file_menu = Submenu::with_id_and_items(
        app,
        "file-menu",
        &t!("menu.file").to_string(),
        true,
        &[
            &MenuItem::with_id(app, "new", &t!("menu.file.new").to_string(), true, accel("new", "CmdOrCtrl+N"))?,
            &MenuItem::with_id(app, "new-window", &t!("menu.file.newWindow").to_string(), true, accel("new-window", "CmdOrCtrl+Shift+N"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "quick-open", &t!("menu.file.quickOpen").to_string(), true, accel("quick-open", "CmdOrCtrl+O"))?,
            &MenuItem::with_id(app, "open", &t!("menu.file.openFile").to_string(), true, accel("open", ""))?,
            &MenuItem::with_id(app, "open-folder", &t!("menu.file.openWorkspace").to_string(), true, accel("open-folder", "CmdOrCtrl+Shift+O"))?,
            &recent_submenu,
            &recent_workspaces_submenu,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "close", &t!("menu.file.close").to_string(), true, accel("close", "CmdOrCtrl+W"))?,
            &MenuItem::with_id(app, "close-workspace", &t!("menu.file.closeWorkspace").to_string(), true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "save", &t!("menu.file.save").to_string(), true, accel("save", "CmdOrCtrl+S"))?,
            &MenuItem::with_id(app, "save-as", &t!("menu.file.saveAs").to_string(), true, accel("save-as", "CmdOrCtrl+Shift+S"))?,
            &MenuItem::with_id(app, "move-to", &t!("menu.file.moveTo").to_string(), true, accel("move-to", ""))?,
            &PredefinedMenuItem::separator(app)?,
            &export_submenu,
            &MenuItem::with_id(app, "export-pdf", &t!("menu.file.print").to_string(), true, accel("export-pdf", "CmdOrCtrl+P"))?,
            &PredefinedMenuItem::separator(app)?,
            &history_submenu,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "preferences", &t!("menu.app.settings").to_string(), true, accel("preferences", "CmdOrCtrl+,"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "save-all-quit", &t!("menu.file.saveAllExit").to_string(), true, accel("save-all-quit", "Alt+CmdOrCtrl+Shift+Q"))?,
            &MenuItem::with_id(app, "quit", &t!("menu.file.exit").to_string(), true, accel("quit", "CmdOrCtrl+Q"))?,
        ],
    )?;

    // ========================================================================
    // Edit menu (simplified for read-only preview)
    // ========================================================================
    let edit_menu = Submenu::with_id_and_items(
        app,
        "edit-menu",
        &t!("menu.edit").to_string(),
        true,
        &[
            &MenuItem::with_id(app, "undo", &t!("menu.edit.undo").to_string(), true, accel("undo", "CmdOrCtrl+Z"))?,
            &MenuItem::with_id(app, "redo", &t!("menu.edit.redo").to_string(), true, accel("redo", "CmdOrCtrl+Shift+Z"))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::cut(app, None)?,
            &PredefinedMenuItem::copy(app, None)?,
            &PredefinedMenuItem::paste(app, None)?,
            &PredefinedMenuItem::select_all(app, None)?,
        ],
    )?;


    // ========================================================================
    // View menu (simplified for read-only preview)
    // ========================================================================
    let view_menu = Submenu::with_id_and_items(
        app,
        "view-menu",
        &t!("menu.view").to_string(),
        true,
        &[
            &MenuItem::with_id(app, "zoom-actual", &t!("menu.view.actualSize").to_string(), true, accel("zoom-actual", "CmdOrCtrl+0"))?,
            &MenuItem::with_id(app, "zoom-in", &t!("menu.view.zoomIn").to_string(), true, accel("zoom-in", "CmdOrCtrl+="))?,
            &MenuItem::with_id(app, "zoom-out", &t!("menu.view.zoomOut").to_string(), true, accel("zoom-out", "CmdOrCtrl+-"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "word-wrap", &t!("menu.view.wordWrap").to_string(), true, accel("word-wrap", "Alt+Z"))?,
            &MenuItem::with_id(app, "fit-tables", &t!("menu.view.fitTables").to_string(), true, accel("fit-tables", ""))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "outline", &t!("menu.view.outline").to_string(), true, accel("outline", "Ctrl+Shift+1"))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::fullscreen(app, None)?,
        ],
    )?;

    // ========================================================================
    // Window menu
    // ========================================================================
    #[cfg(target_os = "macos")]
    let window_menu = Submenu::with_id_and_items(
        app,
        "window-menu",
        &t!("menu.window").to_string(),
        true,
        &[
            &PredefinedMenuItem::minimize(app, None)?,
            &PredefinedMenuItem::maximize(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "bring-all-to-front", &t!("menu.window.bringAllToFront").to_string(), true, None::<&str>)?,
        ],
    )?;

    #[cfg(not(target_os = "macos"))]
    let window_menu = Submenu::with_id_and_items(
        app,
        "window-menu",
        &t!("menu.window").to_string(),
        true,
        &[
            &PredefinedMenuItem::minimize(app, None)?,
            &PredefinedMenuItem::maximize(app, None)?,
        ],
    )?;

    // ========================================================================
    // Help menu
    // ========================================================================
    #[cfg(target_os = "macos")]
    let help_menu = Submenu::with_id_and_items(
        app,
        "help-menu",
        &t!("menu.help").to_string(),
        true,
        &[
            &MenuItem::with_id(app, "vmark-help", &t!("menu.help.vmarkHelp").to_string(), true, None::<&str>)?,
            &MenuItem::with_id(app, "keyboard-shortcuts", &t!("menu.help.keyboardShortcuts").to_string(), true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "install-cli", &t!("menu.help.installCli").to_string(), true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "report-issue", &t!("menu.help.reportIssue").to_string(), true, None::<&str>)?,
        ],
    )?;

    #[cfg(not(target_os = "macos"))]
    let help_menu = Submenu::with_id_and_items(
        app,
        "help-menu",
        &t!("menu.help").to_string(),
        true,
        &[
            &MenuItem::with_id(app, "vmark-help", &t!("menu.help.vmarkHelp").to_string(), true, None::<&str>)?,
            &MenuItem::with_id(app, "keyboard-shortcuts", &t!("menu.help.keyboardShortcuts").to_string(), true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "report-issue", &t!("menu.help.reportIssue").to_string(), true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "about", &t!("menu.app.about").to_string(), true, None::<&str>)?,
        ],
    )?;

    // ========================================================================
    // Assemble the menu bar
    // ========================================================================
    #[cfg(target_os = "macos")]
    return Menu::with_items(
        app,
        &[
            &app_menu,
            &file_menu,
            &edit_menu,
            &view_menu,
            &window_menu,
            &help_menu,
        ],
    );

    #[cfg(not(target_os = "macos"))]
    Menu::with_items(
        app,
        &[
            &file_menu,
            &edit_menu,
            &view_menu,
            &window_menu,
            &help_menu,
        ],
    )
}

/// Set the active locale for Rust-side translations.
///
/// After calling this, the next `rebuild_menu` will use the new locale's strings.
/// The frontend is responsible for triggering the menu rebuild.
#[tauri::command]
pub fn set_locale(_app: tauri::AppHandle, locale: String) -> Result<(), String> {
    rust_i18n::set_locale(&locale);
    Ok(())
}
