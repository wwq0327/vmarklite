/**
 * Inline Math Editing Store — Stubbed for read-only preview
 */

import { create } from "zustand";

interface InlineMathEditingState {
  editingPos: number | null;
  exitEditing: () => void;
  startEditing: (pos: number, ctx: { forceExit: () => void; getNodePos: () => number | undefined }) => void;
  stopEditing: (pos: number) => void;
  clear: (pos: number) => void;
}

export const useInlineMathEditingStore = create<InlineMathEditingState>(() => ({
  editingPos: null,
  exitEditing: () => {},
  startEditing: () => {},
  stopEditing: () => {},
  clear: () => {},
}));
