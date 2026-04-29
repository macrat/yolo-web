import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return new NextResponse("This feed has been permanently removed.", {
    status: 410,
  });
}
