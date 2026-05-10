/**
 * MCP Server Hook — Stubbed for read-only preview
 *
 * Read-only preview does not use MCP.
 */

export function useMcpServer(): {
  running: boolean;
  port: number | null;
  loading: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
} {
  return {
    running: false,
    port: null,
    loading: false,
    error: null,
    start: () => {},
    stop: () => {},
  };
}
