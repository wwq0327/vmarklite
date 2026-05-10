/**
 * History Recovery Hook — Stubbed for read-only preview
 *
 * Read-only preview does not use history recovery.
 */

import { useEffect } from "react";

export function useHistoryRecovery(): void {
  useEffect(() => {}, []);
}

export function clearAllHistory(): void {}
export function clearWorkspaceHistory(): void {}
