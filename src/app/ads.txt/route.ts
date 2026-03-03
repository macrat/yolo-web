import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const adsText = `google.com, pub-3422033280057965, DIRECT, f08c47fec0942fa0`;

  return new NextResponse(adsText, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
