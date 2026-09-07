import { NextRequest, NextResponse } from "next/server";
import { submitWool } from "@/lib/wool-submit";

export const dynamic = "force-dynamic";

/**
 * 羊毛投稿（站内提交，服务端代开 GitHub Issue）
 *
 * POST /api/wool/submit
 * body: { name, quota, gate, validity, deadline?, how, trap?, href, proof, from? }
 *
 * 用户全程不离开站点。投稿落成一个带「羊毛投稿」标签的 Issue，
 * 站长在 GitHub 上人工审核，通过后合入 data/wool.ts 即上线。
 */

const GATES = ["零门槛", "需验证", "需外网", "需订阅"];
const VALIDITIES = ["长期", "限时", "已失效"];

const hits = new Map<string, number[]>();
function rateOk(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 600_000);
  if (arr.length >= 3) return false; // 10 分钟最多 3 条投稿
  arr.push(now);
  hits.set(ip, arr);
  return true;
}

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function POST(req: NextRequest) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const s = {
    name: str(b.name, 60),
    quota: str(b.quota, 80),
    gate: str(b.gate, 10),
    validity: str(b.validity, 10),
    deadline: str(b.deadline, 10) || undefined,
    how: str(b.how, 300),
    trap: str(b.trap, 300) || undefined,
    href: str(b.href, 300),
    proof: str(b.proof, 500),
    from: str(b.from, 24) || undefined,
  };

  if (!s.name) return NextResponse.json({ ok: false, error: "请填写工具名" }, { status: 400 });
  if (!s.quota) return NextResponse.json({ ok: false, error: "请填写白嫖额度" }, { status: 400 });
  if (!GATES.includes(s.gate)) {
    return NextResponse.json({ ok: false, error: "门槛取值不合法" }, { status: 400 });
  }
  if (!VALIDITIES.includes(s.validity)) {
    return NextResponse.json({ ok: false, error: "有效期取值不合法" }, { status: 400 });
  }
  if (!s.how) return NextResponse.json({ ok: false, error: "请填写领取方式" }, { status: 400 });
  if (!/^https?:\/\//i.test(s.href)) {
    return NextResponse.json({ ok: false, error: "领取链接要以 http(s):// 开头" }, { status: 400 });
  }
  if (s.proof.length < 10) {
    return NextResponse.json(
      { ok: false, error: "请写清你是什么时候、在哪个页面核实到这个额度的（至少 10 个字）" },
      { status: 400 }
    );
  }
  if (!rateOk(clientIp(req))) {
    return NextResponse.json({ ok: false, error: "投得太快了，歇十分钟再来" }, { status: 429 });
  }

  const r = await submitWool(s);
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error || "提交失败" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, issue: r.issue });
}
