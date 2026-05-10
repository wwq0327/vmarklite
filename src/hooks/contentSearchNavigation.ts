/**
 * Content Search Navigation — Stubbed for read-only preview
 *
 * Read-only preview does not use content search.
 */

interface PendingNav {
  line: number;
  query: string;
}

export function consumePendingContentSearchNav(_tabId: string): PendingNav | null {
  return null;
}

export function openFindBarWithQuery(_query: string): void {}

export function clearPendingContentSearchNav(_tabId: string): void {}
