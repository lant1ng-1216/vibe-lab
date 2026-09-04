import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 站内代理 GitHub 仓库二进制（如 AI 封面 covers/*.jpg）。
 * 优先 VLAB_GH_TOKEN（私有仓库）；无 token → jsdelivr（public）。
 * GET /api/lab-cover-file?path=covers/<id>.jpg
 */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path || !/^covers\/[\w.-]+\.(jpe?g|png|webp)$/.test(path)) {
    return NextResponse.json({ error: "bad path" }, { status: 400 });
  }
  const tk = process.env.VLAB_GH_TOKEN || process.env.GITHUB_TOKEN || "";

  let bytes: ArrayBuffer | null = null;
  let ctype = "image/jpeg";

  if (tk) {
    const url = `https://api.github.com/repos/lant1ng-1216/vibe-lab/contents/${path}?ref=main`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${tk}`,
        Accept: "application/vnd.github.raw+json",
        "User-Agent": "vibe-lab",
      },
      cache: "no-store",
    });
    if (res.ok) bytes = await res.arrayBuffer();
  }
  if (!bytes) {
    const cdn = `https://cdn.jsdelivr.net/gh/lant1ng-1216/vibe-lab@main/${path}`;
    const res = await fetch(cdn, { cache: "no-store" });
    if (res.ok) bytes = await res.arrayBuffer();
  }
  if (!bytes) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (path.endsWith(".png")) ctype = "image/png";
  else if (path.endsWith(".webp")) ctype = "image/webp";

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": ctype,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}