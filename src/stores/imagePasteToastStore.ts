/**
 * Image Paste Toast Store — Stubbed for read-only preview
 */

import { create } from "zustand";

interface ImagePasteToastState {
  isOpen: boolean;
  hideToast: () => void;
}

export const useImagePasteToastStore = create<ImagePasteToastState>(() => ({
  isOpen: false,
  hideToast: () => {},
}));
