/**
 * Markmap — Stubbed for read-only preview
 */

export function useMarkmap(): unknown {
  return null;
}

export function markmapExport(): unknown {
  return null;
}

export function updateMarkmapTheme(_isDark: boolean): void {}

export function renderMarkmapToElement(_svgEl: SVGSVGElement, _content: string): Promise<{ fit: () => void } | null> {
  return Promise.resolve({ fit: () => {} });
}

