/**
 * YAML Adapter — Stubbed for read-only preview
 *
 * Read-only preview does not use YAML adapter with GHA workflow support.
 */

import type { Extension } from "@codemirror/state";
import type { PreviewRendererProps, SchemaDetector, Validator } from "../types";

export const yamlValidator: Validator = () => [];

export const yamlSchemaDetector: SchemaDetector = () => null;

export function useYamlExtensions(): Extension[] {
  return [];
}

export function YamlPreview(_props: PreviewRendererProps) {
  return null;
}

export function registerYamlFormat(): void {}
