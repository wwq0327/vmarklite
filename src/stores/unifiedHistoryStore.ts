/**
 * Unified History Store — Stubbed for read-only preview
 */

import { create } from "zustand";

interface UnifiedHistoryState {
  clearDocument: (tabId: string) => void;
  clearForTab: (tabId: string) => void;
}

export const useUnifiedHistoryStore = create<UnifiedHistoryState>(() => ({
  clearDocument: () => {},
  clearForTab: () => {},
}));
