"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { dissolveElement } from "../dissolve";
import styles from "./detail.module.css";

type Comment = {
  id: string;
  woolId: string;
  nick: string;
  body: string;
  createdAt: string;
  replyTo?: string;
  status: "visible" | "pending" | "hidden";
};

/** 一栋楼里的回复超过这个数就先折叠，点开再看全 */
const COLLAPSE_AT = 3;

type Node = Comment & { floor: number; children: Comment[] };

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} 小时前`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day} 天前`;
  return d.toLocaleDateString("zh-CN");
}

/**
 * 扁平列表 → 两层结构：根评论为楼，楼内回复全部平铺（不递归嵌套）。
 * 旧版是最多 5 层缩进的叠楼树，回复链一长就眼花缭乱（2026-09-07 老大反馈）。
 * 现在不管回复链多深，视觉上永远只有「楼 → 回复列表」一层；
 * 回复对象靠「回复 @昵称」标记说明，replyTo 数据格式不变。
 */
function buildTree(items: Comment[]): Node[] {
  const map = new Map<string, Comment>();
  items.forEach((c) => map.set(c.id, c));

  /** 沿 replyTo 一路向上找到所在楼的根。memo 防环防重复爬 */
  const rootMemo = new Map<string, string>();
  const rootOf = (id: string): string => {
    if (rootMemo.has(id)) return rootMemo.get(id) as string;
    const path = new Set<string>([id]);
    let cur = map.get(id);
    while (cur?.replyTo && map.has(cur.replyTo) && !path.has(cur.replyTo)) {
      path.add(cur.replyTo);
      cur = map.get(cur.replyTo);
    }
    const rootId = cur ? cur.id : id;
    path.forEach((p) => rootMemo.set(p, rootId));
    return rootId;
  };

  const nodes = new Map<string, Node>();
  items.forEach((c) => nodes.set(c.id, { ...c, floor: 0, children: [] }));

  const roots: Node[] = [];
  items.forEach((c) => {
    const rid = rootOf(c.id);
    if (rid === c.id) roots.push(nodes.get(c.id) as Node);
    else nodes.get(rid)?.children.push(nodes.get(c.id) as Comment);
  });

  roots.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  roots.forEach((r, i) => {
    r.floor = i + 1;
    r.children.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  });
  return roots;
}

function Floor({
  node,
  nickOf,
  onReply,
  onDelete,
  admin,
  replyTo,
}: {
  node: Node;
  nickOf: (id: string) => string;
  onReply: (id: string, text?: string) => void;
  onDelete: (id: string, btn: HTMLElement) => void;
  admin: boolean;
  replyTo: string | null;
}) {
  const [open, setOpen] = useState(node.children.length <= COLLAPSE_AT);
  const shown = open ? node.children : node.children.slice(0, COLLAPSE_AT);
  const folded = node.children.length - shown.length;

  return (
    <li className={styles.floor}>
      <div className={styles.floorHead}>
        <span className={styles.floorNo}>#{node.floor}</span>
        <span className={styles.floorNick}>{node.nick}</span>
        <span className={styles.floorTime}>{when(node.createdAt)}</span>
      </div>

      <p className={styles.floorBody}>{node.body}</p>

      <div className={styles.floorOps}>
        <button
          type="button"
          className={styles.opBtn}
          onClick={() => onReply(node.id)}
        >
          {replyTo === node.id ? "取消" : "回复"}
        </button>
        {folded > 0 || (!open && node.children.length > 0) ? (
          <button
            type="button"
            className={styles.opBtn}
            onClick={() => setOpen((v) => !v)}
          >
            {open
              ? `收起 ${node.children.length} 条回复`
              : `展开 ${node.children.length} 条回复`}
          </button>
        ) : null}
        {admin ? (
          <button
            type="button"
            className={styles.opBtn + " " + styles.opDanger}
            onClick={(e) => onDelete(node.id, e.currentTarget)}
          >
            删除
          </button>
        ) : null}
      </div>

      {replyTo === node.id ? (
        <div className={styles.replyForm}>
          <textarea
            className={styles.textarea}
            placeholder={`回复 ${node.nick}…`}
            maxLength={500}
            onKeyDown={(e) => {
              if (e.key === "Escape") onReply("");
            }}
            id={`reply-${node.id}`}
          />
          <button
            type="button"
            className={styles.send}
            onClick={() => {
              const el = document.getElementById(
                `reply-${node.id}`
              ) as HTMLTextAreaElement | null;
              onReply(node.id, el?.value || "");
            }}
          >
            回复
          </button>
        </div>
      ) : null}

      {node.children.length > 0 ? (
        <ul className={styles.replies}>
          {shown.map((c) => (
            <li key={c.id} className={styles.reply}>
              <div className={styles.replyHead}>
                <span className={styles.replyNick}>{c.nick}</span>
                {/* 回复楼主的不用标；回复楼内其他人的才标，不然一排标签全是噪音 */}
                {c.replyTo && c.replyTo !== node.id ? (
                  <span className={styles.floorTo}>
                    回复 @{nickOf(c.replyTo)}
                  </span>
                ) : null}
                <span className={styles.replyTime}>{when(c.createdAt)}</span>
              </div>
              <p className={styles.replyBody}>{c.body}</p>
              <button
                type="button"
                className={styles.opBtn}
                onClick={() => onReply(c.id)}
              >
                {replyTo === c.id ? "取消" : "回复"}
              </button>
              {admin ? (
                <button
                  type="button"
                  className={styles.opBtn + " " + styles.opDanger}
                  onClick={(e) =>
                    onDelete(c.id, (e.currentTarget.closest("li") as HTMLElement) || e.currentTarget)
                  }
                >
                  删除
                </button>
              ) : null}

              {replyTo === c.id ? (
                <div className={styles.replyForm}>
                  <textarea
                    className={styles.textarea}
                    placeholder={`回复 ${c.nick}…`}
                    maxLength={500}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") onReply("");
                    }}
                    id={`reply-${c.id}`}
                  />
                  <button
                    type="button"
                    className={styles.send}
                    onClick={() => {
                      const el = document.getElementById(
                        `reply-${c.id}`
                      ) as HTMLTextAreaElement | null;
                      onReply(c.id, el?.value || "");
                    }}
                  >
                    回复
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function WoolTalk({
  woolId,
  woolName,
}: {
  woolId: string;
  woolName: string;
}) {
  const [items, setItems] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(true);
  const [err, setErr] = useState("");
  const [nick, setNick] = useState("");
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("wool_nick");
    if (saved) setNick(saved);
    // 管理员密钥存 sessionStorage（会话级，关标签即失效），有就进管理员模式
    if (sessionStorage.getItem("wool_admin_key")) setAdmin(true);
  }, []);

  /** 管理员入口：输入密钥，只在删除时真正校验（401 则清掉退出模式） */
  function askAdmin() {
    if (admin) {
      sessionStorage.removeItem("wool_admin_key");
      setAdmin(false);
      return;
    }
    const key = window.prompt("输入管理员密钥：") || "";
    if (!key.trim()) return;
    sessionStorage.setItem("wool_admin_key", key.trim());
    setAdmin(true);
  }

  /** 先播粒子消散，动画毕才发 DELETE；失败把楼原样刷回来 */
  async function adminDelete(id: string, btn: HTMLElement) {
    const key = sessionStorage.getItem("wool_admin_key") || "";
    const floorEl =
      (btn.closest("li") as HTMLElement | null) || btn.parentElement;
    setDeletingId(id);
    if (floorEl) await dissolveElement(floorEl);
    try {
      const r = await fetch(
        `/api/wool/${encodeURIComponent(woolId)}/comments?id=${encodeURIComponent(id)}`,
        { method: "DELETE", headers: { "x-admin-key": key } }
      );
      const d = await r.json();
      if (d?.ok) {
        setItems((p) => p.filter((c) => c.id !== id));
      } else {
        if (r.status === 401) {
          sessionStorage.removeItem("wool_admin_key");
          setAdmin(false);
        }
        setErr(d?.error || "删除失败");
        void load();
      }
    } catch {
      setErr("删除失败，检查下网络");
      void load();
    } finally {
      setDeletingId(null);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/wool/${encodeURIComponent(woolId)}/comments`, {
        cache: "no-store",
      });
      const d = await r.json();
      if (d?.ok) {
        setItems(d.items || []);
        // 服务端没配好（缺 token / WOOL_TALK_ISSUE）时明说，别假装「还没人留言」
        if (d.ready === false) setErr("交流区服务端未配置，留言暂不可用（管理员需设置 WOOL_TALK_ISSUE 与 token）");
        setReady(d.ready !== false);
      } else setErr(d?.error || "留言加载失败");
    } catch {
      setErr("留言加载失败，检查下网络");
    } finally {
      setLoading(false);
    }
  }, [woolId]);

  useEffect(() => {
    void load();
  }, [load]);

  const tree = useMemo(() => buildTree(items), [items]);
  const nickOf = useCallback(
    (id: string) => items.find((c) => c.id === id)?.nick || "未知",
    [items]
  );

  async function post(text: string, parentId?: string) {
    const name = nick.trim();
    if (!name) return setErr("先填个昵称吧");
    if (!text.trim()) return setErr("说点什么再发");

    setErr("");
    setSending(true);
    try {
      localStorage.setItem("wool_nick", name);
      const r = await fetch(`/api/wool/${encodeURIComponent(woolId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nick: name,
          body: text.trim(),
          replyTo: parentId || undefined,
        }),
      });
      const d = await r.json();
      if (!d?.ok) {
        setErr(d?.error || "发送失败");
        return false;
      }
      setReplyTo(null);
      if (d.item?.status === "visible") setItems((p) => [...p, d.item]);
      else setErr("已提交，等站长审核后才会显示");
      return true;
    } catch {
      setErr("发送失败，检查下网络");
      return false;
    } finally {
      setSending(false);
    }
  }

  function onReply(id: string, text?: string) {
    if (text !== undefined) {
      void post(text, id).then((ok) => {
        if (ok) setReplyTo(null);
      });
      return;
    }
    setReplyTo((cur) => (cur === id ? null : id));
  }

  return (
    <section className={styles.talk}>
      <div className={styles.talkHead}>
        <h2 className={styles.talkTitle}>交流区</h2>
        <span className={styles.talkCount}>{items.length}</span>
        <button
          type="button"
          className={styles.opBtn}
          style={{ marginLeft: "auto" }}
          title="管理员"
          onClick={askAdmin}
        >
          {admin ? "管理员模式 ✓" : "🔐"}
        </button>
      </div>
      <p className={styles.talkHint}>
        关于「{woolName}」这条羊毛的补充、更正、实测反馈都可以留在这。
        发现额度变了或已经失效，也请说一声 —— 比任何审核都快。
      </p>

      {err ? <p className={styles.talkErr}>{err}</p> : null}

      <div className={styles.form}>
        <input
          className={styles.input}
          placeholder="昵称"
          value={nick}
          maxLength={24}
          onChange={(e) => setNick(e.target.value)}
        />
        <textarea
          className={styles.textarea}
          placeholder="说点什么…（最多 500 字）"
          value={body}
          maxLength={500}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className={styles.formBar}>
          <span className={styles.counter}>{body.length}/500</span>
          <button
            type="button"
            className={styles.send}
            disabled={sending || !ready}
            onClick={async () => {
              if (await post(body)) setBody("");
            }}
          >
            {!ready ? "交流区未配置" : sending ? "发送中…" : "发送"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className={styles.talkEmpty}>加载中…</p>
      ) : tree.length === 0 ? (
        <p className={styles.talkEmpty}>还没有人说话，你可以是第一个</p>
      ) : (
        <ul className={styles.floors}>
          {tree.map((n) => (
            <Floor
              key={n.id}
              node={n}
              nickOf={nickOf}
              onReply={onReply}
              onDelete={adminDelete}
              admin={admin && deletingId === null}
              replyTo={replyTo}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
