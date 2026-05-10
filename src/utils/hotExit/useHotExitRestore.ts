/**
 * Hot Exit Restore Hook - Stubbed for read-only preview
 *
 * In read-only preview mode, there are no unsaved changes to restore.
 * This is a no-op implementation.
 */

import { useEffect } from 'react';

/** No-op implementation - read-only preview has no dirty state to restore */
export function useHotExitRestore() {
  useEffect(() => {
    // No-op: read-only preview has no unsaved changes to restore
  }, []);
}

/** Stub - restoreMainWindowState is not needed in read-only preview */
export async function restoreMainWindowState(): Promise<void> {
  // No-op
}
