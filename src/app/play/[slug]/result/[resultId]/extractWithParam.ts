import { isValidMusicTypeId } from "@/play/quiz/data/music-personality";

/**
 * Extract the "with" query parameter for compatibility display.
 * Returns a valid type ID or undefined.
 * Validates the param against the correct type set for each quiz slug.
 *
 * Note: character-personality has its own dedicated route at
 * /play/character-personality/result/[resultId], so it is not handled here.
 */
export function extractWithParam(
  resolvedSearchParams:
    | Record<string, string | string[] | undefined>
    | undefined,
  slug: string,
  resultId: string,
): string | undefined {
  if (!resolvedSearchParams) return undefined;
  const withParam =
    typeof resolvedSearchParams.with === "string"
      ? resolvedSearchParams.with
      : undefined;
  if (slug === "music-personality") {
    if (
      withParam &&
      isValidMusicTypeId(withParam) &&
      isValidMusicTypeId(resultId)
    ) {
      return withParam;
    }
    return undefined;
  }
  return undefined;
}
