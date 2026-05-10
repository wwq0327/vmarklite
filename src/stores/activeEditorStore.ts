/**
 * Active Editor Store — Stubbed for read-only preview
 *
 * Read-only preview does not use the active editor store.
 * Provides minimal stubs for TiptapEditor component.
 */

import { create } from "zustand";

interface ActiveEditorState {
  activeWysiwygEditor: unknown;
  activeSourceView: unknown;
  setActiveWysiwygEditor: (editor: unknown, tabId: string | undefined) => void;
  clearWysiwygEditorIfMatch: (editor: unknown) => void;
}

export const useActiveEditorStore = create<ActiveEditorState>(() => ({
  activeWysiwygEditor: null,
  activeSourceView: null,
  setActiveWysiwygEditor: () => {},
  clearWysiwygEditorIfMatch: () => {},
}));
