"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { Creator, Work } from "@/data/creators";
import { WorkDetail } from "./WorkDetail";

export function WorkGallery({
  works,
  creators,
}: {
  works: Work[];
  creators: Creator[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const byHandle = useMemo(() => {
    const m = new Map<string, Creator>();
    creators.forEach((c) => m.set(c.handle, c));
    return m;
  }, [creators]);

  const active = activeId ? works.find((w) => w.id === activeId) ?? null : null;

  if (works.length === 0) return null;

  return (
    <>
      <motion.div
        className="lab3-feed"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
      >
        {works.map((w) => {
          const c = byHandle.get(w.handle);
          return (
            <motion.article
              key={w.id}
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }}
              className="lab3-item"
            >
              <button type="button" className="lab3-item-hit" onClick={() => setActiveId(w.id)} aria-label={`查看作品 ${w.title}`}>
                <span className="lab3-item-media">
                  {w.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.thumb} alt={w.title} loading="lazy" />
                  ) : (
                    <span className="lab3-item-ph mono">EXP / {w.id.slice(-4).toUpperCase()}</span>
                  )}
                </span>
                <span className="lab3-item-meta">
                  <span className="lab3-item-title">{w.title}</span>
                  <span className="lab3-item-sub mono">
                    {w.type} · {w.status}
                  </span>
                </span>
              </button>
              <span className="lab3-item-author">
                <span className="lab3-author-av">{(c?.name || w.handle).slice(0, 1).toUpperCase()}</span>
                <span className="lab3-author-name mono">
                  {(c?.name ?? w.handle).toLowerCase()} · {w.date}
                </span>
              </span>
            </motion.article>
          );
        })}
      </motion.div>

      <WorkDetail
        work={active}
        creator={active ? byHandle.get(active.handle) ?? null : null}
        onClose={() => setActiveId(null)}
      />
    </>
  );
}
