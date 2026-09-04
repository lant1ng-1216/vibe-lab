import type { Creator, Work } from "@/data/creators";

/**
 * Lab 数据引擎（仅服务端）：从 vibe-lab GitHub 仓库 creators/ 实时拉取。
 *
 * 通道（自动降级）：
 *  1. VLAB_GH_TOKEN（或 GITHUB_TOKEN）存在 → GitHub Contents API（带 auth，可读 private 仓库）
 *  2. 无 token → jsdelivr CDN（仅 public 仓库可用）
 *
 * 部署提示：private 阶段在 Vercel 加环境变量 VLAB_GH_TOKEN（token 需 repo contents 只读权限）；
 * 仓库转 public 后可删 token（jsdelivr 自动接管）。
 */

const OWNER = "lant1ng-1216";
const REPO = "vibe-lab";
const REF = "main";

type CacheEntry<T> = { at: number; data: T };
const cache = new Map<string, CacheEntry<unknown>>();
const TTL = 60_000; // 60s 内存缓存，避免每请求打 GitHub

function token() {
  return process.env.VLAB_GH_TOKEN || process.env.GITHUB_TOKEN || "";
}

/** 拉取仓库内单个文本文件 */
export async function fetchRepoText(path: string): Promise<string | null> {
  const tk = token();

  // 通道 1：Contents API（private 可用，需 token）
  if (tk) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${REF}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${tk}`,
        Accept: "application/vnd.github.raw+json",
        "User-Agent": "vibe-lab",
      },
      cache: "no-store",
    });
    if (res.ok) return res.text();
  }

  // 通道 2：jsdelivr CDN（public 仓库、无需 token）
  const cdn = `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${REF}/${path}`;
  const res2 = await fetch(cdn, { cache: "no-store" });
  if (res2.ok) return res2.text();
  return null;
}

async function readJson<T>(path: string): Promise<T | null> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL) return hit.data as T;
  const text = await fetchRepoText(path);
  if (!text) return null;
  try {
    const data = JSON.parse(text) as T;
    cache.set(path, { at: Date.now(), data });
    return data;
  } catch {
    return null;
  }
}

type IndexCreator = Partial<Creator> & { dir?: string };
type IndexFile = { creators?: IndexCreator[] };
type WorksFile = { works?: Partial<Work>[] };

async function loadCreatorsRaw(): Promise<(Creator & { dir: string })[]> {
  const idx = await readJson<IndexFile>("creators/index.json");
  if (!idx?.creators?.length) return [];
  return idx.creators
    .filter((c) => c && c.handle)
    .map((c) => {
      const dir = c.dir || String(c.handle);
      return {
        handle: String(c.handle),
        name: c.name || String(c.handle),
        github: c.github,
        tagline: c.tagline || "",
        bio: c.bio || "",
        tags: c.tags || [],
        avatar: c.avatar || null,
        links: c.links || [],
        joinedAt: c.joinedAt || "",
        dir,
      } as Creator & { dir: string };
    });
}

async function loadWorksOf(dir: string): Promise<Work[]> {
  const wf = await readJson<WorksFile>(`creators/${dir}/works.json`);
  if (!wf?.works?.length) return [];
  return wf.works
    .filter((w) => w && w.id)
    .map((w) => ({
      id: String(w.id),
      handle: String(w.handle || ""),
      type: w.type || "Website",
      title: w.title || String(w.id),
      desc: w.desc || "",
      thumb: w.thumb || null,
      link: w.link || "#",
      status: w.status || "已上线",
      tags: w.tags || [],
      date: w.date || "",
      meta: w.meta,
      stats: w.stats,
      body: w.body,
      gallery: w.gallery,
    }) as Work);
}

export async function loadLab(): Promise<{ creators: Creator[]; works: Work[] }> {
  try {
    const creators = await loadCreatorsRaw();
    const works: Work[] = [];
    for (const c of creators) {
      const ws = await loadWorksOf(c.dir);
      ws.forEach((w) => (w.handle = c.handle)); // 注入所属 creator handle
      works.push(...ws);
    }
    return { creators, works };
  } catch {
    return { creators: [], works: [] };
  }
}

export async function listCreators(): Promise<Creator[]> {
  return (await loadLab()).creators;
}

export async function listWorks(): Promise<Work[]> {
  return (await loadLab()).works;
}

export async function getCreator(handle: string): Promise<Creator | null> {
  const c = (await listCreators()).find((x) => x.handle === handle);
  return c ?? null;
}

export async function worksOf(handle: string): Promise<Work[]> {
  return (await listWorks()).filter((w) => w.handle === handle);
}