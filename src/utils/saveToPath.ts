/**
 * Save Document to Path - Stubbed for read-only preview
 *
 * Read-only preview does not support saving documents.
 */

export async function saveToPath(
  _tabId: string,
  _path: string,
  _content: string,
  _saveType: "manual" | "auto" = "manual"
): Promise<boolean> {
  // No-op: read-only preview does not save documents
  return false;
}

/** Reset session flags (stub) */
export function __resetSessionFlags(): void {}
