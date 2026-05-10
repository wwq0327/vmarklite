/**
 * Footnote Popup Store — Stubbed for read-only preview
 */

import { create } from "zustand";

interface AnchorRect {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

interface FootnotePopupState {
  isOpen: boolean;
  anchorRect: AnchorRect | null;
  label: string;
  autoFocus: boolean;
  content: string;
  definitionPos: number | null;
  referencePos: number | null;
  closePopup: () => void;
  openPopup: (
    label: string,
    content: string,
    anchorRect: AnchorRect,
    definitionPos: number | null,
    referencePos: number | null,
    autoFocus?: boolean
  ) => void;
  setContent: (content: string) => void;
}

export const useFootnotePopupStore = create<FootnotePopupState>(() => ({
  isOpen: false,
  anchorRect: null,
  label: "",
  autoFocus: false,
  content: "",
  definitionPos: null,
  referencePos: null,
  closePopup: () => {},
  openPopup: () => {},
  setContent: () => {},
}));
