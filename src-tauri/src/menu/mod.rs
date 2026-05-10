//! # Application Menu
//!
//! Purpose: Builds the native application menu bar with localized labels and
//! keyboard accelerators, using `rust-i18n` for translation.
//!
//! Pipeline: `lib.rs` setup -> `localized::create_localized_menu()` -> Tauri `app.set_menu()`.
//! When user changes locale (label change): frontend invokes `rebuild_menu`
//!   -> `localized::create_localized_menu()` with custom shortcuts.
//! When user edits a keyboard shortcut (accelerator-only change): frontend
//!   invokes `update_menu_accelerators` -> `accelerators::apply_accelerator_diff()`
//!   which mutates only the items whose accelerator changed. This avoids the
//!   full rebuild's ~150 main-thread hops that stalled the Settings window on
//!   Windows (Issue #825).
//!
//! Key decisions:
//!   - A single `create_localized_menu()` function handles both default and custom
//!     shortcuts via an `Option<&HashMap>` parameter.
//!   - All menu labels use `t!()` macro from `rust-i18n` for i18n support.
//!   - Recent files/workspaces use snapshot Mutexes so menu-click
//!     handlers always resolve the correct path even if the store changed.
//!   - The accelerator cache is seeded automatically inside `create_localized_menu`
//!     via the `accel()` closure, so every rebuild leaves a correct baseline
//!     for the next differential update — callers don't need to seed explicitly.
//!
//! @coordinates-with `menu_events.rs` (dispatches click events to frontend)
//! @coordinates-with `macos_menu.rs` (applies SF Symbol icons and workarounds)
//! @coordinates-with `lib.rs` (registers Tauri commands and builds initial menu)
//! @coordinates-with `locales/en.yml` (English locale strings)

pub mod accelerators;
mod commands;
mod dynamic;
pub mod localized;

use std::sync::Mutex;

/// Menu ID for the Open Recent (files) submenu.
pub const RECENT_FILES_SUBMENU_ID: &str = "recent-files-submenu";
/// Menu ID for the Open Recent Workspace submenu.
pub const RECENT_WORKSPACES_SUBMENU_ID: &str = "recent-workspaces-submenu";

/// Stores the recent files list snapshot at menu build time.
/// This ensures that when a menu item is clicked, we can look up
/// the correct path even if the store changed since menu creation.
pub(crate) static RECENT_FILES_SNAPSHOT: Mutex<Vec<String>> = Mutex::new(Vec::new());

/// Stores the recent workspaces list snapshot at menu build time.
pub(crate) static RECENT_WORKSPACES_SNAPSHOT: Mutex<Vec<String>> = Mutex::new(Vec::new());

/// Get the path for a recent file by its menu index.
/// Returns None if index is out of bounds.
pub fn get_recent_file_path(index: usize) -> Option<String> {
    RECENT_FILES_SNAPSHOT
        .lock()
        .ok()
        .and_then(|files| files.get(index).cloned())
}

/// Get the path for a recent workspace by its menu index.
/// Returns None if index is out of bounds.
pub fn get_recent_workspace_path(index: usize) -> Option<String> {
    RECENT_WORKSPACES_SNAPSHOT
        .lock()
        .ok()
        .and_then(|workspaces| workspaces.get(index).cloned())
}

// Re-export public items so `menu::create_menu`, `menu::rebuild_menu`, etc. keep working.
// Wildcard re-exports are required for `#[tauri::command]` functions because the macro
// generates hidden items (`__cmd__*`) that `generate_handler!` in `lib.rs` must resolve.
pub use commands::*;
pub use localized::*;

// Re-export the Tauri command wrappers from commands.rs (not the raw dynamic functions)
pub use commands::{update_recent_files, update_recent_workspaces};
