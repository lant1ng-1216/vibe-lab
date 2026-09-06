import { NextRequest, NextResponse } from "next/server";

/** /api/lab-demo — Lab Agent 交互式演示的 LLM 服务端
 * 只服务演示页：按需生成「追问(3 chips) / PRD 卡 / 打回理由」。
 * 全部走 DeepSeek(OpenAI 兼容, JSON mode)。任何失败返回 { ok:false },
 * 前端自动回落到剧本 script.ts，演示永不中断。
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = process.env.AGENT_MODEL || "deepseek-chat";
const TIMEOUT_MS = 12000;

const SYSTEM =
  "你是 Lab Agent——Vibe Coding / 产品设计的「监工」。你不写代码。你的工作：开工前帮开发者把想法问清楚、写成 PRD；执行中盯着 Coding Agent 别跑偏；交差时把技术汇报翻成大白话并对照 PRD 验收。你说话口语、直接、像懂行的老友，不长篇大论。涉及 JSON 输出时，只输出合法 JSON，不要任何额外文字或解释。";

type Qa = { q: string; a: string };

async function callDeepSeek(messages: { role: "system" | "user"; content: string }[], maxTokens = 900) {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.AGENT_API_KEY;
  if (!apiKey) return { ok: false as const, err: "NO_API_KEY" };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const up = await fetch(API_URL, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages,
      }),
    });
    if (!up.ok) return { ok: false as const, err: `UPSTREAM ${up.status}` };
    const data = await up.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    return { ok: true as const, content };
  } catch (e) {
    return { ok: false as const, err: String(e) };
  } finally {
    clearTimeout(timer);
  }
}

/** 从 LLM 返回文本中稳妥取 JSON(容忍围栏) */
function toJson(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw);
  } catch {
    const m = /```(?:json)?\s*([\s\S]*?)```/.exec(raw);
    if (m) {
      try {
        return JSON.parse(m[1]);
      } catch {
        return null;
      }
    }
    const open = raw.indexOf("{");
    if (open >= 0) {
      try {
        return JSON.parse(raw.slice(open));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, err: "BAD_BODY" });
  }
  const kind = String(body.kind || "");
  const idea = String(body.idea || "").trim();
  if (!idea) return NextResponse.json({ ok: false, err: "NO_IDEA" });

  if (kind === "ask") {
    const round = Number(body.round || 0);
    const past = Array.isArray(body.past) ? (body.past as Qa[]) : [];
    const pastText = past.length
      ? past.map((p, i) => `Q${i + 1} ${p.q} → A ${p.a}`).join("\n") + "\n"
      : "";
    const r = await callDeepSeek([
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `开发者的想法：「${idea}」\n${pastText}现在是第 ${Math.min(round + 1, 3)} 轮追问。\n请只追问一件当前最关键、最影响第一版形态的事；给出 3 个差异化的候选答复 chips（每个不超过 8 个字，直接可用）。\n仅输出 JSON：{"question":"…","options":["…","…","…"]}`,
      },
    ]);
    if (!r.ok) return NextResponse.json({ ok: false, err: r.err });
    const j = toJson(r.content);
    const q = String(j?.question || "").trim();
    const opts = Array.isArray(j?.options)
      ? (j.options as unknown[]).map((o) => String(o).trim()).filter(Boolean).slice(0, 3)
      : [];
    if (!q || opts.length < 3) return NextResponse.json({ ok: false, err: "BAD_SHAPE" });
    return NextResponse.json({ ok: true, question: q, options: opts });
  }

  if (kind === "prd") {
    const answers = Array.isArray(body.answers) ? (body.answers as Qa[]) : [];
    const dial = answers.length
      ? answers.map((p, i) => `开发者答：${p.a}`).join("\n") + "\n"
      : "";
    const r = await callDeepSeek([
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `想法：「${idea}」\n与开发者的对齐对话：\n${dial}请据此产出一页「第一版 PRD 卡」。\n仅输出 JSON：{"title":"≤12字的项目名","summary":"一句话概括","sections":[{"h":"给谁用 或 核心流程 或 范围红线","items":["要点…", "要点…"]}]}\n每个 section 给 2~3 条，每条不超过 16 字。`,
      },
    ]);
    if (!r.ok) return NextResponse.json({ ok: false, err: r.err });
    const j = toJson(r.content);
    const title = String(j?.title || "").trim();
    const summary = String(j?.summary || "").trim();
    const sections = Array.isArray(j?.sections)
      ? (j.sections as unknown[]).map((s) => {
          const o = s as Record<string, unknown>;
          return {
            h: String(o?.h || "").trim(),
            items: Array.isArray(o?.items) ? (o.items as unknown[]).map((i) => String(i).trim()).filter(Boolean) : [],
          };
        }).filter((s) => s.h && s.items.length)
      : [];
    if (!title || !summary || !sections.length) return NextResponse.json({ ok: false, err: "BAD_SHAPE" });
    return NextResponse.json({ ok: true, prd: { title, summary, sections } });
  }

  if (kind === "verdict") {
    const rogueLabel = String(body.rogueLabel || "一个多余的功能");
    const r = await callDeepSeek([
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `背景：开发者想法「${idea}」。Claude Code 擅自加了「${rogueLabel}」，开发者问 Lab Agent：为什么不该加？\n以监工口吻给一段打回理由（不超过 80 字、口语）：说清「它不在你原本的意图里」+ 一句建议（什么时候才值得加）。\n仅输出 JSON：{"reply":"…"}`,
      },
    ]);
    if (!r.ok) return NextResponse.json({ ok: false, err: r.err });
    const j = toJson(r.content);
    const reply = String(j?.reply || "").trim();
    if (!reply) return NextResponse.json({ ok: false, err: "BAD_SHAPE" });
    return NextResponse.json({ ok: true, reply });
  }

  return NextResponse.json({ ok: false, err: "BAD_KIND" });
}
