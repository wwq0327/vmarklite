/**
 * Crash Recovery Startup Hook — Stubbed for read-only preview
 *
 * Read-only preview does not perform crash recovery.
 */

import { useEffect } from "react";

export function useCrashRecoveryStartup(): void {
  useEffect(() => {
    // No-op: read-only preview does not perform crash recovery
  }, []);
}
