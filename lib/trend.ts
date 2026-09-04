/**
 * 从当日资讯标题自动统计 AI 热词（真实词频，非人工预估）
 * 在客户端调用：给到播放器/抽屉用于"点击热词 → 过滤该话题资讯"。
 */
import type { FeedItem } from "@/lib/feed";

type TermDef = { key: string; label: string };

/** AI 领域常见词表 —— 需要新增话题时在此加一行即可 */
const TERMS: TermDef[] = [
  { key: "agent", label: "Agent" },
  { key: "claude", label: "Claude" },
  { key: "anthropic", label: "Anthropic" },
  { key: "openai", label: "OpenAI" },
  { key: "gpt", label: "GPT" },
  { key: "gemini", label: "Gemini" },
  { key: "deepseek", label: "DeepSeek" },
  { key: "meta", label: "Meta" },
  { key: "llama", label: "Llama" },
  { key: "大模型", label: "大模型" },
  { key: "模型", label: "模型" },
  { key: "智能体", label: "智能体" },
  { key: "开源", label: "开源" },
  { key: "推理", label: "推理" },
  { key: "reasoning", label: "Reasoning" },
  { key: "算力", label: "算力" },
  { key: "芯片", label: "芯片" },
  { key: "nvidia", label: "NVIDIA" },
  { key: "视频", label: "视频" },
  { key: "图像", label: "图像" },
  { key: "image", label: "Image" },
  { key: "video", label: "Video" },
  { key: "voice", label: "Voice" },
  { key: "robot", label: "Robot" },
  { key: "coding", label: "Coding" },
  { key: "代码", label: "代码" },
  { key: "本地", label: "本地" },
  { key: "融资", label: "融资" },
  { key: "funding", label: "Funding" },
  { key: "谷歌", label: "谷歌" },
  { key: "微软", label: "微软" },
  { key: "苹果", label: "Apple" },
  { key: "安全", label: "安全" },
  { key: "safety", label: "Safety" },
];

export type HotTerm = { label: string; count: number };

/** 统计并返回 Top-N 热词（按出现次数降序，每标题每词最多计 1） */
export function computeHotTerms(items: FeedItem[], topN = 8): HotTerm[] {
  const count = new Map<string, number>();
  for (const it of items) {
    const title = it.title.toLowerCase();
    const hit = new Set<string>();
    for (const t of TERMS) {
      if (title.includes(t.key)) hit.add(t.label);
    }
    hit.forEach((label) => count.set(label, (count.get(label) ?? 0) + 1));
  }
  return [...count.entries()]
    .map(([label, n]) => ({ label, count: n }))
    // tiebreaker 用纯 Unicode 字符串比较（localeCompare 在 Node/浏览器 ICU locale 不同 → 顺序不一致 → hydration mismatch）
    .sort((a, b) => b.count - a.count || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
    .slice(0, topN);
}

/** 判断一条资讯标题是否命中某个热词（用于过滤） */
export function itemMatchesTerm(item: FeedItem, label: string): boolean {
  const t = TERMS.find((x) => x.label === label);
  if (!t) return true;
  return item.title.toLowerCase().includes(t.key);
}
