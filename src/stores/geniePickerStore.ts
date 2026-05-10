/**
 * Genie Picker Store — Stubbed for read-only preview
 *
 * Read-only preview does not use AI Genies.
 * Provides minimal stubs for UniversalToolbar component.
 */

import { create } from "zustand";

interface GeniePickerState {
  openPicker: () => void;
}

export const useGeniePickerStore = create<GeniePickerState>(() => ({
  openPicker: () => {},
}));
