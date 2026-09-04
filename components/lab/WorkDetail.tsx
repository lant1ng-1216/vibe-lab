"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { Creator, Work } from "@/data/creators";
import CreatorAvatar from "./CreatorAvatar";
import WorkPreview from "./WorkPreview";

export function WorkDetail({
  work,
  creator,
  onClose,
}: {
  work: Work | null;
  creator: Creator | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!work) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [work, onClose]);

  return (
    <AnimatePresence>
      {work && (
        <motion.div
          className="lab4-mask"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={work.title}
        >
          <motion.div
            className="lab4-detail"
            initial={{ opacity: 0, y: 20, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.995 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lab4-detail-bar">
              <div className="lab4-detail-bar-l">
                <span className="lab4-detail-bc mono">LAB / {work.id.slice(0, 8)}</span>
                <span className="lab4-detail-type mono">{work.type} · {work.status}</span>
              </div>
              <div className="lab4-detail-bar-r">
                <a className="lab4-go" href={work.link} target="_blank" rel="noopener noreferrer">
                  体验作品 ↗
                </a>
                <button type="button" className="lab4-close" onClick={onClose} aria-label="关闭">✕</button>
              </div>
            </div>

            <div className="lab4-detail-grid">
              <aside className="lab4-detail-meta">
                {creator && (
                  <div className="lab4-dauthor">
                    <CreatorAvatar creator={creator} className="lab4-dauthor-av" />
                    <div className="lab4-dauthor-info">
                      <p className="lab4-dauthor-name">{creator.name}</p>
                      <p className="lab4-dauthor-tag mono">{creator.tagline}</p>
                    </div>
                    <Link className="lab4-dauthor-link mono" href={`/lab/${creator.handle}`}>
                      个人页 ↗
                    </Link>
                  </div>
                )}

                <h2 className="lab4-dtitle">{work.title}</h2>
                <p className="lab4-dbody">{work.body || work.desc}</p>

                <dl className="lab4-dmeta">
                  {work.meta?.role && <><div className="lab4-drow"><dt>Role</dt><dd>{work.meta.role}</dd></div></>}
                  {work.meta?.published && <><div className="lab4-drow"><dt>Published</dt><dd>{work.meta.published}</dd></div></>}
                  {work.meta?.industry && <><div className="lab4-drow"><dt>Industry</dt><dd>{work.meta.industry}</dd></div></>}
                  {work.meta?.tech && <><div className="lab4-drow"><dt>Stack</dt><dd>{work.meta.tech.join(" / ")}</dd></div></>}
                  {work.meta?.style && <><div className="lab4-drow"><dt>Style</dt><dd>{work.meta.style}</dd></div></>}
                  {work.tags && work.tags.length > 0 && <><div className="lab4-drow"><dt>Tags</dt><dd>{work.tags.join(" · ")}</dd></div></>}
                  <div className="lab4-drow"><dt>Date</dt><dd>{work.date}</dd></div>
                  <div className="lab4-drow"><dt>Status</dt><dd>{work.status}</dd></div>
                </dl>

                {work.stats && (
                  <div className="lab4-dstats">
                    <div className="lab4-dstat">
                      <span className="lab4-dstat-n">{work.stats.impressions?.toLocaleString() ?? "—"}</span>
                      <span className="lab4-dstat-l">Impressions</span>
                    </div>
                    <div className="lab4-dstat">
                      <span className="lab4-dstat-n">{work.stats.outbound?.toLocaleString() ?? "—"}</span>
                      <span className="lab4-dstat-l">Outbound</span>
                    </div>
                  </div>
                )}
              </aside>

              <div className="lab4-detail-preview">
                <WorkPreview work={work} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
