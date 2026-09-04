"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { WORK_TYPES, type Creator, type Work, type WorkType } from "@/data/creators";
import { WorkDetail } from "./WorkDetail";
import CreatorAvatar from "./CreatorAvatar";

const TABS: ("All" | WorkType)[] = ["All", ...WORK_TYPES];

type CoverInfo = { url?: string; summary?: string };

/** 解析 thumb → 可直接用于 img 的 src */
function resolveThumb(thumb: string | null): string | null {
  if (!thumb) return null;
  if (thumb.startsWith("/assets/") || /^https?:|^\/\//.test(thumb)) return thumb;
  if (thumb.startsWith("covers/") || thumb.startsWith("/covers/")) {
    return `/api/lab-cover-file?path=${thumb.replace(/^\//, "")}`;
  }
  return thumb;
}

/** desc 首句作为摘要兜底 */
function firstSentence(desc: string): string {
  const cut = desc.split(/[。；！？\n]/)[0].trim();
  if (!cut) return desc;
  return cut.length < desc.length ? cut + "。" : cut;
}

export function LabFeed({
  works,
  creators,
}: {
  works: Work[];
  creators: Creator[];
}) {
  const [tab, setTab] = useState<"All" | WorkType>("All");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [covers, setCovers] = useState<Record<string, CoverInfo>>({});

  // 无封面作品：异步调 /api/lab-cover（首次自动 AI 生成 + 回写，之后秒回缓存）
  useEffect(() => {
    let alive = true;
    works
      .filter((w) => !w.thumb && !covers[w.id])
      .forEach((w) => {
        fetch(`/api/lab-cover?workId=${encodeURIComponent(w.id)}`, { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .then((d: CoverInfo | null) => {
            if (alive && d && (d.url || d.summary)) {
              setCovers((p) => ({ ...p, [w.id]: { url: d.url, summary: d.summary } }));
            }
          })
          .catch(() => {});
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [works]);

  const byHandle = useMemo(() => {
    const m = new Map<string, Creator>();
    creators.forEach((c) => m.set(c.handle, c));
    return m;
  }, [creators]);

  const filtered = useMemo(
    () => (tab === "All" ? works : works.filter((w) => w.type === tab)),
    [works, tab]
  );

  const active = activeId ? works.find((w) => w.id === activeId) ?? null : null;

  // 空实验室（尚未有真实作品）：整版空态，等待 GitHub 数据接入
  if (works.length === 0) {
    return (
      <div className="lab4-empty lab4-empty--all">
        <p className="lab4-empty-k mono">VIBE LAB · THE BENCH</p>
        <p className="lab4-empty-t">实验室还空着 —— 第一位创作者正在路上</p>
        <p className="lab4-empty-d">
          作品会直接从 vibe-lab 的 GitHub 仓库拉取展示。站长正在接入第一批真实作品。
        </p>
        <Link href="/contact" className="lab4-empty-cta">
          申请入驻 ↗
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="lab4-tabs" role="tablist" aria-label="作品分类">
        <div className="lab4-tabs-row">
          {TABS.map((t) => {
            const n = t === "All" ? works.length : works.filter((w) => w.type === t).length;
            return (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={
                  "lab4-tab" +
                  (tab === t ? " is-on" : "") +
                  (n === 0 && t !== "All" ? " is-empty" : "")
                }
                onClick={() => setTab(t)}
              >
                {t}
                {n > 0 && <span className="lab4-tab-n">{n}</span>}
              </button>
            );
          })}
        </div>
        <Link href="/home" className="lab4-exit mono" aria-label="退出实验室">
          退出实验室 <span aria-hidden="true">↗</span>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="lab4-empty">
          <p className="lab4-empty-k mono">THE BENCH · {tab}</p>
          <p className="lab4-empty-t">这个分类还没有作品上台</p>
          <p className="lab4-empty-d">
            如果你做过「{tab}」类的作品，欢迎把它带进实验室——第一批作品正在收尾。
          </p>
          <Link href="/contact" className="lab4-empty-cta">
            申请入驻 ↗
          </Link>
        </div>
      ) : (
        <motion.div
          className="lab4-feed"
          layout
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035 } } }}
        >
        {filtered.map((w) => {
          const c = byHandle.get(w.handle);
          return (
            <motion.article
              layout
              key={w.id}
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } } }}
              className="lab4-card"
            >
              <button type="button" className="lab4-card-hit" onClick={() => setActiveId(w.id)} aria-label={`查看作品 ${w.title}`}>
                <span className="lab4-card-media">
                  {(() => {
                    const imgSrc = resolveThumb(w.thumb) || covers[w.id]?.url;
                    if (imgSrc) {
                      return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={imgSrc} src={imgSrc} alt={w.title} loading="lazy" />
                      );
                    }
                    return <span className="lab4-card-ph" aria-hidden="true">✦</span>;
                  })()}
                </span>
                <span className="lab4-card-copy">
                  <span className="lab4-card-title">{w.title}</span>
                  <span className="lab4-card-sub mono">{w.type} · {w.status}</span>
                  <span className="lab4-card-summary">
                    {covers[w.id]?.summary || w.cardSummary || firstSentence(w.desc)}
                  </span>
                </span>
                <span className="lab4-card-meta">
                  <span className="lab4-card-author">
                    {c ? (
                      <CreatorAvatar creator={c} className="lab4-author-av" />
                    ) : (
                      <span className="lab4-author-av">{(w.handle).slice(0, 1).toUpperCase()}</span>
                    )}
                    <span className="lab4-author-name">{c?.name ?? w.handle}</span>
                  </span>
                  <span className="lab4-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="lab4-card-act" aria-label="关闭" tabIndex={-1}>✕</button>
                    <a className="lab4-card-act" href={w.link} target="_blank" rel="noopener noreferrer" aria-label="打开原作品" tabIndex={-1}>↗</a>
                    <button type="button" className="lab4-card-act" aria-label="更多" tabIndex={-1}>⌘</button>
                  </span>
                </span>
              </button>
            </motion.article>
          );
        })}
        </motion.div>
      )}

      <WorkDetail
        work={active}
        creator={active ? byHandle.get(active.handle) ?? null : null}
        onClose={() => setActiveId(null)}
      />
    </>
  );
}
