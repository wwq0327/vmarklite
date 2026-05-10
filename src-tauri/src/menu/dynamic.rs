//! Runtime menu updates (recent files, workspaces).
//!
//! Purpose: Dynamically updates submenu contents without rebuilding the entire menu bar.
//! Called by Tauri commands when the frontend notifies of list changes.
//!
//! @coordinates-with `mod.rs` (snapshot Mutexes and submenu ID constants)
//! @coordinates-with `menu_events.rs` (resolves snapshot paths on click)

use rust_i18n::t;
use tauri::menu::{MenuItem, MenuItemKind, PredefinedMenuItem};
use tauri::AppHandle;

use super::{
    RECENT_FILES_SNAPSHOT, RECENT_FILES_SUBMENU_ID,
    RECENT_WORKSPACES_SNAPSHOT, RECENT_WORKSPACES_SUBMENU_ID,
};

/// Update the Open Recent submenu with the given list of file paths.
pub fn update_recent_files_menu(app: &AppHandle, files: Vec<String>) -> tauri::Result<()> {
    // Store snapshot of files for lookup when menu items are clicked
    if let Ok(mut snapshot) = RECENT_FILES_SNAPSHOT.lock() {
        *snapshot = files.clone();
    }

    let Some(menu) = app.menu() else {
        return Ok(());
    };

    // Find the recent files submenu
    let mut submenu_opt = None;
    for item in menu.items()? {
        if let MenuItemKind::Submenu(sub) = item {
            if let Some(MenuItemKind::Submenu(recent)) = sub.get(RECENT_FILES_SUBMENU_ID) {
                submenu_opt = Some(recent);
                break;
            }
        }
    }

    let Some(submenu) = submenu_opt else {
        return Ok(());
    };

    // Remove all existing items
    while let Some(item) = submenu.items()?.first() {
        submenu.remove(item)?;
    }

    // Add file items
    if files.is_empty() {
        let no_recent =
            MenuItem::with_id(app, "no-recent", &t!("menu.recentFiles.empty").to_string(), false, None::<&str>)?;
        submenu.append(&no_recent)?;
    } else {
        for (index, path) in files.iter().enumerate() {
            let filename = std::path::Path::new(path)
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or(path);

            let item_id = format!("recent-file-{}", index);
            let item = MenuItem::with_id(app, &item_id, filename, true, None::<&str>)?;
            submenu.append(&item)?;
        }
    }

    // Add separator and clear option
    let separator = PredefinedMenuItem::separator(app)?;
    submenu.append(&separator)?;

    let clear_item = MenuItem::with_id(
        app,
        "clear-recent",
        &t!("menu.recentFiles.clear").to_string(),
        !files.is_empty(),
        None::<&str>,
    )?;
    submenu.append(&clear_item)?;

    Ok(())
}

/// Update the Open Recent Workspace submenu with the given list of workspace paths.
pub fn update_recent_workspaces_menu(
    app: &AppHandle,
    workspaces: Vec<String>,
) -> tauri::Result<()> {
    if let Ok(mut snapshot) = RECENT_WORKSPACES_SNAPSHOT.lock() {
        *snapshot = workspaces.clone();
    }

    let Some(menu) = app.menu() else {
        return Ok(());
    };

    let mut submenu_opt = None;
    for item in menu.items()? {
        if let MenuItemKind::Submenu(sub) = item {
            if let Some(MenuItemKind::Submenu(recent)) = sub.get(RECENT_WORKSPACES_SUBMENU_ID) {
                submenu_opt = Some(recent);
                break;
            }
        }
    }

    let Some(submenu) = submenu_opt else {
        return Ok(());
    };

    while let Some(item) = submenu.items()?.first() {
        submenu.remove(item)?;
    }

    if workspaces.is_empty() {
        let no_recent = MenuItem::with_id(
            app,
            "no-recent-workspace",
            &t!("menu.recentWorkspaces.empty").to_string(),
            false,
            None::<&str>,
        )?;
        submenu.append(&no_recent)?;
    } else {
        for (index, path) in workspaces.iter().enumerate() {
            let foldername = std::path::Path::new(path)
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or(path);

            let item_id = format!("recent-workspace-{}", index);
            let item = MenuItem::with_id(app, &item_id, foldername, true, None::<&str>)?;
            submenu.append(&item)?;
        }
    }

    let separator = PredefinedMenuItem::separator(app)?;
    submenu.append(&separator)?;

    let clear_item = MenuItem::with_id(
        app,
        "clear-recent-workspaces",
        &t!("menu.recentWorkspaces.clear").to_string(),
        !workspaces.is_empty(),
        None::<&str>,
    )?;
    submenu.append(&clear_item)?;

    Ok(())
}
