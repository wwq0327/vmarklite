/**
 * Search Store — Stubbed for read-only preview
 */

import { create } from "zustand";

interface SearchState {
  isOpen: boolean;
  close: () => void;
}

export const useSearchStore = create<SearchState>(() => ({
  isOpen: false,
  close: () => {},
}));
