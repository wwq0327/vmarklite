/**
 * MCP Health Check — Stubbed for read-only preview
 */

export function useMcpHealthCheck(): {
  runHealthCheck: () => void;
  isChecking: boolean;
  version: string | null;
  toolCount: number;
  resourceCount: number;
} {
  return {
    runHealthCheck: () => {},
    isChecking: false,
    version: null,
    toolCount: 0,
    resourceCount: 0,
  };
}
