/**
 * 羊毛投稿 · 存储层
 * -------------------------------------------------
 * 跟 lib/wool-comments.ts 同一套思路：投稿存哪、页面不管。
 * 目前实现：
 *   github —— 服务端用 GitHub API 开一个 Issue（用户全程不离开站点）
 *   memory —— 打到服务端日志里，本地联调用
 */

export type WoolSubmission = {
  name: string;
  quota: string;
  gate: string;
  validity: string;
  deadline?: string;
  how: string;
  trap?: string;
  href: string;
  proof: string;
  /** 投稿人自称，选填 */
  from?: string;
};

export const WOOL_LABEL = "羊毛投稿";

const OWNER = "lant1ng-1216";
const REPO = "vibe-lab";

function ghToken() {
  return process.env.VLAB_GH_TOKEN || process.env.GITHUB_TOKEN || "";
}

function toIssueBody(s: WoolSubmission): string {
  const line = (k: string, v: string) => `**${k}**：${v || "（未填）"}`;
  return [
    `## ${s.name} —— ${s.quota}`,
    "",
    line("工具名", s.name),
    line("白嫖额度", s.quota),
    line("领取门槛", s.gate),
    line("有效期", s.validity),
    line("截止日期", s.deadline || "—"),
    line("怎么领", s.how),
    line("坑点", s.trap || "—"),
    line("领取链接", s.href),
    "",
    "### 核实方式",
    s.proof,
    "",
    s.from ? `> 投稿人：${s.from}` : "> 投稿人：匿名",
    "",
    "---",
    "审核清单：① 亲自验真 ② 判价值 ③ 转数据（含 checkedAt）④ 定 weight ⑤ 回复并关闭",
  ].join("\n");
}

export async function submitWool(
  s: WoolSubmission
): Promise<{ ok: boolean; error?: string; issue?: number }> {
  const tk = ghToken();

  if (!tk) {
    // 没配 token：记日志并返回成功，方便本地联调（生产环境应配置，见 docs/WOOL-API.md）
    console.log("[wool-submit] 未配置 token，投稿内容：", JSON.stringify(s));
    return { ok: true };
  }

  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tk}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "vibe-lab",
    },
    body: JSON.stringify({
      title: `[羊毛] ${s.name} —— ${s.quota}`,
      body: toIssueBody(s),
      labels: [WOOL_LABEL],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await res.text();
    return { ok: false, error: `GitHub 返回 ${res.status}：${t.slice(0, 160)}` };
  }
  const d = (await res.json()) as { number: number };
  return { ok: true, issue: d.number };
}
