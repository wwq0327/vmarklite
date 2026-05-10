/**
 * Schema Migration — Stubbed for read-only preview
 *
 * Read-only preview does not perform schema migrations.
 */

export const SCHEMA_VERSION = 2;

export function canMigrate(): boolean {
  return true;
}

export function migrateSession<T>(): T {
  return {} as T;
}

export function needsMigration(): boolean {
  return false;
}
