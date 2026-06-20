import { describe, it, expect } from "vitest";
import {
  AB_ARMS,
  AB_EXPERIMENTS,
  QUIZ_RESULT_VISUAL_V1,
  getExperiment,
  type AbArm,
} from "@/lib/ab/experiments";

describe("experiment registry", () => {
  it("defines the canonical neutral arm labels", () => {
    expect(AB_ARMS).toEqual(["A", "B"]);
  });

  it("registers quiz_result_visual_v1 with the expected id", () => {
    expect(QUIZ_RESULT_VISUAL_V1.id).toBe("quiz_result_visual_v1");
    expect(AB_EXPERIMENTS[QUIZ_RESULT_VISUAL_V1.id]).toBe(
      QUIZ_RESULT_VISUAL_V1,
    );
  });

  it("getExperiment returns the experiment for a known id", () => {
    expect(getExperiment("quiz_result_visual_v1")).toBe(QUIZ_RESULT_VISUAL_V1);
  });

  it("getExperiment returns undefined for an unknown id", () => {
    expect(getExperiment("does_not_exist")).toBeUndefined();
  });

  it("quiz_result_visual_v1 has exactly the A and B arms", () => {
    const labels = QUIZ_RESULT_VISUAL_V1.arms.map((arm) => arm.label);
    expect(labels).toEqual(["A", "B"]);
  });

  it("quiz_result_visual_v1 is an even 50/50 split", () => {
    const weights = QUIZ_RESULT_VISUAL_V1.arms.map((arm) => arm.weight);
    expect(weights[0]).toBe(weights[1]);
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
