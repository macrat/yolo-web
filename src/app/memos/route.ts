import { NextResponse } from "next/server";
import { GITHUB_MEMO_LIST_URL } from "@/memos/_lib/github-redirect";

export const dynamic = "force-dynamic";

/** Redirect visitors to the archived memo directory on GitHub. */
export function GET() {
  return NextResponse.redirect(GITHUB_MEMO_LIST_URL, 301);
}
