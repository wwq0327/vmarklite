/**
 * Math Preview View — Stubbed for read-only preview
 */

export interface MathPreviewView {
  show: (latex: string, rect: { top: number; left: number; bottom: number; right: number }, dom?: HTMLElement | null) => void;
  hide: () => void;
  updateContent: (latex: string) => void;
}

export function getMathPreviewView(): MathPreviewView {
  return {
    show: () => {},
    hide: () => {},
    updateContent: () => {},
  };
}
