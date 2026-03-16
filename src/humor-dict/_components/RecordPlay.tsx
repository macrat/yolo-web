"use client";

import { useEffect, useRef } from "react";
import { useAchievements } from "@/lib/achievements/useAchievements";

/**
 * Side-effect-only component: records a "humor-dictionary" play in the
 * achievement system when mounted.
 *
 * The entire humor dictionary is treated as a single content ID, so any
 * entry page visit counts as one daily record for "humor-dictionary".
 * Renders nothing visible.
 */
export default function RecordPlay() {
  const { recordPlay } = useAchievements();
  const hasRecorded = useRef(false);

  useEffect(() => {
    if (!hasRecorded.current) {
      hasRecorded.current = true;
      recordPlay("humor-dictionary");
    }
  }, [recordPlay]);

  return null;
}
