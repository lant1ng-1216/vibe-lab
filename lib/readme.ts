/**
 * GitHub 仓库 README 拉取（服务端）。
 * 供 Lab 作品详情"无创作者上传图/视频 → 站内渲染 README 文档"使用。
 * 通道：有 token → GitHub Contents API（支持 private 仓库）；无 token → jsdelivr（public）。
 */

export type ReadmeData = {
  full: string; // owner/repo
  branch: string;
  path: string; // 如 README.md
  dir: string; // 所在目录（解析相对图片）
  markdown: string;
};

const CANDIDATES: { branch: string; paths: string[] }[] = [
  { branch: "main", paths: ["README.md", "readme.md", "Readme.md", "README", "readme"] },
  { branch: "master", paths: ["README.md", "readme.md", "Readme.md", "README", "readme"] },
];

let cached: { at: number; data: ReadmeData | null } | null = null;

export async function fetchReadme(link: string): Promise<ReadmeData | null> {
  const m = link.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  if (!m) return null;
  const [, owner, repo] = m;
  const full = `${owner}/${repo}`;

  if (cached && Date.now() - cached.at < 60_000 && cached.data?.full === full) {
    return cached.data;
  }

  const tk = process.env.VLAB_GH_TOKEN || process.env.GITHUB_TOKEN || "";

  for (const cand of CANDIDATES) {
    for (const p of cand.paths) {
      // 通道 1：Contents API（private 仓库，需要 token）
      if (tk) {
        try {
          const url = `https://api.github.com/repos/${full}/contents/${p}?ref=${cand.branch}`;
          const r = await fetch(url, {
            headers: {
              Authorization: `Bearer ${tk}`,
              Accept: "application/vnd.github.raw+json",
              "User-Agent": "vibe-lab",
            },
            cache: "no-store",
          });
          if (r.ok) {
            const data: ReadmeData = {
              full,
              branch: cand.branch,
              path: p,
              dir: p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "",
              markdown: await r.text(),
            };
            cached = { at: Date.now(), data };
            return data;
          }
        } catch {
          /* 尝试下一条 */
        }
      }

      // 通道 2：jsdelivr（public 仓库免 token）
      try {
        const u = `https://cdn.jsdelivr.net/gh/${full}@${cand.branch}/${p}`;
        const r2 = await fetch(u, { cache: "no-store" });
        if (r2.ok) {
          const data: ReadmeData = {
            full,
            branch: cand.branch,
            path: p,
            dir: p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "",
            markdown: await r2.text(),
          };
          cached = { at: Date.now(), data };
          return data;
        }
      } catch {
        /* 下一条 */
      }
    }
  }
  cached = { at: Date.now(), data: null };
  return null;
}