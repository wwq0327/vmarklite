/**
 * Hot Exit Coordination — Stubbed for read-only preview
 *
 * Read-only preview does not perform hot exit operations.
 */

export const RESTORE_WAIT_TIMEOUT_MS = 15_000;

export function isRestoreInProgress(): boolean {
  return false;
}

export function setRestoreInProgress(): void {}

export function waitForRestoreComplete(_timeoutMs?: number): Promise<boolean> {
  return Promise.resolve(true);
}

export function notifyRestoreComplete(): void {}

export function resetCoordinationState(): void {}
