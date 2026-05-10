/**
 * Hot Exit Restart Helper — Stubbed for read-only preview
 *
 * Read-only preview does not support hot exit restart.
 */

export async function restartWithHotExit(): Promise<void> {
  // No-op: read-only preview does not support restart with hot exit
}

export async function checkAndRestoreSession(): Promise<boolean> {
  return false;
}
