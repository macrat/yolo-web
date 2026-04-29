import { NextResponse } from "next/server";
import memoPathMap from "@/memos/_data/memo-path-map.json";
import { buildGitHubMemoFileUrl } from "@/memos/_lib/github-redirect";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Redirect to the archived memo file on GitHub, or return 404 if not found. */
export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const filePath = (memoPathMap as Record<string, string>)[id];

  if (!filePath) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.redirect(buildGitHubMemoFileUrl(filePath), 301);
}
