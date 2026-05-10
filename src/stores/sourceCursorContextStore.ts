/**
 * Source Cursor Context Store — Stubbed for read-only preview
 *
 * Read-only preview does not use source cursor context.
 * Provides minimal stubs for UniversalToolbar component.
 */

import { create } from "zustand";

interface SourceCursorContextState {
  context: unknown;
  editorView: unknown;
}

export const useSourceCursorContextStore = create<SourceCursorContextState>(() => ({
  context: null,
  editorView: null,
}));
