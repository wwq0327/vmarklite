/**
 * Tab Transfer Actions — Stubbed for read-only preview
 */

export function useTabTransferActions() {
  return {
    transferTab: () => {},
    canTransfer: false,
  };
}

export async function restoreTransferredTab(
  _windowLabel: string,
  _createdWindowLabel: string,
  _transferData: unknown
): Promise<void> {}
