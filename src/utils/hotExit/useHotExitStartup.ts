/**
 * Hot Exit Startup Hook - Stubbed for read-only preview
 *
 * In read-only preview mode, there are no unsaved changes to restore.
 * This is a no-op implementation.
 */

import { useEffect, useRef } from 'react';

/** No-op implementation - read-only preview has no dirty state to restore */
export function useHotExitStartup() {
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    // No-op: read-only preview has no session to restore
  }, []);
}
