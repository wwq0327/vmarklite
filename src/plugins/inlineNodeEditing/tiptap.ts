/**
 * Inline Node Editing - Stubbed for read-only preview
 *
 * This plugin tracked editing state for inline nodes (math, etc.).
 * Removed for read-only preview mode.
 */

import { PluginKey } from "@tiptap/pm/state";

export const inlineNodeEditingKey = new PluginKey("inlineNodeEditing");

export function isInlineEditing(): boolean {
  return false;
}
