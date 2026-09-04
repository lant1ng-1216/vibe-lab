// 训练营课程数据（v2 多课包）—— ⚠️ 训练营为付费内容，本文件只放「课表骨架」，不放付费正文
// pack.kind: main 正式三档 / mini 低价引流课
// sale: 限时价（null = 无折扣，仅显示原价）；price 为原价
// lesson.preview: 体验课，未解锁可试看
// 解锁：站长收款后手动发码（UNLOCK_CODES 明文存于前端，正式售卖前升级服务端校验+账号体系）
//
// 【内容防裸奔规范（勿违反）】
// 1. lesson.src 的真实内容（录播 mp4 / 图文正文）一律**不得**放进 public/ 静态目录或本仓库正文——
//    公开仓库 + 静态目录 = 任何人拿到 URL 即可下载。真实内容走私有存储（签名 URL）或第三方
//    "仅付费可见"托管，src 只在用户已进入课程台（第一道锁通过）后由页面注入。
// 2. 第一道锁（页面访问）：邀请码，环境变量 COURSE_INVITE_CODE（服务端校验，见 /api/verify-invite）。
// 3. 第二道锁（课包内容）：解锁码 UNLOCK_CODES。两码都由站长人工发放。

export type PackKey =
  | "starter"
  | "builder"
  | "hacker"
  | "mini98"
  | "mini199";

export type Lesson = {
  id: string;
  no: string;
  title: string;
  desc: string;
  kind: "video" | "embed" | "doc"; // 播放器底座：mp4 / iframe / 图文
  src?: string; // 播放源（占位留空 = 内容整理中）
  preview?: boolean; // 体验课
  dur?: string;
};

export type CoursePack = {
  key: PackKey;
  kind: "main" | "mini";
  emoji: string;
  title: string; // 模块标题（课程台/报名页共用）
  subtitle: string;
  price: number; // 原价
  sale?: number; // 限时价
  who: string;
  perks: string[];
  lessons: Lesson[];
  includes?: PackKey; // 超集关系：本课包含的其它课包（如 提示词实战 includes AI提效入门）
};

/* ---------- 主三档（阶梯包含：Builder 含 Starter，Hacker 含全部） ---------- */
export const MAIN_ORDER: PackKey[] = ["starter", "builder", "hacker"];
export const MAIN_LABEL: Record<string, string> = {
  starter: "Starter",
  builder: "Builder",
  hacker: "Hacker",
};

/* ---------- 全部课包 ---------- */
export const COURSE_PACKS: CoursePack[] = [
  {
    key: "starter",
    kind: "main",
    emoji: "🔰",
    title: "Starter · 基础课",
    subtitle: "零基础入门：3 节带你上手 AI 工具，做出第一个想法",
    price: 899,
    sale: 399,
    who: "完全小白 · 先低成本试试 AI 能干嘛",
    perks: ["基础课 3 节（录播）", "社群陪伴 · 录播永久回看", "解锁后逐节观看"],
    lessons: [
      {
        id: "s1",
        no: "01",
        title: "快速上手 AI 工具",
        desc: "ChatGPT / Claude / Kimi 怎么选、怎么用——第一节课就动手，不背理论。",
        kind: "doc",
        preview: true,
        dur: "~40min",
      },
      {
        id: "s2",
        no: "02",
        title: "打造你的第一个产品想法",
        desc: "从「我有一个点子」到「一个可执行的方案」：选题、拆解、验证。",
        kind: "doc",
        dur: "~45min",
      },
      {
        id: "s3",
        no: "03",
        title: "邪修制作 Skill + Agent",
        desc: "把好用的 AI 用法打包成 Skill、让 Agent 帮你干活——入门即巅峰的野路子。",
        kind: "doc",
        dur: "~50min",
      },
    ],
  },
  {
    key: "builder",
    kind: "main",
    emoji: "🚀",
    title: "Builder · 进阶课",
    subtitle: "能力爬坡链：6 节课，从会聊 AI 到能独立做出作品",
    price: 1499,
    sale: 899,
    who: "爱好者 · 想系统学完并能独立做出作品",
    perks: ["含 Starter 全部内容", "进阶课 6 节（录播）", "作业 + 打卡 + 讲师点评", "社群答疑 · 永久回看"],
    lessons: [
      {
        id: "b1",
        no: "01",
        title: "提示词系统化",
        desc: "让 AI 一次听明白你的需求：角色、任务、约束、格式的完整方法论。",
        kind: "doc",
        dur: "~45min",
      },
      {
        id: "b2",
        no: "02",
        title: "Vibe Coding 搭产品",
        desc: "你说话，AI 写码：用 Cursor / Claude 从零搭出你的第一个产品。",
        kind: "doc",
        dur: "~60min",
      },
      {
        id: "b3",
        no: "03",
        title: "Agent 实战",
        desc: "让 AI 自己拆任务、自己干活：Agent 从原理到能跑通。",
        kind: "doc",
        dur: "~60min",
      },
      {
        id: "b4",
        no: "04",
        title: "Skill 封装",
        desc: "把好用的用法打包成可复用技能，装给谁都能用。",
        kind: "doc",
        dur: "~50min",
      },
      {
        id: "b5",
        no: "05",
        title: "作品打磨上线",
        desc: "从「能用」到「好用、能给人用」：细节、性能与上线部署。",
        kind: "doc",
        dur: "~55min",
      },
      {
        id: "b6",
        no: "06",
        title: "打造个人网站",
        desc: "收官之作：你的作品墙 + 数字名片。",
        kind: "doc",
        dur: "~50min",
      },
    ],
  },
  {
    key: "hacker",
    kind: "main",
    emoji: "🎯",
    title: "Hacker · 全套 + 1v1",
    subtitle: "全套课程 + 创始人本人 1v1 实战带打比赛",
    price: 2999,
    sale: 2300,
    who: "想参赛拿奖 · 让作品真正能打的人",
    perks: ["全套课程（Starter + Builder）", "创始人本人 1v1 实战带打", "选题 → 作品 → 参赛全程陪跑", "线上 / 线下均可"],
    lessons: [
      {
        id: "h1",
        no: "01",
        title: "1v1 带打：从选题到参赛",
        desc: "报名 Hacker 档后，由创始人直接对接，围绕你的目标赛题全程陪跑。",
        kind: "doc",
        dur: "全程陪跑",
      },
    ],
  },
  /* ---------- 低价引流 mini 课（¥199 提示词实战 ⊃ ¥98 AI提效入门） ---------- */
  {
    key: "mini98",
    kind: "mini",
    emoji: "🎁",
    title: "AI 提效入门 · 小课",
    subtitle: "2 节小课，把 AI 用进每天的工作里",
    price: 98,
    who: "想先花一顿饭钱试试 AI 提效",
    perks: ["2 节录播小课", "随到随学 · 永久回看", "社群提问"],
    lessons: [
      {
        id: "m1a",
        no: "01",
        title: "AI 提效第一步：把任务说清楚",
        desc: "一份能用在工作里的万能提问模板，从此告别无效对话。",
        kind: "doc",
        preview: true,
        dur: "~15min",
      },
      {
        id: "m1b",
        no: "02",
        title: "上班族的 10 个提效场景",
        desc: "写周报、回邮件、整理会议纪要——10 个拿来即用的场景。",
        kind: "doc",
        dur: "~25min",
      },
    ],
  },
  {
    key: "mini199",
    kind: "mini",
    emoji: "🧪",
    title: "提示词实战 · 小课",
    subtitle: "4 节小课，含 AI 提效入门全部内容 + 2 节提示词专属进阶",
    price: 199,
    who: "会用 AI 聊天，但想让 AI 一次做对的进阶新手",
    perks: [
      "4 节录播小课（含 AI 提效入门 2 节）",
      "提示词模板包",
      "随到随学 · 永久回看",
    ],
    includes: "mini98",
    lessons: [
      {
        id: "m2a",
        no: "01",
        title: "AI 提效第一步：把任务说清楚",
        desc: "一份能用在工作里的万能提问模板，从此告别无效对话。（含 AI 提效入门）",
        kind: "doc",
        preview: true,
        dur: "~15min",
      },
      {
        id: "m2b",
        no: "02",
        title: "上班族的 10 个提效场景",
        desc: "写周报、回邮件、整理会议纪要——10 个拿来即用的场景。（含 AI 提效入门）",
        kind: "doc",
        dur: "~25min",
      },
      {
        id: "m2c",
        no: "03",
        title: "提示词万能公式：角色 × 任务 × 约束",
        desc: "一个公式套所有场景，让 AI 第一次就做对。",
        kind: "doc",
        dur: "~20min",
      },
      {
        id: "m2d",
        no: "04",
        title: "拆解 12 个真实提示词案例",
        desc: "好提示词 vs 烂提示词，逐条对比为什么。",
        kind: "doc",
        dur: "~30min",
      },
    ],
  },
];

export const MINI_PACKS = COURSE_PACKS.filter((p) => p.kind === "mini");
export const MAIN_PACKS = COURSE_PACKS.filter((p) => p.kind === "main");

export const PACK_LABEL: Record<PackKey, string> = {
  starter: "Starter",
  builder: "Builder",
  hacker: "Hacker",
  mini98: "AI 提效入门",
  mini199: "提示词实战",
};

/* 解锁码（站长收款后发码；改这里换码） */
export const UNLOCK_CODES: Record<PackKey, string> = {
  starter: "VLAB-STARTER",
  builder: "VLAB-BUILDER",
  hacker: "VLAB-HACKER",
  mini98: "VLAB-MINI98",
  mini199: "VLAB-MINI199",
};

export type Unlocks = Record<PackKey, number>; // key -> 解锁时间戳

/** 判定课包是否已解锁（多包叠加 + 主档阶梯包含 + mini 超集包含） */
export function hasPack(unlocks: Partial<Unlocks> | null, pack: CoursePack): boolean {
  if (!unlocks) return false;
  if (pack.kind === "mini") {
    // 超集包含：解锁了 includes 指向的课包时，被包含的课也算解锁（如 199 ⊃ 98）
    if (unlocks[pack.key]) return true;
    const owner = COURSE_PACKS.find((p) => p.includes === pack.key);
    return !!owner && !!unlocks[owner.key];
  }
  // 主三档：阶梯包含（builder 码解锁 starter+builder）
  const idx = MAIN_ORDER.indexOf(pack.key);
  for (let i = idx; i < MAIN_ORDER.length; i++) {
    if (unlocks[MAIN_ORDER[i]]) return true;
  }
  return false;
}

/** 折扣文案工具：返回「限时 X 折 · 省 ¥Y」 */
export function saleOff(price: number, sale?: number): string | null {
  if (!sale || sale >= price) return null;
  const off = Math.round((sale / price) * 100) / 10; // 折数（4.4 / 6 / 7.7）
  const offStr = String(off).replace(/\.0$/, "");
  return `限时 ${offStr} 折 · 省 ¥${price - sale}`;
}
