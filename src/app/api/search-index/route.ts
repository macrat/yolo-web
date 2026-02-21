import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/search/build-index";

/**
 * Statically generated at build time.
 * If this causes build issues, remove force-static and rely on
 * Cache-Control only (see M-1 review note).
 */
export const dynamic = "force-static";

export async function GET() {
  const index = buildSearchIndex();

  return NextResponse.json(index, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
