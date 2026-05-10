/**
 * Crash Recovery — Stubbed for read-only preview
 *
 * Read-only preview does not write recovery snapshots.
 */

export interface RecoverySnapshot {
  version: 1;
  tabId: string;
  windowLabel: string;
  content: string;
  filePath: string | null;
  title: string;
  timestamp: number;
}

export async function getRecoveryDir(): Promise<string> {
  return "";
}

export async function ensureRecoveryDir(): Promise<string> {
  return "";
}

export async function writeRecoverySnapshot(): Promise<boolean> {
  return false;
}

export async function readRecoverySnapshots(): Promise<RecoverySnapshot[]> {
  return [];
}

export async function deleteRecoverySnapshot(): Promise<void> {}

export async function deleteRecoveryFilesForTabs(): Promise<void> {}

export async function deleteStaleRecoveryFiles(): Promise<void> {}
