export type FeedSource = {
  id: string;
  name: string;
  url: string;
  lang: "zh" | "en";
  /** filter items by AI-related keywords (zh feeds) */
  aiOnly?: boolean;
};

/**
 * 聚合源配置 —— 想增删源直接改这里。
 * 说明：多为公开 RSS；版权归各源，站内只展示标题/摘要并跳原文。
 */
export const FEEDS: FeedSource[] = [
  {
    id: "ifanr",
    name: "爱范儿",
    url: "https://www.ifanr.com/feed",
    lang: "zh",
    aiOnly: true,
  },
  {
    id: "sspai",
    name: "少数派",
    url: "https://sspai.com/feed",
    lang: "zh",
    aiOnly: true,
  },
  {
    id: "tc-ai",
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    lang: "en",
  },
];

export const AI_KEYWORDS: string[] = [
  "ai",
  "人工智能",
  "大模型",
  "agent",
  "智能体",
  "claude",
  "openai",
  "chatgpt",
  "anthropic",
  "gemini",
  "gpt",
  "llm",
  "machine learning",
  "deepseek",
  "midjourney",
  "copilot",
  "vibe coding",
  "mistral",
  "rag",
  "stable diffusion",
];
