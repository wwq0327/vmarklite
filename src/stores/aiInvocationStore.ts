/**
 * AI Invocation Store — Stubbed for read-only preview
 */

import { create } from "zustand";

interface AiInvocationState {
  isRunning: boolean;
  elapsedSeconds: number;
  error: string | null;
  showSuccess: boolean;
  hasActiveStatus: boolean;
  running: { id: string; label: string } | null;
  loading: boolean;
  dismissError: () => void;
  cancel: () => void;
}

export const useAiInvocationStore = create<AiInvocationState>(() => ({
  isRunning: false,
  elapsedSeconds: 0,
  error: null,
  showSuccess: false,
  hasActiveStatus: false,
  running: null,
  loading: false,
  dismissError: () => {},
  cancel: () => {},
}));
