/**
 * Hot Exit Capture Hook - Stubbed for read-only preview
 *
 * In read-only preview mode, there are no unsaved changes to capture.
 * This is a no-op implementation.
 */

import { useEffect } from 'react';

/** No-op implementation - read-only preview has no dirty state to capture */
export function useHotExitCapture() {
  useEffect(() => {
    // No-op: read-only preview has no unsaved changes
  }, []);
}
