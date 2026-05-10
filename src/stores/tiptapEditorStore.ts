/**
 * Tiptap Editor Store — Stubbed for read-only preview
 *
 * Read-only preview does not use the full Tiptap editor store.
 * Provides minimal stubs for TiptapEditor component.
 */

import { create } from "zustand";
import type { EditorView } from "@tiptap/pm/view";

interface TiptapEditorState {
  editor: unknown;
  state: unknown;
  context: unknown;
  setContext: (context: unknown, view: EditorView) => void;
  setEditor: (editor: unknown) => void;
  clear: () => void;
}

export const useTiptapEditorStore = create<TiptapEditorState>(() => ({
  editor: null,
  state: null,
  context: null,
  setContext: () => {},
  setEditor: () => {},
  clear: () => {},
}));
