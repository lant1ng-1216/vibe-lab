import fs from "fs";
import path from "path";
import { TUTORIALS, type Tutorial, type TocEntry } from "@/data/tutorials";

/** 教程仓库内容拉取：jsdelivr CDN 优先，raw.githubusercontent 兜底。
 *  jsdelivr 会把仓库内容缓存分发，速度快；raw 直连保底。
 *  revalidate 让 Next 层做 1h 缓存，减少重复拉取。 */
export async function fetchMd(
  repo: string,
  branch: string,
  filePath: string
): Promise<string | null> {
  const enc = filePath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  const bases = [
    `https://cdn.jsdelivr.net/gh/${repo}@${branch}/`,
    `https://raw.githubusercontent.com/${repo}/${branch}/`,
  ];
  for (const base of bases) {
    try {
      const res = await fetch(base + enc, { next: { revalidate: 3600 } });
      if (res.ok) return await res.text();
    } catch {
      /* 尝试下一个源 */
    }
  }
  return null;
}

/* ---------- 章节目录读取（静态 toc json，入库） ---------- */
const TOC_DIR = path.join(process.cwd(), "data", "tutorials-toc");

export function readToc(id: string): TocEntry[] | null {
  try {
    const raw = fs.readFileSync(path.join(TOC_DIR, `${id}.json`), "utf-8");
    return JSON.parse(raw) as TocEntry[];
  } catch {
    return null;
  }
}

export function getTutorial(id: string): Tutorial | undefined {
  return TUTORIALS.find((t) => t.id === id);
}

/** 分组章节目录：{group: [entries]}，group 为 null 的分组归为「开头」 */
export function groupToc(toc: TocEntry[]) {
  const groups: { name: string; entries: TocEntry[] }[] = [];
  let cur = { name: "开头", entries: [] as TocEntry[] };
  for (const e of toc) {
    if (e.group && e.group !== cur.name) {
      groups.push(cur);
      cur = { name: e.group, entries: [] };
    }
    cur.entries.push(e);
  }
  groups.push(cur);
  return groups.filter((g) => g.entries.length > 0);
}

/** toc 内章节索引：把相对 md 路径映射到站内章节号；供正文内互链转换用 */
export function tocIndexMap(toc: TocEntry[]) {
  const m = new Map<string, number>();
  toc.forEach((e, i) => m.set(e.path, i));
  return m;
}
