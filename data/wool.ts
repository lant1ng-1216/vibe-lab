/**
 * 羊毛专区 —— AI 工具白嫖额度数据
 * -------------------------------------------------
 * 与工具库 data/tools.ts 的分工：
 *  - tools.ts 回答「这个工具是什么、能干什么」
 *  - 本文件回答「能白嫖多少、门槛多高、什么时候过期」
 * 因此每条通过 toolId 关联 tools.ts（复用 logo 与官网链接），但不重复工具介绍。
 *
 * ⚠️ 维护约定：薅羊毛信息过期极快，新增/修改条目时
 *    1) checkedAt 必须填实际核实日期，不要照抄上一条
 *    2) 额度或有效期变了就改，失效了把 validity 改成 "已失效" 而不是删掉——
 *       置灰保留能让读者知道「这个没了，别白跑」
 *    3) 信息来自二手渠道（攻略文、他人整理）时，source 填来源链接，
 *       并在 how / trap 里写明「官网为准」，别让读者拿着二手信息白跑一趟
 *
 * 模板（复制后填）：
 * {
 *   id: "xxx", toolId: "tools.ts 里的 id", name: "工具名",
 *   quota: "白嫖额度", gate: "零门槛", validity: "长期",
 *   how: "一句话领取方式", trap: "坑点提示", href: "领取链接",
 *   weight: 100, checkedAt: "2026-09-07", source: "https://...",
 * },
 */

/** 领取门槛 —— 按「用户要付出什么」分，方便一眼判断值不值得动手 */
export type WoolGate = "零门槛" | "需学生" | "需绑卡" | "需外网";

/** 有效期 */
export type WoolValidity = "长期" | "限时" | "已失效";

export type WoolItem = {
  id: string;
  /** 关联 data/tools.ts 的 id，用于复用 logo 与跳转；站点未收录的工具留空即可 */
  toolId?: string;
  name: string;
  /** 白嫖额度 —— 卡片主视觉，越短越好（如 "每月 $5"） */
  quota: string;
  gate: WoolGate;
  validity: WoolValidity;
  /** 截止日期，限时/已失效时填写，格式 YYYY-MM-DD */
  deadline?: string;
  /** 一句话说清怎么领 */
  how: string;
  /** 坑点提示，可不填 */
  trap?: string;
  /** 领取按钮链接 */
  href: string;
  /** 排序权重，按额度价值手动排，越大越靠前 */
  weight: number;
  /** 信息核实日期 YYYY-MM-DD */
  checkedAt: string;
  /** 信息来源链接，二手信息必填，便于下一个人复核 */
  source?: string;
};

export const WOOL_GATES: WoolGate[] = ["零门槛", "需学生", "需绑卡", "需外网"];

/**
 * 信息新鲜度 —— 羊毛最怕过期，宁可催人复核也别让人白跑
 * 阈值按「羊毛变动速度」定：额度类信息一个月就可能变，90 天以上基本要重查。
 */
export type WoolFreshness = "fresh" | "warn" | "old";

export const FRESH_DAYS = 30;
export const WARN_DAYS = 90;

export function freshnessOf(checkedAt: string, today = new Date()): WoolFreshness {
  const checked = Date.parse(checkedAt);
  if (Number.isNaN(checked)) return "old";
  const days = Math.floor((today.getTime() - checked) / 86_400_000);
  if (days <= FRESH_DAYS) return "fresh";
  if (days <= WARN_DAYS) return "warn";
  return "old";
}

export const FRESHNESS_TEXT: Record<WoolFreshness, string> = {
  fresh: "近期核实",
  warn: "该复核了",
  old: "可能已过期",
};

/**
 * ⚠️ 首批条目的数据来源
 * -------------------------------------------------
 * 除标注「官网核实」的条目外，其余均来自 2026-09-07 的公开攻略文检索
 * （whichai.fyi / thedigitalajay.com / dev.to / felloai.com），
 * **属于二手信息，未经官网逐条点开确认**。
 * 已尽力的处理：
 *   - 多方来源一致的才写进来
 *   - 来源打架的（如 Cursor 学生包）写在 trap 里，不替读者下结论
 *   - 每条都带 source 链接，下一个人复核时能直接跳过去
 * 上线前建议照着 source 逐条点一遍官网，再更新 checkedAt。
 */
export const WOOL: WoolItem[] = [
  {
    id: "github-education",
    toolId: "github",
    name: "GitHub Education 学生包",
    quota: "Copilot Pro 免费 + 100+ 项权益",
    gate: "需学生",
    validity: "长期",
    how: "用学校邮箱或学生证完成 GitHub Education 认证，通过后 Copilot Pro 直接免费用。",
    trap: "在校生才行，毕业即失效；审核通常要 1-3 天，别等到要用了才申请。",
    href: "https://education.github.com/",
    weight: 100,
    checkedAt: "2026-09-07",
    source: "https://education.github.com/",
  },
  {
    id: "copilot-free",
    toolId: "github-copilot",
    name: "GitHub Copilot",
    quota: "每月 50 次高级请求",
    gate: "零门槛",
    validity: "长期",
    how: "登录 GitHub 账号即可开通免费档，VS Code / JetBrains 装插件直接用。",
    trap: "高级请求用完之后会静默降级到基础模型，体感差别不小。补全次数各家口径不一（有说 2000 次/月），以官网为准。",
    href: "https://github.com/features/copilot",
    weight: 90,
    checkedAt: "2026-09-07",
    source: "https://github.com/features/copilot",
  },
  {
    id: "cursor-student",
    toolId: "cursor",
    name: "Cursor",
    quota: "学生免费一年 Pro",
    gate: "需学生",
    validity: "限时",
    how: "用学校邮箱在 Cursor 官网验证学生身份，Pro 订阅直接免一年。",
    trap: "⚠️ 来源打架：有攻略称该计划 2026 年年中已结束、改为校园活动发放，也有来源说仍可申请。动手前先上 cursor.com/students 确认。一年到期会自动转付费，记得提前取消。",
    href: "https://cursor.com/students",
    weight: 80,
    checkedAt: "2026-09-07",
    source: "https://cursor.com/students",
  },
  {
    id: "gemini-free",
    toolId: "gemini",
    name: "Google Gemini",
    quota: "100 万 token 上下文",
    gate: "零门槛",
    validity: "长期",
    how: "Google 账号登录 gemini.google.com 直接用，免费档就给到 1M 上下文。",
    trap: "长上下文很香，但硬推理题上跟顶级模型有差距；适合丢整份代码库做摘要和抽取。",
    href: "https://gemini.google.com/",
    weight: 75,
    checkedAt: "2026-09-07",
    source: "https://dev.to/apex_/the-free-ai-tool-stack-20-tools-that-cost-nothing-in-2026-546",
  },
  {
    id: "claude-free",
    toolId: "claude",
    name: "Claude",
    quota: "20 万上下文 · 免费档",
    gate: "零门槛",
    validity: "长期",
    how: "claude.ai 注册即用，免费档能用当前模型，有每周消息额度。",
    trap: "额度按周重置，重度使用会撞墙；撞了是排队不是断供，等一等还能用。",
    href: "https://claude.ai/",
    weight: 72,
    checkedAt: "2026-09-07",
    source: "https://dev.to/apex_/the-free-ai-tool-stack-20-tools-that-cost-nothing-in-2026-546",
  },
  {
    id: "perplexity-free",
    toolId: "perplexity",
    name: "Perplexity",
    quota: "每天数百次带引用搜索",
    gate: "需外网",
    validity: "长期",
    how: "注册即用，每条回答都附可点击的引用来源。",
    trap: "需要非大陆网络环境。免费档的「深度研究」次数有限，别拿它当主力写手——它是查资料用的。",
    href: "https://www.perplexity.ai/",
    weight: 68,
    checkedAt: "2026-09-07",
    source: "https://dev.to/apex_/the-free-ai-tool-stack-20-tools-that-cost-nothing-in-2026-546",
  },
  {
    id: "n8n-selfhost",
    toolId: "n8n",
    name: "n8n 自托管",
    quota: "社区版永久免费",
    gate: "需外网",
    validity: "长期",
    how: "自己服务器或本机 docker 起一个，可视化画布连工作流，RSS 进 → AI 总结 → 推 webhook 三步搞定。",
    trap: "免费的是自托管社区版，官方云要钱。得自己有台机器且能连外网。",
    href: "https://n8n.io/",
    weight: 60,
    checkedAt: "2026-09-07",
    source: "https://dev.to/apex_/the-free-ai-tool-stack-20-tools-that-cost-nothing-in-2026-546",
  },
  {
    id: "ideogram-free",
    toolId: "ideogram",
    name: "Ideogram",
    quota: "每天 10 张出图",
    gate: "零门槛",
    validity: "长期",
    how: "注册即用，不用绑卡。目前出图带字（logo、标题、缩略图）效果最好的免费选项。",
    trap: "每天只有 10 张，批量做图不够用；付费档 $8/月才无限。",
    href: "https://ideogram.ai/",
    weight: 55,
    checkedAt: "2026-09-07",
    source: "https://thedigitalajay.com/free-ai-tools",
  },
  {
    id: "huggingface-free",
    toolId: "huggingface",
    name: "Hugging Face",
    quota: "免费 Spaces + 模型托管",
    gate: "零门槛",
    validity: "长期",
    how: "注册就能开 Spaces 跑 Demo、免费托管模型和数据集。",
    trap: "免费档是 CPU 小规格，跑不动大模型；想要 GPU 得加钱或蹭别人的 Inference API。",
    href: "https://huggingface.co/",
    weight: 50,
    checkedAt: "2026-09-07",
    source: "https://thedigitalajay.com/free-ai-tools",
  },
  {
    id: "windsurf-free",
    toolId: "windsurf",
    name: "Windsurf",
    quota: "免费档 AI 编辑器",
    gate: "零门槛",
    validity: "长期",
    how: "官网注册下载编辑器，免费档带额度直接用。",
    trap: "额度消耗比想象快，重度使用很快就提示升级；具体额度以官网为准。",
    href: "https://windsurf.com/",
    weight: 45,
    checkedAt: "2026-09-07",
    source: "https://thedigitalajay.com/free-ai-tools",
  },
];
