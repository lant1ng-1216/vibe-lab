"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { PostItem } from "@/data/posts";

const LS_KEY = "vibelab_seen_announcements";

function fmtLatest(posts: PostItem[]) {
  if (!posts.length) return "";
  return posts.map((p) => p.date).sort().slice(-1)[0] || "";
}

/** 站内公告：首次访问自动展开 Drawer，已读后只以 chip 形式重开 */
export default function AnnouncementsDrawer({ posts }: { posts: PostItem[] }) {
  const latest = fmtLatest(posts);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!latest) return;
    try {
      const seen = window.localStorage.getItem(LS_KEY);
      if (seen !== latest) {
        // 延迟打开，避免与首屏加载抢戏
        const t = setTimeout(() => setOpen(true), 700);
        return () => clearTimeout(t);
      }
    } catch {
      /* localStorage 可能被禁用 */
    }
  }, [latest]);

  function close() {
    setOpen(false);
    try {
      window.localStorage.setItem(LS_KEY, latest);
    } catch {
      /* noop */
    }
  }

  return (
    <>
      {/* 触发 chip */}
      <button type="button" className="ann-chip mono" onClick={() => setOpen(true)}>
        <i aria-hidden="true" />
        站内公告 · {posts.length}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="drawer-mask"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={close}
            />
            <motion.aside
              className="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Vibe Lab 站内公告"
              initial={{ x: "104%" }}
              animate={{ x: 0 }}
              exit={{ x: "104%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="drawer-head">
                <div>
                  <h3 className="drawer-title">站内公告</h3>
                  <p className="drawer-sub mono">
                    {posts.length} 条 · 实验室动态、新课纲、新收录
                  </p>
                </div>
                <button
                  type="button"
                  className="drawer-close"
                  aria-label="关闭"
                  onClick={close}
                >
                  ✕
                </button>
              </div>

              {posts.length === 0 ? (
                <div className="empty">暂无公告。</div>
              ) : (
                <div className="drawer-list">
                  {posts.map((p) => (
                    <a
                      key={p.id}
                      className="ann-item"
                      href={p.href}
                      target={p.href.startsWith("http") ? "_blank" : undefined}
                      rel={p.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      <span className="ann-meta">
                        <span className="tag tag--ac">{p.tag}</span>
                        <time className="ann-date mono">{p.date}</time>
                      </span>
                      <span className="ann-title">{p.title}</span>
                      {p.desc && <span className="ann-desc">{p.desc}</span>}
                    </a>
                  ))}
                </div>
              )}

              <p className="drawer-legal mono">
                * 公告以最新日期为版本 · 关闭后本次会话不再自动弹
              </p>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}