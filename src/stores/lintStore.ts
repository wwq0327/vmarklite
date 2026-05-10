/**
 * Lint Store — Stubbed for read-only preview
 *
 * Read-only preview does not use linting.
 */

import { create } from "zustand";

interface LintState {
  diagnosticsByTab: Record<string, unknown[]>;
  selectedIndexByTab: Record<string, number>;
  selectNext: (tabId: string) => void;
  selectPrev: (tabId: string) => void;
  clearDiagnostics: (tabId: string) => void;
  runYamlLint: (tabId: string) => void;
  runLint: (tabId: string) => void;
  runLinkCheck: (tabId: string) => void;
}

export const useLintStore = create<LintState>(() => ({
  diagnosticsByTab: {},
  selectedIndexByTab: {},
  selectNext: () => {},
  selectPrev: () => {},
  clearDiagnostics: () => {},
  runYamlLint: () => {},
  runLint: () => {},
  runLinkCheck: () => {},
}));
