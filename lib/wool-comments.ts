/**
 * 羊毛福利专区 · 交流区存储层
 * -------------------------------------------------
 * 设计目的：把「留言存在哪」和「页面怎么用」彻底解耦。
 * 页面只认 WoolComment 这一种结构，换存储（GitHub / CloudBase / Supabase / 自建后端）
 * 只改本文件的 provider 实现，页面与 API 路由一行都不用动。
 *
 * 环境变量：
 *   WOOL_COMMENTS_PROVIDER = github | memory     （默认：生产 github，开发 memory）
 *   WOOL_TALK_ISSUE        = <Issue 号>          （github provider 用，承载全部交流的 Issue）
 *   VLAB_GH_TOKEN          = <PAT>               （复用站点已有的 GitHub 写 token）
 *   WOOL_COMMENTS_MODERATE = 1                   （开了则新留言先进待审，不直接展示）
 */

export type WoolComment = {
  id: string;
  woolId: string;
  nick: string;
  /** 留言正文，纯文本，最长 500 字 */
  body: string;
  /** ISO 时间 */
  createdAt: string;
  /** 回复的目标评论 id，顶级留言为空 */
  replyTo?: string;
  /** visible 展示 / pending 待审 / hidden 已隐藏 */
  status: "visible" | "pending" | "hidden";
};

export type NewComment = {
  woolId: string;
  nick: string;
  body: string;
  replyTo?: string;
};

type Provider = {
  list(woolId: string): Promise<WoolComment[]>;
  add(c: NewComment): Promise<WoolComment | null>;
  hide(id: string): Promise<boolean>;
};

/* ------------------------------------------------------------------ */
/* memory：开发/联调用，进程内数组，重启即清空                          */
/* ------------------------------------------------------------------ */
const mem: WoolComment[] = [];

const memoryProvider: Provider = {
  async list(woolId) {
    return mem.filter((c) => c.woolId === woolId && c.status !== "hidden");
  },
  async add(c) {
    const item: WoolComment = {
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      woolId: c.woolId,
      nick: c.nick,
      body: c.body,
      createdAt: new Date().toISOString(),
      replyTo: c.replyTo,
      status: process.env.WOOL_COMMENTS_MODERATE ? "pending" : "visible",
    };
    mem.push(item);
    return item;
  },
  async hide(id) {
    const t = mem.find((c) => c.id === id);
    if (!t) return false;
    t.status = "hidden";
    return true;
  },
};

/* ------------------------------------------------------------------ */
/* github：用一个 Issue 承载全部羊毛交流                                */
/* 每条留言 = 一条 Issue comment，body 存 JSON，靠 woolId 字段分组       */
/* 优点：零数据库、零新增服务、站长在 GitHub 上直接可见可删，还自带通知   */
/* ------------------------------------------------------------------ */
const OWNER = "lant1ng-1216";
const REPO = "vibe-lab";

function ghToken() {
  return process.env.VLAB_GH_TOKEN || process.env.GITHUB_TOKEN || "";
}
function ghHeaders() {
  return {
    Authorization: `Bearer ${ghToken()}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "vibe-lab",
  } as Record<string, string>;
}
function talkIssue() {
  return Number(process.env.WOOL_TALK_ISSUE || 0);
}

/** 解析一条 Issue comment 的 body → WoolComment；不是本系统的留言返回 null */
function parseComment(raw: { id: number; body?: string }): WoolComment | null {
  if (!raw.body) return null;
  try {
    const j = JSON.parse(raw.body) as Partial<WoolComment>;
    if (!j || typeof j.woolId !== "string") return null;
    return {
      id: String(raw.id),
      woolId: j.woolId,
      nick: String(j.nick || "匿名"),
      body: String(j.body || ""),
      createdAt: String(j.createdAt || new Date().toISOString()),
      replyTo: j.replyTo,
      status: (j.status as WoolComment["status"]) || "visible",
    };
  } catch {
    return null;
  }
}

const githubProvider: Provider = {
  async list(woolId) {
    const tk = ghToken();
    const n = talkIssue();
    if (!tk || !n) return [];
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/issues/${n}/comments?per_page=100`;
    const res = await fetch(url, { headers: ghHeaders(), cache: "no-store" });
    if (!res.ok) return [];
    const arr = (await res.json()) as { id: number; body?: string }[];
    return arr
      .map(parseComment)
      .filter((c): c is WoolComment => !!c && c.woolId === woolId && c.status !== "hidden");
  },
  async add(c) {
    const tk = ghToken();
    const n = talkIssue();
    if (!tk || !n) return null;
    const payload: Omit<WoolComment, "id"> = {
      woolId: c.woolId,
      nick: c.nick,
      body: c.body,
      createdAt: new Date().toISOString(),
      replyTo: c.replyTo,
      status: process.env.WOOL_COMMENTS_MODERATE ? "pending" : "visible",
    };
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/issues/${n}/comments`,
      {
        method: "POST",
        headers: { ...ghHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ body: JSON.stringify(payload) }),
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const d = (await res.json()) as { id: number; body?: string };
    return parseComment(d);
  },
  async hide(id) {
    const tk = ghToken();
    const n = talkIssue();
    if (!tk || !n) return false;
    // GitHub 不支持编辑他人 comment，这里用删除代替隐藏
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/issues/comments/${id}`,
      { method: "DELETE", headers: ghHeaders(), cache: "no-store" }
    );
    return res.ok;
  },
};

/* ------------------------------------------------------------------ */
/* 对外出口                                                            */
/* ------------------------------------------------------------------ */
function current(): Provider {
  const p = (process.env.WOOL_COMMENTS_PROVIDER || "").toLowerCase();
  if (p === "github") return githubProvider;
  if (p === "memory") return memoryProvider;
  return process.env.NODE_ENV === "production" ? githubProvider : memoryProvider;
}

export async function listComments(woolId: string): Promise<WoolComment[]> {
  try {
    return await current().list(woolId);
  } catch {
    return [];
  }
}

export async function addComment(c: NewComment): Promise<WoolComment | null> {
  return current().add(c);
}

export async function hideComment(id: string): Promise<boolean> {
  return current().hide(id);
}

/** 给前端判断是否已配置好（没配好时提示站长，而不是假装成功） */
export function commentsReady(): boolean {
  const p = (process.env.WOOL_COMMENTS_PROVIDER || "").toLowerCase();
  if (p === "memory") return true;
  return !!(ghToken() && talkIssue());
}
