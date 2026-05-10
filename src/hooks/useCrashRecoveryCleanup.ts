/**
 * Crash Recovery Cleanup Hook — Stubbed for read-only preview
 *
 * Read-only preview does not write crash recovery snapshots.
 */

import { useEffect } from "react";

export function useCrashRecoveryCleanup(): void {
  useEffect(() => {
    // No-op: read-only preview does not clean up crash recovery files
  }, []);
}
