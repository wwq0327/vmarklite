/**
 * Image Context Menu Store — Stubbed for read-only preview
 *
 * Read-only preview does not use image context menus.
 */

import { create } from "zustand";

interface ImageContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  closeMenu: () => void;
  openMenu: (arg: {
    position: { x: number; y: number };
    imageSrc: string;
    imageNodePos: number;
  }) => void;
}

export const useImageContextMenuStore = create<ImageContextMenuState>(() => ({
  isOpen: false,
  position: null,
  closeMenu: () => {},
  openMenu: () => {},
}));
