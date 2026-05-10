/**
 * MCP Health Store — Stubbed for read-only preview
 */

import { create } from "zustand";

interface McpHealth {
  checkError?: string;
  // Add other health properties as needed
}

interface McpHealthState {
  running: boolean;
  port: number | null;
  loading: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  health: McpHealth | null;
  runHealthCheck: () => void;
  isChecking: boolean;
  version: string | null;
  toolCount: number;
  resourceCount: number;
}

export const useMcpHealthStore = create<McpHealthState>(() => ({
  running: false,
  port: null,
  loading: false,
  error: null,
  start: () => {},
  stop: () => {},
  health: null,
  runHealthCheck: () => {},
  isChecking: false,
  version: null,
  toolCount: 0,
  resourceCount: 0,
}));
