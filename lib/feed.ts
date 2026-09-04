import { XMLParser } from "fast-xml-parser";
import { FEEDS, AI_KEYWORDS, type FeedSource } from "@/config/feeds";

export type FeedItem = {
  id: string;
  source: string; // source label
  lang: "zh" | "en";
  title: string;
  link: string;
  date: number; // epoch ms
  summary?: string;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

const stripHtml = (s: string) =>
  s
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function isAiRelated(title: string, summary: string): boolean {
  const t = `${title} ${summary}`.toLowerCase();
  return AI_KEYWORDS.some((k) => t.includes(k));
}

async function fetchFeed(src: FeedSource): Promise<FeedItem[]> {
  const res = await fetch(src.url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; VibeLab-bot/1.0)" },
    signal: AbortSignal.timeout(9000),
  });
  if (!res.ok) return [];
  const xml = await res.text();
  const doc = parser.parse(xml);
  const channel = doc?.rss?.channel;
  const items: any[] = Array.isArray(channel?.item)
    ? channel.item
    : channel?.item
    ? [channel.item]
    : [];
  const out: FeedItem[] = [];
  for (const it of items.slice(0, 15)) {
    const title = stripHtml(String(it.title ?? "")).slice(0, 160);
    if (!title) continue;
    const link = String(it.link ?? it["@_link"] ?? "").trim();
    if (!link) continue;
    const summary = stripHtml(String(it.description ?? "")).slice(0, 220);
    if (src.aiOnly && !isAiRelated(title, summary)) continue;
    const date = it.pubDate ? new Date(String(it.pubDate)).getTime() : Date.now();
    out.push({
      id: `${src.id}-${title.slice(0, 40)}`,
      source: src.name,
      lang: src.lang,
      title,
      link,
      date: isNaN(date) ? Date.now() : date,
      summary: summary || undefined,
    });
  }
  return out;
}

/** 并发抓取所有源，合并去重，按时间倒序。 */
export async function collectFeed(limit = 18): Promise<FeedItem[]> {
  const results = await Promise.allSettled(FEEDS.map((f) => fetchFeed(f)));
  const merged: FeedItem[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const it of r.value) {
      const key = it.title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(it);
    }
  }
  merged.sort((a, b) => b.date - a.date);
  return merged.slice(0, limit);
}
