/**
 * Public surface of the A/B assignment module.
 *
 * - Experiment registry & types: ./experiments
 * - SSR-safe arm assignment (imperative): ./assign (getAbArm)
 * - Hydration-safe React hook: ./useAbVariant (useAbVariant)
 *
 * This module only decides and returns arms. GA reporting and rendering live
 * elsewhere and depend on this module (関心の分離 / coding rule #3).
 */

export type { AbArm, AbArmDefinition, AbExperiment } from "./experiments";
export {
  AB_ARMS,
  AB_EXPERIMENTS,
  QUIZ_RESULT_VISUAL_V1,
  getExperiment,
} from "./experiments";
export { AB_STORAGE_KEY, getAbArm } from "./assign";
export { useAbVariant } from "./useAbVariant";
