/**
 * MCP Clients Hook — Stubbed for read-only preview
 *
 * Read-only preview does not use MCP.
 */

export interface McpClient {
  id: string;
  name: string;
  version: string;
}

export function useMcpClients(): McpClient[] {
  return [];
}
