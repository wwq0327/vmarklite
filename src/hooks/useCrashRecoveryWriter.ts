/**
 * Crash Recovery Writer Hook — Stubbed for read-only preview
 *
 * Read-only preview does not write crash recovery snapshots.
 */

import { useEffect } from "react";

export function useCrashRecoveryWriter(): void {
  useEffect(() => {
    // No-op: read-only preview does not write crash recovery snapshots
  }, []);
}
