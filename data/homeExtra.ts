/**
 * 首页"信息增量"模块数据 —— 全部由创始人手工维护
 * -------------------------------------------------
 * GUIDE  今日导读 ×3 ：当天值得看的三条 + 一句"为什么值得看"
 * LEXICON 野路子词典 ：每周解释一个 AI 黑话
 * FINDS  本周收藏   ：创始人这周挖到的有意思的小东西
 * 文案刻意短促（首页要多巴胺、少长文）。示例内容上线前替换即可。
 */

/* ---------------- 今日导读 GUIDE ---------------- */
export type GuideItem = {
  date: string;
  tag: string; // 领域标签
  title: string;
  why: string; // 一句话点评（≤ 24 字更佳）
  href?: string;
};

export const GUIDE: GuideItem[] = [
  {
    date: "09-04",
    tag: "Agent",
    title: "Claude 更新多工具并行调用",
    why: "自动化不再串行排队，做 Agent 快一大截。",
  },
  {
    date: "09-04",
    tag: "开源",
    title: "又一个大模型开源权重放出",
    why: "本地能跑、数据不出门，野路子更宽。",
  },
  {
    date: "09-03",
    tag: "工具",
    title: "AI 编辑器之争再进一步",
    why: "试试让 AI 主笔、你只做验收。",
  },
];

/* ---------------- 野路子词典 LEXICON ---------------- */
export type LexiconItem = {
  term: string;
  en?: string;
  def: string; // 一句话人话解释
  ex: string; // 一句话例子 / 什么时候用得上
};

export const LEXICON: LexiconItem[] = [
  {
    term: "Agent",
    en: "智能体",
    def: "能自己拆任务、一步步把活干完的 AI —— 不是问答，是办事。",
    ex: "例：'每天 9 点把行业新闻整理成摘要发我'，它自己规划、查资料、整理、发送。",
  },
  {
    term: "Vibe Coding",
    en: "随性编程",
    def: "用大白话指挥 AI 写代码，你管方向和验收。",
    ex: "例：'给我做一个能记录习惯打卡的小网页' —— 描述需求，AI 出成品。",
  },
  {
    term: "Skill",
    en: "技能包",
    def: "把重复的 AI 用法打包成可复用技能，一句话整套调用。",
    ex: "例：把'写小红书文案'的套路存成 Skill，丢个主题就出稿。",
  },
];

/* ---------------- 本周收藏 FINDS ---------------- */
export type FindItem = {
  title: string;
  source: string;
  url?: string;
  why: string; // 一句话推荐理由
};

export const FINDS: FindItem[] = [
  {
    title: "AI 工具按场景整理的全景地图",
    source: "GitHub",
    why: "找工具不用再全网乱翻。",
  },
  {
    title: "一篇把 Vibe Coding 讲透的长文",
    source: "即刻",
    why: "作者是真在用它干活的人。",
  },
  {
    title: "开源提示词合集，直接抄作业",
    source: "GitHub",
    why: "当自己的提示词库起点。",
  },
];
