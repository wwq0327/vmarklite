/**
 * Source Editor Extensions — Stubbed for read-only preview
 *
 * Read-only preview does not have a source editor.
 */

import type { Extension } from "@codemirror/state";

export const lineWrapCompartment = { of: () => ({}) };
export const brVisibilityCompartment = { of: () => ({}) };
export const autoPairCompartment = { of: () => ({}) };
export const lineNumbersCompartment = { of: () => ({}) };
export const shortcutKeymapCompartment = { of: () => ({}) };
export const readOnlyCompartment = { of: () => ({}) };

export function createSourceEditorExtensions(): Extension[] {
  return [];
}
