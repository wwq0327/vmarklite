/**
 * Source Lint — Stubbed for read-only preview
 *
 * Read-only preview does not use source lint.
 */

export function createSourceLintExtension(): never {
  throw new Error("Source lint is not supported in read-only preview");
}

export function triggerLintRefresh(): void {}
