/**
 * Block Math Editing Store — Stubbed for read-only preview
 */

import { create } from "zustand";

interface BlockMathEditingState {
  editingPos: number | null;
  originalContent: string | null;
  exitEditing: () => void;
  startEditing: (editingPos: number, originalContent: string) => void;
}

export const useBlockMathEditingStore = create<BlockMathEditingState>(() => ({
  editingPos: null,
  originalContent: null,
  exitEditing: () => {},
  startEditing: () => {},
}));
