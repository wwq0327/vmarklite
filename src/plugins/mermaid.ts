/**
 * Mermaid Plugin — Stubbed for read-only preview
 *
 * Read-only preview does not use Mermaid.
 */

export const mermaidExtension = null;

export function updateMermaidFontSize(): void {}

export function updateMermaidTheme(_isDark: boolean): Promise<boolean> {
  return Promise.resolve(false);
}

export function renderMermaid(_content: string): Promise<string> {
  return Promise.resolve("");
}
