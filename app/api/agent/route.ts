import { NextRequest } from "next/server";

/**
/** Lab Agent — 常驻助手后端（Lab = Vibe Lab · 振动实验室）
 * ------------------------------------------------------------
 * 协议：与开源 pi (pi.dev / @earendil-works/pi-ai) 的 DeepSeek provider
 * 同源 —— 走 OpenAI 兼容 chat/completions 流式端点（baseUrl api.deepseek.com）。
 * 若未来要升级到 pi-agent-core 完整工具循环，本文件是替换点（见底部注释）。
 *
 * 环境变量：DEEPSEEK_API_KEY （或 AGENT_API_KEY）
 * 未配置时返回 SSE error 帧，前端显示"待接入"引导，不做假回答。
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.AGENT_MODEL || "deepseek-chat";
const API_URL = "https://api.deepseek.com/chat/completions";

/** Vibe Lab 人格 + 库内知识（让 Agent 认识这个平台，用大白话回答） */
const SYSTEM_PROMPT = `你是「Lab Agent」—— Vibe Lab · 振动实验室的常驻 AI 向导，一个在 AI 教学站里帮人指路的野路子专家。人们叫你 Lab Agent 或「实验台助手」。

说话风格：大白话、接地气、不端专家架子，偶尔玩梗，但信息必须准确。别啰嗦，回答控制在能一口气读完的长度；给建议时直接给结论 + 一句为什么。

关于 Vibe Lab 你该知道的（回答下面几类问题用得上）：
- 本站三档课：Starter ¥899（3 节基础课：快速上手 AI 工具 / 打造第一个产品 / 邪修制作 Skill+Agent）；Builder ¥1499（基础 + 6 节进阶，进阶课有作业点评）；Hacker ¥2999（全套 + 创始人本人 1v1 带打真实比赛，线上线下均可）。
- 进阶 6 节链路：提示词系统化 → Vibe Coding 搭产品 → Agent 实战 → Skill 封装 → 作品打磨上线 → 打造个人网站。
- 工具库收录（按类）：ChatGPT / Claude / DeepSeek（对话）；Cursor / OpenCode / Zcode / Vercel / WorkBuddy / Harness（开发与 Agent 工作台）；Midjourney / ComfyUI / 即梦（图像）；Clash Verge（网络环境）；n8n（自动化）。
- 概念一句话：Agent=能自己拆任务一步步干完的 AI 程序；Skill=把重复的 AI 用法打包成可复用技能；Vibe Coding=用大白话指挥 AI 写代码，你管方向和验收。

遇到平台外的问题可以正常回答，但别冒充 Vibe Lab 有课程里没讲的内容。不确定就明说。

【输出格式铁律】
- 代码示例 **必须** 用 Markdown 标准围栏代码块包裹：\`\`\`python \\n<code>\\n\`\`\`
- 禁止用 codeCopy / code / </code> / unicode 转义等任何替代形式
- 围栏语言标识按内容写（python / javascript / bash / json / shell 等）
- 列表用 - 或 1. 2. 3.，加粗用 **，行内代码用单反引号 \`code\` 包围`;

export type AgentMessage = { role: "system" | "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.AGENT_API_KEY;

  // SSE helper：发一帧
  const encoder = new TextEncoder();
  const send = (stream: ReadableStreamController<Uint8Array>, obj: unknown) => {
    stream.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
  };

  let body: { messages?: AgentMessage[] };
  try {
    body = await req.json();
  } catch {
    body = { messages: [] };
  }
  const history = (body.messages || []).slice(-8); // 只保留最近 8 条防超长

  // 未配置 Key → 明确告知，不做假脑子
  if (!apiKey) {
    const stream = new ReadableStream({
      start(controller) {
        send(controller, {
          type: "error",
          code: "NO_API_KEY",
          text: "Vibe Agent 还没接上模型大脑 —— 需要创始人在服务器配置 DEEPSEEK_API_KEY 后才会开口说话。",
        });
        send(controller, { type: "done" });
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const upstream = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      max_tokens: 800,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => "");
    const stream = new ReadableStream({
      start(controller) {
        send(controller, {
          type: "error",
          code: "UPSTREAM",
          text: `模型服务开了小差（${upstream.status}）。稍后再试，或找创始人看看 Key 配置。`,
        });
        void errText;
        send(controller, { type: "done" });
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  // 透传 DeepSeek SSE → 我们自己的 {type:'delta'|'done'} 帧
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const payload = t.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta: string =
                json?.choices?.[0]?.delta?.content || "";
              if (delta) send(controller, { type: "delta", text: delta });
            } catch {
              /* 忽略残缺行 */
            }
          }
        }
        send(controller, { type: "done" });
      } catch (e) {
        send(controller, {
          type: "error",
          code: "STREAM",
          text: "回答中断了 —— 网络不稳定，可以再问一次。",
        });
        void e;
        send(controller, { type: "done" });
      } finally {
        try {
          reader.releaseLock();
        } catch {
          /* noop */
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

/**
 * 【pi 升级点】当前实现 = pi-ai 的 DeepSeek provider 同协议。
 * 若要接入完整 pi-agent-core（工具调用/记忆/多轮状态），在此文件内替换为：
 *   import { Agent } from "@earendil-works/pi-agent-core";
 *   import { streamSimple } from "@earendil-works/pi-ai/api/openai-completions";
 *   const agent = new Agent({ initialState: { systemPrompt: SYSTEM_PROMPT, ... } });
 *   agent.subscribe(...) → 转发 text_delta 到 SSE
 * 依赖已安装（@earendil-works/pi-agent-core / pi-ai），随时可切。
 */
