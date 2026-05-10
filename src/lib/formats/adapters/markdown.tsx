// Markdown format adapter for read-only preview mode.
//
// Registers .md/.markdown/.mdown/.mkd/.mdx as kind="wysiwyg" pointing at
// the markdown rendering surface (Tiptap WYSIWYG only, no source mode).

import { useSettingsStore } from "@/stores/settingsStore";
import { useDocumentId } from "@/hooks/useDocumentState";
import { TiptapEditorInner } from "@/components/Editor/TiptapEditor";
import { HeadingPicker } from "@/components/Editor/HeadingPicker";
import { DropZoneIndicator } from "@/components/Editor/DropZoneIndicator";
import { registerFormat } from "../registry";
import type { FormatConfig } from "../types";

/**
 * MarkdownEditorSurface — the markdown WYSIWYG rendering surface for read-only preview.
 */
export function MarkdownEditorSurface({ tabId }: { tabId: string }) {
  const documentId = useDocumentId();
  const mediaBorderStyle = useSettingsStore((s) => s.markdown.mediaBorderStyle);
  const mediaAlignment = useSettingsStore((s) => s.markdown.mediaAlignment);
  const headingAlignment = useSettingsStore((s) => s.markdown.headingAlignment);
  const htmlRenderingMode = useSettingsStore(
    (s) => s.markdown.htmlRenderingMode,
  );
  const tableFitToWidth = useSettingsStore((s) => s.markdown.tableFitToWidth);

  const editorKey = `${tabId}-doc-${documentId}`;
  /* v8 ignore next -- @preserve tableFitToWidth conditional class appended at runtime */
  const containerClass = `editor-container media-border-${mediaBorderStyle} media-align-${mediaAlignment} heading-align-${headingAlignment}${tableFitToWidth ? " table-fit-to-width" : ""}`;

  return (
    <div className={containerClass} data-html-rendering-mode={htmlRenderingMode}>
      <div className="editor-content" data-active-editor="wysiwyg">
        <TiptapEditorInner key={editorKey} readOnly={true} />
      </div>
      <HeadingPicker />
      <DropZoneIndicator />
    </div>
  );
}

export const markdownFormat: FormatConfig = {
  id: "markdown",
  nameI18nKey: "format.markdown",
  extensions: ["md", "markdown", "mdown", "mkd", "mdx"],
  kind: "wysiwyg",
  wysiwygComponent: MarkdownEditorSurface,
  adapters: {
    saveDialogFilters: [
      { name: "Markdown", extensions: ["md", "markdown", "mdown", "mkd", "mdx"] },
    ],
    untitledExtension: "md",
    exportEnabled: true,
    findEnabled: false,
    searchAdapter: "tiptap",
    contentSearchIndexed: true,
    readOnlyDefault: true,
    reloadPolicy: "reload",
    menuPolicy: {
      sourceWysiwygToggle: false,
      cjkFormatActions: true,
      insertBlockActions: false,
      paragraphFormatting: true,
    },
    closeSavePolicy: "markdown-default",
  },
};

export function registerMarkdownFormat(): void {
  registerFormat(markdownFormat);
}
