/**
 * @ gha-workflow-detection-stub
 */

import { describe, it, expect } from "vitest";
import { isWorkflowYaml } from "./index";

describe("isWorkflowYaml", () => {
  it("returns false for stub", () => {
    expect(isWorkflowYaml("")).toBe(false);
  });
});
