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

/** 简易限流：同一 IP 60 秒内最多 3 条（进程内，够挡误触和脚本小子） */
const hits = new Map<string, number[]>();
function rateOk(ip: string) {
  const now = Date.now();
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
  const items = await listComments(id);
  return NextResponse.json({ ok: true, items, total: items.length });
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
  return NextResponse.json({ ok });
}
