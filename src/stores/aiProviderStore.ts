/**
 * AI Provider Store — Stubbed for read-only preview
 */

import { create } from "zustand";

interface CliProvider {
  type: string;
  available: boolean;
}

interface RestProvider {
  type: string;
  name: string;
  available: boolean;
}

interface AiProviderState {
  cliProviders: CliProvider[];
  restProviders: RestProvider[];
  activeProvider: string | null;
  detecting: boolean;
  detectProviders: () => void;
  activateProvider: (id: string) => void;
  updateRestProvider: (providerType: string, updates: Record<string, string>) => void;
}

export const useAiProviderStore = create<AiProviderState>(() => ({
  cliProviders: [],
  restProviders: [],
  activeProvider: null,
  detecting: false,
  detectProviders: () => {},
  activateProvider: () => {},
  updateRestProvider: () => {},
}));
