"use client";

/**
 * React hook for hydration-safe A/B arm consumption.
 *
 * The arm is intentionally `null` on the server and on the very first client
 * render (which must match the server's HTML), then resolves to the assigned
 * arm in a `useEffect` after mount. This is the standard pattern for avoiding
 * hydration mismatch: the first paint is arm-independent, and the arm-specific
 * branch only appears after the effect runs.
 *
 * Usage pattern for callers:
 *
 *   const arm = useAbVariant(QUIZ_RESULT_VISUAL_V1.id);
 *   // arm === null  -> not yet determined (SSR / first render): render a
 *   //                   neutral/default variant, or nothing arm-specific.
 *   // arm === "A"    -> render retro variant
 *   // arm === "B"    -> render current variant
 *
 * For non-React call sites (event handlers, imperative code), call
 * `getAbArm(experimentId)` from ./assign directly instead.
 *
 * Design reference: docs/visitor-value-measurement.md 論点1
 * ("初期 render は arm 未確定→useEffect で確定").
 */

import { useEffect, useState } from "react";
import { getAbArm } from "./assign";
import type { AbArm } from "./experiments";

/**
 * Returns the assigned arm for `experimentId`, or `null` until it is resolved
 * on the client. Resolution happens once after mount; the returned arm is then
 * stable for this component instance.
 */
export function useAbVariant(experimentId: string): AbArm | null {
  // Always start as null so the first client render matches the server HTML.
  const [arm, setArm] = useState<AbArm | null>(null);

  useEffect(() => {
    setArm(getAbArm(experimentId));
  }, [experimentId]);

  return arm;
}
