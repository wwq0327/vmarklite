/**
 * @ gha-workflow-snapshot-stub
 */

import { describe, it, expect } from "vitest";
import { renderXyflowSnapshot } from "./renderXyflowSnapshot";

describe("renderXyflowSnapshot", () => {
  it("returns null for stub", async () => {
    const result = await renderXyflowSnapshot("");
    expect(result).toBeNull();
  });
});
