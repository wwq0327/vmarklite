/**
 * Hot Exit Restore Helpers - Stubbed for read-only preview
 *
 * In read-only preview mode, there are no unsaved changes to restore.
 */

/** Stub - read-only preview has no state to pull */
export async function pullWindowStateWithRetry(_windowLabel: string): Promise<unknown> {
  return null;
}

/** Stub - read-only preview has no state to restore */
export async function restoreWindowState(_windowLabel: string, _state: unknown): Promise<void> {
  // No-op
}
