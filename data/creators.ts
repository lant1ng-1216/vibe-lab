// ============================================================
// Lab · 实验室 — 类型与 schema（数据实际从 GitHub 实时拉取，见 lib/lab.ts）
// ------------------------------------------------------------
// Lab = 作品展示场：入驻的人都是创作者，人人平等。
// 作品 = 创作者在 Vibe Lab 之外自己做的独立项目。
// 点击作品 → 站内弹出详情视图（左 metadata + 右预览），
// 「体验作品」跳原作者处。
// 真实数据源：github.com/lant1ng-1216/vibe-lab / creators/
// ============================================================

/**
 * Lab 作品分类全集（单一事实源）：
 * 顶部 tabs / 侧栏频道 / 筛选项都从这生成。新增分类只需在这里加一个词。
 */
export const WORK_TYPES = [
  "Design",
  "Website",
  "App",
  "Product",
  "Tutorial",
  "Agent",
  "Skill",
  "Article",
  "Video",
  "Audio",
  "Model",
] as const;
export type WorkType = (typeof WORK_TYPES)[number];
export const WORK_TYPE_LABEL: Record<WorkType, string> = {
  Design: "Design",
  Website: "Website",
  App: "App",
  Product: "Product",
  Tutorial: "Tutorial",
  Agent: "Agent",
  Skill: "Skill",
  Article: "Article",
  Video: "Video",
  Audio: "Audio",
  Model: "Model",
};
export type WorkStatus = "实验进行中" | "已上线" | "已开源";

export interface Creator {
  handle: string;
  name: string;
  /** GitHub 用户名：有则头像走 GitHub（创作者自行更换，Lab 同步），加载失败自动降级 */
  github?: string;
  /** 一句话自我介绍/签名 */
  tagline: string;
  bio: string;
  tags: string[];
  avatar: string | null;
  links: { label: string; href: string }[];
  joinedAt: string; // YYYY-MM
}

export interface WorkMeta {
  /** 作品中创作者担任的角色，如 "协议设计 / 全栈开发" */
  role?: string;
  /** 完成/发布年份 */
  published?: string;
  industry?: string;
  tech?: string[];
  color?: string;
  style?: string;
}

export interface Work {
  id: string;
  handle: string;
  type: WorkType;
  title: string;
  desc: string;
  /** 预览图 URL；null 用克制的黑白封面 */
  thumb: string | null;
  /** 体验地址（原作者处） */
  link: string;
  status: WorkStatus;
  tags?: string[];
  date: string;
  /** 详情视图扩展 */
  meta?: WorkMeta;
  stats?: { impressions?: number; outbound?: number };
  body?: string; // 长描述
  /** 演示视频（创作者上传，如 B 站 iframe / mp4）——详情预览优先展示 */
  demoVideo?: string;
  /** 截图集（创作者上传）——详情预览优先于 README 展示 */
  gallery?: string[]; // 多图预览
}
