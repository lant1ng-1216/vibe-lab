import { NextRequest, NextResponse } from "next/server";
import { fetchReadme } from "@/lib/readme";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const link = req.nextUrl.searchParams.get("link");
  if (!link) return NextResponse.json({ markdown: null }, { status: 400 });
  const data = await fetchReadme(link);
  if (!data) return NextResponse.json({ markdown: null });
  return NextResponse.json(data);
}