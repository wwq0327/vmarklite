/**
 * Media Popup Store — Stubbed for read-only preview
 */

import { create } from "zustand";

export type MediaNodeType = "image" | "block_image" | "inline_image" | "video" | "audio";

interface MediaPopupState {
  openPopup: (arg: {
    mediaSrc: string;
    mediaAlt: string;
    mediaNodePos: number;
    mediaNodeType: MediaNodeType;
    mediaDimensions: { width: number; height: number } | null;
    anchorRect: { top: number; left: number; bottom: number; right: number };
  }) => void;
}

export const useMediaPopupStore = create<MediaPopupState>(() => ({
  openPopup: () => {},
}));
