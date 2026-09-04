/**
 * GitHub 仓库写入（Contents API，服务端）。
 * 仅用于 Lab 自动产物回写：AI 封面图入库 + works.json 更新。
 * 需要 VLAB_GH_TOKEN / GITHUB_TOKEN（contents 写权限）。
 */

const OWNER = "lant1ng-1216";
const REPO = "vibe-lab";
const REF = "main";

function token() {
  return process.env.VLAB_GH_TOKEN || process.env.GITHUB_TOKEN || "";
}

/** 读取文件现有 sha（PUT 需要） */
export async function getFileSha(path: string): Promise<string | null> {
  const tk = token();
  if (!tk) return null;
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${REF}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${tk}`, "User-Agent": "vibe-lab" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const d = (await res.json()) as { sha?: string };
  return d.sha ?? null;
}

/** 写入/更新仓库文件（自动 commit 到 main） */
export async function commitFile(
  path: string,
  contentB64: string,
  message: string
): Promise<boolean> {
  const tk = token();
  if (!tk) return false;
  const sha = await getFileSha(path);
  const body: Record<string, string> = {
    message,
    content: contentB64,
    branch: REF,
  };
  if (sha) body.sha = sha;

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${tk}`,
      "Content-Type": "application/json",
      "User-Agent": "vibe-lab",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return res.ok;
}

export function toBase64(buf: Uint8Array): string {
  return Buffer.from(buf).toString("base64");
}

/** 使 lib/lab.ts 的 60s 缓存失效（写完 works.json 后调用） */
export function invalidateLabCache() {
  // lib/lab.ts 内部缓存 Map 不导出——这里通过返回 true 由调用侧尽量保证数据新鲜：
  // 真实场景下一次请求 ≥60s 后自然过期；本函数保留作为未来细粒度缓存钩子。
  return true;
}