/**
 * Link Open Helpers - Simplified for read-only preview
 *
 * Purpose: Classify link hrefs and resolve relative file links against the
 *   currently focused document so cross-file links can open in a tab.
 *
 * @module utils/linkOpen
 */

import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useTabStore } from "@/stores/tabStore";
import { linkPopupError } from "@/utils/debug";
import { dirname, join } from "@tauri-apps/api/path";

export type LinkKind = "fragment" | "external" | "filepath";

// Match a URI scheme: at least 2 alphanumeric chars before `:` so Windows
// drive letters (`C:`) are NOT classified as schemes.
const URI_SCHEME_RE = /^[a-z][a-z0-9+.-]+:/i;

// Match a Windows absolute path (drive letter + `\` or `/`).
const WINDOWS_DRIVE_RE = /^[A-Za-z]:[\\/]/;

/**
 * Classify an href into one of three buckets so the caller can route it to
 * the right open path.
 */
export function classifyHref(href: string): LinkKind {
  if (!href) return "filepath";
  if (href.startsWith("#")) return "fragment";
  if (URI_SCHEME_RE.test(href)) return "external";
  return "filepath";
}

/**
 * Resolve a relative markdown URL against a source file path.
 */
async function resolveMarkdownUrl(href: string, sourcePath: string): Promise<string> {
  const sourceDir = await dirname(sourcePath);
  return join(sourceDir, href);
}

/**
 * Open a filepath-kind href, emitting open-file to create a new tab.
 * Returns true on successful emit, false if the link cannot be resolved.
 */
export async function openFilepathLink(href: string): Promise<boolean> {
  if (!href) return false;

  const currentWindow = getCurrentWebviewWindow();
  const activeTab = useTabStore.getState().getActiveTab(currentWindow.label);
  const sourcePath = activeTab?.filePath ?? null;

  // Strip fragment up front
  const hashIdx = href.indexOf("#");
  const pathPart = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  if (!pathPart) return false;

  let absolutePath: string;
  if (WINDOWS_DRIVE_RE.test(pathPart)) {
    // Windows absolute path — pass through
    absolutePath = pathPart.replace(/\\/g, "/");
  } else if (sourcePath) {
    absolutePath = await resolveMarkdownUrl(pathPart, sourcePath);
  } else if (pathPart.startsWith("/")) {
    // POSIX absolute path: pass through
    absolutePath = pathPart;
  } else {
    // No source to resolve against
    return false;
  }

  if (!absolutePath) return false;

  try {
    await currentWindow.emit("open-file", { path: absolutePath });
    return true;
  } catch (error) {
    linkPopupError("Failed to emit open-file:", error);
    return false;
  }
}
