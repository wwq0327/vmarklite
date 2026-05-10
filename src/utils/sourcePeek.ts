/**
 * Source Peek — Stubbed for read-only preview
 *
 * Read-only preview does not support source peek editing.
 */

export type SourcePeekRange = { from: number; to: number };

export const COMPOUND_BLOCK_TYPES = new Set<string>();

export function getExpandedSourcePeekRange(): SourcePeekRange {
  return { from: 0, to: 0 };
}

export function serializeSourcePeekRange(_state: unknown, _range: SourcePeekRange): string {
  return "";
}

export function createSourcePeekSlice(): never {
  throw new Error("Source peek is not supported in read-only preview");
}

export function applySourcePeekMarkdown(): boolean {
  return false;
}
