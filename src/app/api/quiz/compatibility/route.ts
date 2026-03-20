/**
 * GET /api/quiz/compatibility
 *
 * Returns compatibility data between two personality type IDs for a given quiz.
 * Currently only supports the "character-personality" quiz.
 */

import { NextResponse } from "next/server";
import characterPersonalityQuiz, {
  getCompatibility,
  isValidCharacterPersonalityTypeId,
} from "@/play/quiz/data/character-personality";

/** Slugs that support the compatibility feature. */
const COMPATIBLE_SLUGS = new Set<string>(["character-personality"]);

/** Cache-Control header value for compatibility data (immutable per type pair). */
const CACHE_CONTROL =
  "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const typeA = searchParams.get("typeA");
  const typeB = searchParams.get("typeB");

  // Validate slug
  if (!slug || !COMPATIBLE_SLUGS.has(slug)) {
    return NextResponse.json(
      {
        error: `slug query parameter must be one of: ${[...COMPATIBLE_SLUGS].join(", ")}`,
      },
      { status: 400 },
    );
  }

  // Validate typeA and typeB presence
  if (!typeA || !typeB) {
    return NextResponse.json(
      { error: "typeA and typeB query parameters are required" },
      { status: 400 },
    );
  }

  // Validate typeA and typeB are valid character personality type IDs
  if (!isValidCharacterPersonalityTypeId(typeA)) {
    return NextResponse.json(
      { error: `typeA "${typeA}" is not a valid type ID for quiz "${slug}"` },
      { status: 400 },
    );
  }

  if (!isValidCharacterPersonalityTypeId(typeB)) {
    return NextResponse.json(
      { error: `typeB "${typeB}" is not a valid type ID for quiz "${slug}"` },
      { status: 400 },
    );
  }

  // Look up compatibility data
  const compatibility = getCompatibility(typeA, typeB);

  if (!compatibility) {
    return NextResponse.json(
      {
        error: `No compatibility data found for types "${typeA}" and "${typeB}"`,
      },
      { status: 404 },
    );
  }

  // Retrieve title and icon for each type from quiz results
  const results = characterPersonalityQuiz.results;
  const myTypeResult = results.find((r) => r.id === typeA);
  const friendTypeResult = results.find((r) => r.id === typeB);

  return NextResponse.json(
    {
      label: compatibility.label,
      description: compatibility.description,
      myType: {
        title: myTypeResult?.title ?? typeA,
        icon: myTypeResult?.icon ?? "",
      },
      friendType: {
        title: friendTypeResult?.title ?? typeB,
        icon: friendTypeResult?.icon ?? "",
      },
    },
    {
      headers: {
        "Cache-Control": CACHE_CONTROL,
      },
    },
  );
}
