/**
 * Editor
 *
 * Purpose: Format-registry dispatcher for read-only preview mode.
 *   Reads the active tab's filePath, calls dispatchEditor() to resolve
 *   a FormatConfig, and mounts the format's wysiwygComponent.
 *
 * Pipeline: useActiveTabId → useTabStore.findTabById → dispatchEditor →
 *   FormatConfig.kind === "wysiwyg" ? <wysiwygComponent />
 *
 * Key decisions:
 *   - Markdown rendering surface lives in src/lib/formats/adapters/markdown.tsx
 *     as MarkdownEditorSurface; this dispatcher pulls the component reference
 *     out of the FormatConfig so the registry is the single source of truth.
 *   - Source mode and SplitPaneEditor removed for read-only preview mode.
 *
 * @coordinates-with src/lib/formats/registry.ts — dispatchEditor()
 * @coordinates-with src/lib/formats/adapters/markdown.tsx — MarkdownEditorSurface
 * @module components/Editor/Editor
 */
import { useActiveTabId } from "@/hooks/useDocumentState";
import { useTabStore } from "@/stores/tabStore";
import { useUnifiedMenuCommands } from "@/hooks/useUnifiedMenuCommands";
import { dispatchEditor } from "@/lib/formats/registry";
import { MarkdownEditorSurface } from "@/lib/formats/adapters/markdown";
import "./editor.css";
import "./heading-picker.css";
import "@/styles/popup-shared.css";

/** Top-level editor dispatcher. Resolves the active tab's FormatConfig and
 *  mounts the matching surface (wysiwyg only for read-only preview). */
export function Editor() {
  const tabId = useActiveTabId();
  /* v8 ignore next 4 -- @preserve null-tab fallback path */
  const tab = useTabStore((s) =>
    tabId ? (s.findTabById?.(tabId) ?? null) : null,
  );
  const filePath = tab?.filePath ?? null;
  const formatConfig = dispatchEditor(filePath);

  useUnifiedMenuCommands();

  const key = `${tabId ?? "no-tab"}-${formatConfig.id}`;

  const Surface = formatConfig.wysiwygComponent ?? MarkdownEditorSurface;
  return <Surface key={key} tabId={tabId ?? ""} />;
}

export default Editor;
