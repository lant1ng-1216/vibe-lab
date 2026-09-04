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

/** 按作品类型给出的「画面主体」建议——确保图表达产品是什么 */
const SCENE_BY_TYPE: Record<string, string> = {
  Website:
    "画面呈现这个网站/产品正在被使用或被打开时的关键场景：如果是工具门户，画出它的工作台/界面切片氛围；如果是内容站，画出浏览内容时的氛围。",
  App: "画面呈现这个应用/软件在真实使用中处理的产出物或场景（它产出/操作的具体对象），让看的人仅凭画面就能猜到用途。",
  Product: "画面呈现产品最核心的使用场景或它帮用户解决的问题，主体明确聚焦功能，不做空泛装饰。",
  Tutorial: "画面呈现学习/教程的产出结果或上手后的收获（完成的成品、运行中的示例、作品墙）。",
  Agent: "画面呈现智能体/自动化执行真实任务时的场景：流程、节点、工具调用、任务完成的可视化。",
  Skill: "画面呈现「把重复工作打包成可复用技能包」的概念：模板、配方、乐高式组装感。",
  Article: "画面用具体物象呈现这篇文章的核心主题对象。",
  Video: "画面呈现一段视频关键一帧般的场景（动态感、镜头感）。",
  Audio: "画面把声音/音乐化成可见的对象（波形、音符流动、旋律线条）。",
  Model: "画面呈现模型训练/推理的具体意象：数据流、神经网络、权重空间。",
  Design: "画面呈现设计产物自身的气质：布局、色彩、版式构成感。",
};

/**
 * 拼图像 prompt —— 让画面「介绍这个产品」。
 * 优先 coverHint（创作者/维护者定制画面主体）；否则由 type + desc 推导。
 */
export function buildCoverPrompt(ctx: {
  title: string;
  desc: string;
  tags?: string[];
  type?: string;
  coverHint?: string;
}): string {
  if (ctx.coverHint) {
    return (
      `${ctx.coverHint}\n\n` +
      `这是「${ctx.title || "项目"}」的 16:9 项目封面图。` +
      `风格：干净、克制、有质感的现代数字风，低饱和背景 + 一个强调色，构图清晰。` +
      `不要出现任何文字、LOGO、商标或真实 UI 截图。`
    );
  }

  const scene = SCENE_BY_TYPE[ctx.type || ""] || "画出与这个产品用途直接相关的对象或使用场景。";
  return (
    `为作品「${ctx.title}」生成一张 16:9 概念封面。\n\n` +
    `这个作品是：${ctx.desc}\n` +
    `它的关键标签：${(ctx.tags || []).join("、") || "无"}\n\n` +
    `画面要求：${scene}\n` +
    `画面的主体必须让人仅凭画面就能联想到这个产品的用途，而不是泛泛的科技装饰。\n` +
    `风格：干净、克制、有质感的现代数字风，低饱和深色底 + 一个强调色，构图清晰、留白得当。\n` +
    `不要出现任何文字、LOGO、商标或真实 UI 截图。`
  );
}