"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { FeedItem } from "@/lib/feed";
import { computeHotTerms, itemMatchesTerm } from "@/lib/trend";

type Lang = "all" | "zh" | "en";

function fmtDate(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function fmtClock(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * 首页右栏 · AI 头条单屏播放器
 * - 一屏一条大卡，自动轮播（5s），hover 暂停，可箭头 / 指示点手动切换
 * - 右上「更多资讯」打开右侧抽屉看当日全部
 * - 底部 AI 热词（真实词频统计），点击热词 → 打开抽屉并过滤该话题
 */
export default function NewsPlayer({ items }: { items: FeedItem[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("all");
  const [term, setTerm] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  const hot = useMemo(() => computeHotTerms(items, 7), [items]);

  // 自动轮播：5s 一条，hover 暂停
  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setInterval(() => setIdx((n) => (n + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [paused, items.length]);

  const go = useCallback(
    (dir: 1 | -1) => setIdx((n) => (n + dir + items.length) % items.length),
    [items.length]
  );

  // Esc 关抽屉
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // 抽屉打开时锁 body 滚动
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const current = items[idx];

  const drawerList = useMemo(() => {
    let l = items;
    if (lang !== "all") l = l.filter((i) => i.lang === lang);
    if (term) l = l.filter((i) => itemMatchesTerm(i, term));
    return l;
  }, [items, lang, term]);

  const pickTerm = (t: string) => {
    setTerm(t === term ? null : t);
    setDrawerOpen(true);
  };

  if (!current) return null;

  return (
    <>
      <section className="nplayer" aria-label="AI 头条资讯">
        {/* header */}
        <div className="nplayer-head">
          <h2 className="nplayer-title">AI 头条</h2>
          <button type="button" className="nplayer-more" onClick={() => setDrawerOpen(true)}>
            更多资讯 <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* 单屏大卡 */}
        <div
          ref={cardRef}
          className="nplayer-stage"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.a
              key={current.id}
              className="nplayer-card"
              href={current.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="ncard-meta">
                <span className={"tag tag--" + (current.lang === "zh" ? "ok" : "ac")}>
                  {current.source}
                </span>
                <time className="mono ncard-date">{fmtDate(current.date)}</time>
              </span>
              <span className="ncard-title">{current.title}</span>
              {current.summary && <span className="ncard-summary">{current.summary}</span>}
              <span className="ncard-open mono">阅读原文 ↗</span>
            </motion.a>
          </AnimatePresence>

          {/* arrows */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                className="narrow narrow--prev"
                aria-label="上一条"
                onClick={() => go(-1)}
              >
                ←
              </button>
              <button
                type="button"
                className="narrow narrow--next"
                aria-label="下一条"
                onClick={() => go(1)}
              >
                →
              </button>
            </>
          )}
        </div>

        {/* dots */}
        {items.length > 1 && (
          <div className="ndots" role="tablist" aria-label="资讯切换">
            {items.slice(0, 6).map((it, i) => (
              <button
                key={it.id}
                type="button"
                role="tab"
                aria-selected={i === idx % items.length}
                aria-label={`第 ${i + 1} 条`}
                className={"ndot" + (i === idx % items.length ? " is-on" : "")}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        )}

        {/* AI 热词（真实词频） */}
        {hot.length > 0 && (
          <div className="nplayer-hot">
            <span className="nplayer-hot-k mono">AI 热词</span>
            <div className="nplayer-hot-terms">
              {hot.map((h, i) => (
                <button
                  key={h.label}
                  type="button"
                  className={"hot-chip" + (term === h.label ? " is-on" : "")}
                  onClick={() => pickTerm(h.label)}
                  title={`只看含「${h.label}」的资讯`}
                >
                  {i < 3 && <i aria-hidden="true" />}
                  {h.label}
                  <b className="mono">{h.count}</b>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 更多资讯抽屉 */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="drawer-mask"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="今日 AI 资讯"
              initial={{ x: "104%" }}
              animate={{ x: 0 }}
              exit={{ x: "104%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="drawer-head">
                <div>
                  <h3 className="drawer-title">今日 AI 资讯</h3>
                  <p className="drawer-sub mono">
                    {drawerList.length} 条 · RSS 聚合 · 点击跳原文
                  </p>
                </div>
                <button
                  type="button"
                  className="drawer-close"
                  aria-label="关闭"
                  onClick={() => setDrawerOpen(false)}
                >
                  ✕
                </button>
              </div>

              {/* filters */}
              <div className="drawer-filters">
                <div className="chips chips--sm" role="tablist" aria-label="语言筛选">
                  {(
                    [
                      ["all", "全部"],
                      ["zh", "中文"],
                      ["en", "EN"],
                    ] as [Lang, string][]
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      role="tab"
                      aria-selected={lang === v}
                      className={"chip" + (lang === v ? " chip--on" : "")}
                      onClick={() => setLang(v)}
                    >
                      {label}
                      <span className="chip-count">
                        {v === "all"
                          ? items.length
                          : items.filter((i) => i.lang === v).length}
                      </span>
                    </button>
                  ))}
                </div>
                {term && (
                  <button type="button" className="term-pill" onClick={() => setTerm(null)}>
                    话题：{term} ✕
                  </button>
                )}
              </div>

              {/* list */}
              <div className="drawer-list">
                {drawerList.length === 0 ? (
                  <div className="empty">当前筛选下暂无资讯。</div>
                ) : (
                  drawerList.map((it) => (
                    <a
                      key={it.id}
                      className="drawer-item"
                      href={it.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="drawer-item-meta">
                        <span className={"tag tag--" + (it.lang === "zh" ? "ok" : "ac")}>
                          {it.source}
                        </span>
                        <span className={"drawer-lang mono" + (it.lang === "zh" ? " is-zh" : "")}>
                          {it.lang === "zh" ? "中" : "EN"}
                        </span>
                        <time className="mono drawer-item-time">
                          {fmtDate(it.date)} {fmtClock(it.date)}
                        </time>
                      </span>
                      <span className="drawer-item-title">{it.title}</span>
                      {it.summary && <span className="drawer-item-summary">{it.summary}</span>}
                    </a>
                  ))
                )}
              </div>

              <p className="drawer-legal mono">
                * 内容来自第三方公开 RSS，版权归原作者，仅展示摘要并跳转原文
              </p>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
