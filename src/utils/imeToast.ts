/**
 * IME-Safe Toast - Simplified for read-only preview
 *
 * In read-only preview, there is no editing, so IME composition is not a concern.
 * This is a pass-through to sonner's toast API with additional type support for `pin`.
 */

import { toast as sonnerToast, type ExternalToast } from "sonner";

interface ImeToastOptions extends ExternalToast {
  pin?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapToast(fn: (...args: any[]) => any) {
  return (message: unknown, options?: ImeToastOptions) => {
    return fn(message, options as ExternalToast);
  };
}

export const imeToast = {
  info: wrapToast(sonnerToast.info),
  success: wrapToast(sonnerToast.success),
  message: wrapToast(sonnerToast.message),
  error: wrapToast(sonnerToast.error),
  warning: wrapToast(sonnerToast.warning),
  loading: wrapToast(sonnerToast.loading),
  dismiss: sonnerToast.dismiss,
};
