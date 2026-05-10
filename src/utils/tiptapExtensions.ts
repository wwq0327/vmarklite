/**
 * Tiptap Extensions Configuration — Read-Only Preview Mode
 *
 * Purpose: Assembles the Tiptap extension stack for VMark's WYSIWYG read-only preview.
 *
 * Key decisions:
 *   - StarterKit is used as base but with several nodes overridden
 *     (heading, paragraph, codeBlock, etc.) to add sourceLine attributes
 *   - Extensions are loaded eagerly (not lazy) since WYSIWYG is the default mode
 *   - Link extension configured with openOnClick:false
 *   - Bold/Italic replaced with CJK-aware versions (lookbehind regexes)
 *   - Custom marks (highlight, underline, sub/superscript) registered here
 *   - Only rendering extensions — all editing/paste/search/multi-cursor extensions removed
 *   - Table of contents (tocExtension) for [TOC] inline navigation
 *
 * @coordinates-with markdownPipeline/ — schema nodes must match pipeline converters
 * @module utils/tiptapExtensions
 */

import type { Extensions } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  HeadingWithSourceLine,
  ParagraphWithSourceLine,
  CodeBlockWithSourceLine,
  BlockquoteWithSourceLine,
  BulletListWithSourceLine,
  OrderedListWithSourceLine,
  HorizontalRuleWithSourceLine,
  TableRowWithSourceLine,
} from "@/plugins/shared/sourceLineNodes";
import { TableWithScrollWrapper } from "@/plugins/tableScroll";
import { tableScrollFreezeExtension } from "@/plugins/tableScroll/scrollFreeze";
import { imageViewExtension } from "@/plugins/imageView/tiptap";
import { blockImageExtension } from "@/plugins/blockImage/tiptap";
import { codePreviewExtension } from "@/plugins/codePreview/tiptap";
import { tableUIExtension } from "@/plugins/tableUI/tiptap";
import { highlightExtension } from "@/plugins/highlight/tiptap";
import { subscriptExtension, superscriptExtension } from "@/plugins/subSuperscript/tiptap";
import { alertBlockExtension } from "@/plugins/alertBlock/tiptap";
import { detailsBlockExtension, detailsSummaryExtension } from "@/plugins/detailsBlock/tiptap";
import { mathInlineExtension } from "@/plugins/latex/tiptapInlineMath";
import { footnotePopupExtension } from "@/plugins/footnotePopup/tiptap";
import { footnoteDefinitionExtension, footnoteReferenceExtension } from "@/plugins/footnotePopup/tiptapNodes";
import { AlignedTableCell, AlignedTableHeader } from "@/components/Editor/alignedTableNodes";
import {
  frontmatterExtension,
  htmlBlockExtension,
  htmlInlineExtension,
  linkDefinitionExtension,
  wikiLinkExtension,
} from "@/plugins/markdownArtifacts";
import { CJKLetterSpacing } from "@/plugins/cjkLetterSpacing";
import { CJKBold, CJKItalic } from "@/plugins/markInputRules/tiptap";
import { tocExtension } from "@/plugins/tableOfContents/tiptap";

/**
 * Creates the array of Tiptap extensions for the WYSIWYG read-only preview.
 * This is a pure factory function with no React dependencies.
 *
 * Only rendering extensions are included — all editing extensions have been removed
 * (autoPair, multiCursor, search, paste handlers, link popups, AI suggestions, etc.)
 */
export function createTiptapExtensions(): Extensions {
  return [
    StarterKit.configure({
      // We parse/serialize markdown ourselves.
      // Keep Tiptap defaults for schema names and commands.
      listItem: false,
      underline: false,
      // Disable bold/italic — replaced with CJK-aware versions below
      bold: false,
      italic: false,
      // Disable nodes replaced with sourceLine-enabled versions
      heading: false,
      paragraph: false,
      codeBlock: false,
      blockquote: false,
      bulletList: false,
      orderedList: false,
      horizontalRule: false,
      // Disable StarterKit's link - we use a custom configured one below
      link: false,
    }),
    // Custom Link extension with excludes to prevent nested links and code inside links
    Link.extend({
      excludes: "link code",
    }).configure({
      openOnClick: false,
      // Don't add target="_blank" - it bypasses our click handling
      HTMLAttributes: {
        target: null,
        rel: null,
      },
    }),
    // CJK-aware bold/italic (replaces StarterKit defaults)
    CJKBold,
    CJKItalic,
    // Extended nodes with sourceLine attribute for cursor sync
    HeadingWithSourceLine,
    ParagraphWithSourceLine,
    CodeBlockWithSourceLine,
    BlockquoteWithSourceLine,
    BulletListWithSourceLine,
    OrderedListWithSourceLine,
    HorizontalRuleWithSourceLine,
    highlightExtension,
    subscriptExtension,
    superscriptExtension,
    mathInlineExtension,
    alertBlockExtension,
    detailsSummaryExtension,
    detailsBlockExtension,
    tocExtension,
    wikiLinkExtension,
    linkDefinitionExtension,
    frontmatterExtension,
    htmlInlineExtension,
    htmlBlockExtension,
    footnoteReferenceExtension,
    footnoteDefinitionExtension,
    TableWithScrollWrapper.configure({ resizable: false }),
    TableRowWithSourceLine,
    AlignedTableHeader,
    AlignedTableCell,
    tableUIExtension,
    tableScrollFreezeExtension,
    blockImageExtension,
    imageViewExtension,
    footnotePopupExtension,
    codePreviewExtension,
    CJKLetterSpacing,
  ];
}
