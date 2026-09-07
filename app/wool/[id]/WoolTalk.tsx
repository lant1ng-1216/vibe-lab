"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

/** 叠楼最多缩进几层，再深就平铺（否则手机上看不成） */
const MAX_DEPTH = 5;
/** 子回复超过这个数就折叠 */
const COLLAPSE_AT = 3;

type Node = Comment & { depth: number; floor: number; children: Node[] };

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

/** 扁平列表 → 叠楼树。孤儿回复（父级被删/不在）挂到顶层，保证不丢内容 */
function buildTree(items: Comment[]): Node[] {
  const map = new Map<string, Node>();
  items.forEach((c) => map.set(c.id, { ...c, depth: 0, floor: 0, children: [] }));

  const roots: Node[] = [];
  map.forEach((n) => {
    const parent = n.replyTo ? map.get(n.replyTo) : undefined;
    if (parent) parent.children.push(n);
    else roots.push(n);
  });

  const sorted = roots.sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
  );
  sorted.forEach((r, i) => r.floor = i + 1);

  const walk = (n: Node, d: number) => {
    n.depth = d;
    n.children.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    n.children.forEach((c) => walk(c, d + 1));
  };
  sorted.forEach((r) => walk(r, 0));
  return sorted;
}

function Item({
  node,
  nickOf,
  onReply,
  replyTo,
  depth,
}: {
  node: Node;
  nickOf: (id: string) => string;
  onReply: (id: string, text?: string) => void;
  replyTo: string | null;
  depth: number;
}) {
  const [open, setOpen] = useState(true);
  const hidden = node.children.length > COLLAPSE_AT && !open;
  const parentNick = node.replyTo ? nickOf(node.replyTo) : "";

  return (
    <li className={styles.floor} style={{ paddingLeft: depth === 0 ? 0 : 16 }}>
      <div className={styles.floorHead}>
        <span className={styles.floorNo}>#{node.floor}</span>
        <span className={styles.floorNick}>{node.nick}</span>
        {parentNick ? (
          <span className={styles.floorTo}>回复 @{parentNick}</span>
        ) : null}
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
        {node.children.length > COLLAPSE_AT ? (
          <button
            type="button"
            className={styles.opBtn}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? `收起 ${node.children.length} 条` : `展开 ${node.children.length} 条`}
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

      {node.children.length > 0 && !hidden ? (
        <ul className={styles.children}>
          {node.children.map((c) => (
            <Item
              key={c.id}
              node={c}
              nickOf={nickOf}
              onReply={onReply}
              replyTo={replyTo}
              depth={Math.min(depth + 1, MAX_DEPTH)}
            />
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
  const [err, setErr] = useState("");
  const [nick, setNick] = useState("");
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wool_nick");
    if (saved) setNick(saved);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/wool/${encodeURIComponent(woolId)}/comments`, {
        cache: "no-store",
      });
      const d = await r.json();
      if (d?.ok) setItems(d.items || []);
      else setErr(d?.error || "留言加载失败");
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
            disabled={sending}
            onClick={async () => {
              if (await post(body)) setBody("");
            }}
          >
            {sending ? "发送中…" : "发送"}
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
            <Item
              key={n.id}
              node={n}
              nickOf={nickOf}
              onReply={onReply}
              replyTo={replyTo}
              depth={0}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
