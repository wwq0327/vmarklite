/**
 * Tab Cleanup — Stubbed for read-only preview
 *
 * Read-only preview does not use tab cleanup.
 */

import { useEffect } from "react";

export function useTabCleanup(): void {
  useEffect(() => {}, []);
}

export function cleanupTabState(_tabId: string): void {}
