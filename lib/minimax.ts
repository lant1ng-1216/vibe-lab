/**
 * MiniMax（海螺）图像 / 文本生成客户端（仅服务端调用）。
 * 图像：POST {base}/v1/image_generation  model=image-01  → data.image_urls[0]
 * 文本：POST {base}/v1/text/chatcompletion_v2   model=MiniMax-Text-01（用于一句话摘要）
 * 环境变量：MINIMAX_API_KEY（必填）；MINIMAX_BASE_URL（默认 https://api.minimax.chat）
 */

export type MiniMaxImageOptions = { aspectRatio?: string };

function key() {
  return process.env.MINIMAX_API_KEY || "";
}
function base() {
  return process.env.MINIMAX_BASE_URL || "https://api.minimax.chat";
}

/** 生成一张图，返回图片 Buffer；失败返回 null */
export async function generateImage(
  prompt: string,
  opts: MiniMaxImageOptions = {}
): Promise<Buffer | null> {
  const k = key();
  if (!k) return null;
  try {
    const res = await fetch(`${base()}/v1/image_generation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${k}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "image-01",
        prompt,
        aspect_ratio: opts.aspectRatio || "16:9",
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { data?: { image_urls?: string[] } };
    const url = d?.data?.image_urls?.[0];
    if (!url) return null;
    const img = await fetch(url, { cache: "no-store" });
    if (!img.ok) return null;
    return Buffer.from(await img.arrayBuffer());
  } catch {
    return null;
  }
}

/** 生成 ≤70 字的一句话摘要（中文卡片文案）；失败返回 null */
export async function generateSummary(ctx: {
  title: string;
  desc: string;
  tags?: string[];
}): Promise<string | null> {
  const k = key();
  if (!k) return null;
  try {
    const res = await fetch(`${base()}/v1/text/chatcompletion_v2`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${k}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "MiniMax-Text-01",
        max_tokens: 160,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "你是 Vibe Lab 实验室的作品卡片文案编辑。用一句话（≤70 个汉字、不用 emoji、不用书名号、口语自然）向读者介绍「这个作品是做什么的 / 解决什么问题」。",
          },
          {
            role: "user",
            content: `作品名：${ctx.title}\n介绍：${ctx.desc}\n标签：${(ctx.tags || []).join("、") || "无"}\n\n请写一句介绍：`,
          },
        ],
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const c = d?.choices?.[0]?.message?.content?.trim();
    if (!c) return null;
    return c.length > 90 ? c.slice(0, 88) + "…" : c;
  } catch {
    return null;
  }
}

/** 拼图像 prompt（风格统一：克制、有质感、不做空泛炫技） */
export function buildCoverPrompt(ctx: {
  title: string;
  desc: string;
  tags?: string[];
}): string {
  const subject = `${ctx.title}：${ctx.desc}`;
  return (
    `${subject}\n\n` +
    `为这个 AI / 创作者项目生成一张 16:9 高清概念封面图。` +
    `风格：克制的现代科技感——干净几何、留白、低饱和深色底 + 一种强调色，` +
    `信息密度低、不炫技、不堆砌元素，像一张严肃作品的项目主视觉。` +
    `不要出现任何文字、LOGO、中文。`
  );
}