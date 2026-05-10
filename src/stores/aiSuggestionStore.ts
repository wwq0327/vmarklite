/**
 * AI Suggestion Store — Stubbed for read-only preview
 */

import { create } from "zustand";

interface AiSuggestionState {
  clearForTab: (tabId: string) => void;
}

export const useAiSuggestionStore = create<AiSuggestionState>(() => ({
  clearForTab: () => {},
}));
