/**
 * Frontmatter Panel NodeView — Stubbed for read-only preview
 */

import type { Node as PMNode } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";
import type { NodeView } from "@tiptap/pm/view";

export function createFrontmatterNodeView(
  _node: PMNode,
  _view: EditorView,
  _getPos: () => number | undefined
): NodeView {
  const dom = document.createElement("div");
  dom.setAttribute("data-type", "frontmatter");
  dom.setAttribute("contenteditable", "false");
  return {
    dom,
    update: () => true,
    destroy: () => {},
  };
}
