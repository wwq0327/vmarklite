/**
 * Editor Store — Stubbed for read-only preview
 *
 * Read-only preview does not use the full editor store.
 * Provides minimal stubs for components that reference it.
 */

import { create } from "zustand";
import type { CursorInfo } from "@/types/cursorSync";

interface EditorState {
  sourceMode: boolean;
  wordWrap: boolean;
  showLineNumbers: boolean;
  focusMode: boolean;
  typewriterMode: boolean;
  diagramPreview: boolean;
  toggleWordWrap: () => void;
  toggleLineNumbers: () => void;
  toggleFocusMode: () => void;
  toggleTypewriterMode: () => void;
  toggleDiagramPreview: () => void;
  toggleSourceMode: () => void;
  setCursorInfo: (cursor: CursorInfo) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  sourceMode: false,
  wordWrap: false,
  showLineNumbers: false,
  focusMode: false,
  typewriterMode: false,
  diagramPreview: false,
  toggleWordWrap: () => set((s) => ({ wordWrap: !s.wordWrap })),
  toggleLineNumbers: () => set((s) => ({ showLineNumbers: !s.showLineNumbers })),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  toggleTypewriterMode: () => set((s) => ({ typewriterMode: !s.typewriterMode })),
  toggleDiagramPreview: () => set((s) => ({ diagramPreview: !s.diagramPreview })),
  toggleSourceMode: () => set((s) => ({ sourceMode: !s.sourceMode })),
  setCursorInfo: () => {},
}));
