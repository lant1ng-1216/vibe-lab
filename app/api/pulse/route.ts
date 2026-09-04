import { NextResponse } from "next/server";
import { pulseNow } from "@/lib/pulse";

export const dynamic = "force-dynamic"; // 不做静态缓存：每次请求实时计算

/** GET /api/pulse —— 站点公开统计（在线 / 累计） */
export function GET() {
  const data = pulseNow();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex",
    },
  });
}
