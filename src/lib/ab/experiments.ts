/**
 * A/B experiment registry.
 *
 * Single source of truth for every A/B experiment running on the site.
 * This module is pure data + types: it has no side effects, reads nothing
 * from the environment, and never calls Math.random(). Arm assignment lives
 * in `./assign.ts`; GA reporting lives in `@/lib/analytics`. Keeping the
 * registry isolated lets both the client (assignment) and the docs/SQL side
 * (analysis) refer to the same experiment ids and labels.
 *
 * Design reference: docs/visitor-value-measurement.md 論点1 / 論点4.
 */

/**
 * Neutral arm labels. We deliberately avoid value-laden names like
 * "old"/"new" to prevent analysis bias (docs/visitor-value-measurement.md
 * 論点1: "arm ラベルは中立に A/B"). Which arm maps to which visual treatment
 * is recorded in the experiment's `arms` descriptions and the design doc's
 * mapping table, not in the label itself.
 */
export type AbArm = "A" | "B";

/** All valid arm labels, in canonical order. */
export const AB_ARMS: readonly AbArm[] = ["A", "B"] as const;

/** Describes one arm of an experiment. */
export interface AbArmDefinition {
  /** Neutral label sent to GA4 as `ab_variant`. */
  readonly label: AbArm;
  /**
   * Allocation weight (relative). Arms are selected in proportion to their
   * weights. For an even 50/50 split both arms use the same weight.
   */
  readonly weight: number;
  /**
   * Human-readable note describing what this arm renders. For analysis only;
   * never sent to GA or used in assignment logic.
   */
  readonly description: string;
}

/** A single A/B experiment definition. */
export interface AbExperiment {
  /** Stable experiment identifier, sent to GA4 as `experiment_id`. */
  readonly id: string;
  /** Short human-readable summary of what is being compared. */
  readonly description: string;
  /** The arms of this experiment. Must be non-empty and weights must be > 0. */
  readonly arms: readonly AbArmDefinition[];
}

/**
 * The first real experiment: inline quiz result visual language.
 * Arm A and Arm B are an even 50/50 split. The retro (emoji/colorful) vs
 * minimal mapping is documented in docs/visitor-value-measurement.md 論点6.
 */
export const QUIZ_RESULT_VISUAL_V1: AbExperiment = {
  id: "quiz_result_visual_v1",
  description:
    "Inline quiz result visual language: retro (emoji/colorful/centered) vs minimal.",
  arms: [
    {
      label: "A",
      weight: 1,
      description:
        "Retro visual language restored from d804b5d1 (emoji markers, type-color, centered, bold).",
    },
    {
      label: "B",
      weight: 1,
      description:
        "Current minimal visual language (accent rule, left-aligned headings).",
    },
  ],
};

/**
 * The experiment registry, keyed by experiment id. Add future experiments
 * here so that assignment and analysis share one source of truth.
 */
export const AB_EXPERIMENTS: Readonly<Record<string, AbExperiment>> = {
  [QUIZ_RESULT_VISUAL_V1.id]: QUIZ_RESULT_VISUAL_V1,
};

/** Look up an experiment by id. Returns undefined if it is not registered. */
export function getExperiment(experimentId: string): AbExperiment | undefined {
  return AB_EXPERIMENTS[experimentId];
}
