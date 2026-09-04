import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 训练营课程台 · 第一道锁（邀请码）服务端校验
 * POST /api/verify-invite  body: { code }
 *
 * 邀请码 = 站长环境变量 COURSE_INVITE_CODE（不放公开代码里，免得 view-source 可抄）。
 * 开发环境未配置时放行（方便本地联调）；生产环境未配置时一律拒绝并提示。
 */
const INVITE = process.env.COURSE_INVITE_CODE;

export async function POST(req: NextRequest) {
  let code = "";
  try {
    const body = await req.json();
    code = String(body?.code || "").trim();
  } catch {
    /* ignore */
  }

  if (!INVITE) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ ok: true, dev: true });
    }
    return NextResponse.json({ ok: false, error: "邀请码服务未配置（管理员需设置 COURSE_INVITE_CODE）" }, { status: 503 });
  }

  const ok =
    code.length > 0 && code.toUpperCase() === String(INVITE).trim().toUpperCase();
  if (!ok) {
    return NextResponse.json({ ok: false, error: "邀请码不正确，请核对后重试（或联系管理员获取）。" });
  }
  return NextResponse.json({ ok: true });
}
