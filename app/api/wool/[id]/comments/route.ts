import { NextRequest, NextResponse } from "next/server";
import {
  listComments,
  addComment,
  hideComment,
  commentsReady,
} from "@/lib/wool-comments";

export const dynamic = "force-dynamic";

/**
 * 羊毛福利专区 · 交流区接口
 *
 * GET    /api/wool/:id/comments          拉取某条羊毛的留言
 * POST   /api/wool/:id/comments          发留言   body: { nick, body, replyTo? }
 * DELETE /api/wool/:id/comments?id=xxx   撤回留言（需 WOOL_ADMIN_KEY）
 *
 * 返回统一结构：{ ok: boolean, ... }
 * 完整契约见 docs/WOOL-API.md
 */

const MAX_BODY = 500;
const MAX_NICK = 24;

/** 留言列表短缓存（30s）：生产下每次访问都打 GitHub API，容易撞限流（2026-09-08 体检加） */
const listCache = new Map<string, { at: number; items: unknown[] }>();
const LIST_TTL = 30_000;
/** 管理员删除后要立刻失效，避免删完还看得到（见 DELETE） */
function dropListCache(woolId: string) {
  listCache.delete(woolId);
}

/** 简易限流：同一 IP 60 秒内最多 3 条（进程内，够挡误触和脚本小子） */
const hits = new Map<string, number[]>();
/** 顺手清掉过期 IP，否则 Map 只增不减（2026-09-08 修内存泄漏） */
function sweepHits(now: number) {
  if (hits.size < 500) return; // 量小不折腾
  for (const [ip, arr] of hits) {
    if (arr.every((t) => now - t >= 60_000)) hits.delete(ip);
  }
}
function rateOk(ip: string) {
  const now = Date.now();
  sweepHits(now);
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (arr.length >= 3) return false;
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "缺少 wool id" }, { status: 400 });
  }

  // 命中缓存直接返回（30s 内不重复打 GitHub）
  const cached = listCache.get(id);
  if (cached && Date.now() - cached.at < LIST_TTL) {
    return NextResponse.json({
      ok: true,
      items: cached.items,
      total: cached.items.length,
      ready: commentsReady(),
      cached: true,
    });
  }

  const items = await listComments(id);
  listCache.set(id, { at: Date.now(), items });
  // ready=false 表示服务端没配好（缺 token/Issue），前端要提示「交流区未配置」而不是「还没人留言」
  return NextResponse.json({
    ok: true,
    items,
    total: items.length,
    ready: commentsReady(),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "缺少 wool id" }, { status: 400 });
  }

  if (!commentsReady()) {
    return NextResponse.json(
      { ok: false, error: "交流服务未配置（管理员需设置 WOOL_COMMENTS_PROVIDER 与 WOOL_TALK_ISSUE）" },
      { status: 503 }
    );
  }

  let payload: { nick?: unknown; body?: unknown; replyTo?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const nick = String(payload.nick ?? "").trim();
  const body = String(payload.body ?? "").trim();
  const replyTo = payload.replyTo ? String(payload.replyTo) : undefined;

  if (!nick) return NextResponse.json({ ok: false, error: "请填写昵称" }, { status: 400 });
  if (nick.length > MAX_NICK) {
    return NextResponse.json({ ok: false, error: `昵称不要超过 ${MAX_NICK} 字` }, { status: 400 });
  }
  if (!body) return NextResponse.json({ ok: false, error: "留言内容为空" }, { status: 400 });
  if (body.length > MAX_BODY) {
    return NextResponse.json({ ok: false, error: `留言不要超过 ${MAX_BODY} 字` }, { status: 400 });
  }
  if (!rateOk(clientIp(req))) {
    return NextResponse.json({ ok: false, error: "发得太快了，歇一分钟再来" }, { status: 429 });
  }

  const item = await addComment({ woolId: id, nick, body, replyTo });
  if (!item) {
    return NextResponse.json({ ok: false, error: "写入失败，请稍后重试" }, { status: 502 });
  }
  dropListCache(id); // 新留言立刻可见
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(req: NextRequest) {
  const key = process.env.WOOL_ADMIN_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, error: "未启用管理接口" }, { status: 503 });
  }
  if (req.headers.get("x-admin-key") !== key) {
    return NextResponse.json({ ok: false, error: "管理员密钥不正确" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "缺少留言 id" }, { status: 400 });
  }
  const ok = await hideComment(id);
  if (ok) {
    const m = new URL(req.url).pathname.match(/^\/api\/wool\/([^/]+)\/comments/);
    if (m) dropListCache(m[1]);
  }
  return NextResponse.json({ ok });
}
