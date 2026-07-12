import { describe, it, expect } from "vitest";
import {
  AB_ARMS,
  AB_EXPERIMENTS,
  getExperiment,
  type AbArm,
} from "@/lib/ab/experiments";

describe("experiment registry", () => {
  it("defines the canonical neutral arm labels", () => {
    expect(AB_ARMS).toEqual(["A", "B"]);
  });

  it("getExperiment returns undefined for an unknown id", () => {
    expect(getExperiment("does_not_exist")).toBeUndefined();
  });

  it("has no registered experiments (quiz_result_visual_v1 removed in cycle-279 C1)", () => {
    expect(Object.keys(AB_EXPERIMENTS)).toEqual([]);
  });

  it("every registered experiment is internally consistent", () => {
    const validLabels = new Set<AbArm>(AB_ARMS);
    for (const [key, experiment] of Object.entries(AB_EXPERIMENTS)) {
      // Registry key must match the experiment's own id.
      expect(experiment.id).toBe(key);
      // At least one arm, all weights positive, all labels valid & unique.
      expect(experiment.arms.length).toBeGreaterThan(0);
      const seen = new Set<AbArm>();
      for (const arm of experiment.arms) {
        expect(validLabels.has(arm.label)).toBe(true);
        expect(arm.weight).toBeGreaterThan(0);
        expect(seen.has(arm.label)).toBe(false);
        seen.add(arm.label);
      }
    }
  });
});
