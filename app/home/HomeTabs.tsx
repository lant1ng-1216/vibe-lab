"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import AgentApp from "@/components/AgentApp";
import AnnouncementsDrawer from "@/components/AnnouncementsDrawer";
import type { GuideItem, LexiconItem, FindItem } from "@/data/homeExtra";
import type { PostItem } from "@/data/posts";

type MainTab = "agent" | "discover";

const MAIN_TABS: { key: MainTab; label: string; no: string }[] = [
  { key: "agent", label: "Lab Agent", no: "★" },
  { key: "discover", label: "发现", no: "02" },
];

/** 首页：Lab Agent 工作台 + 发现（三区同屏铺开，无嵌套） */
export default function HomeTabs({
  guide,
  lexicon,
  finds,
  posts,
}: {
  guide: GuideItem[];
  lexicon: LexiconItem[];
  finds: FindItem[];
  posts: PostItem[];
}) {
  const [tab, setTab] = useState<MainTab>("agent");

  return (
    <section className="htabs" aria-label="Vibe Lab 板块">
      {/* 主 tab 栏 */}
      <div className="htabs-bar" role="tablist" aria-label="切换板块">
        {MAIN_TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={"htab htab--main" + (tab === t.key ? " is-on" : "")}
            data-main={t.key}
            onClick={() => setTab(t.key)}
          >
            <span className="htab-no">{t.no}</span>
            <span className="htab-lbl">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="htabs-panel" data-tone={tab}>
        <AnimatePresence mode="wait">
          {/* ===== Lab Agent 桌面工作台 ===== */}
          {tab === "agent" && (
            <motion.div
              key="agent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <AgentApp />
            </motion.div>
          )}

          {/* ===== 发现：三区同屏 ===== */}
          {tab === "discover" && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="disc-all"
            >
              {/* ① 今日导读（三卡） */}
              <section className="disc-sec" aria-label="今日导读">
                <div className="disc-head">
                  <span className="dopa-flag mono">01 / TODAY</span>
                  <h2 className="disc-h2">今日导读</h2>
                  <span className="disc-note mono">每天三条 · 有人帮你筛好了</span>
                </div>
                <div className="dopa-guide-grid">
                  {guide.map((g, i) => {
                    const tone = ["gv", "go", "gl"][i % 3] as "gv" | "go" | "gl";
                    const Inner = (
                      <>
                        <span className={"dopa-big mono g-flag--" + tone}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="dopa-body">
                          <span className="dopa-meta">
                            <span className={"dopa-tag mono g-tag--" + tone}>{g.tag}</span>
                            <time className="dopa-date mono">{g.date}</time>
                          </span>
                          <span className="dopa-title">{g.title}</span>
                          <span className="dopa-why">{g.why}</span>
                        </span>
                        {g.href && (
                          <span className="dopa-arrow mono" aria-hidden="true">
                            ↗
                          </span>
                        )}
                      </>
                    );
                    return (
                      <div key={i}>
                        {g.href ? (
                          <a
                            className={"dopa-guide-card g-card--" + tone}
                            href={g.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {Inner}
                          </a>
                        ) : (
                          <div className={"dopa-guide-card g-card--" + tone}>{Inner}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ② 词典（黄） + ③ 收藏（粉） 双色同排 */}
              <div className="disc-duo">
                <section className="lex-tab" aria-label="野路子词典">
                  <div className="disc-subhead">
                    <span className="dopa-flag mono">02 / DICT</span>
                    <h3 className="disc-h3">野路子词典</h3>
                  </div>
                  <div className="lex-duo-list">
                    {lexicon.map((l) => (
                      <article key={l.term} className="lex-duo-item">
                        <h4 className="lex-duo-term">
                          {l.term}
                          {l.en && <span className="mono lex-duo-en">{l.en}</span>}
                        </h4>
                        <p className="lex-duo-def">{l.def}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="finds-tab" aria-label="本周收藏">
                  <div className="disc-subhead">
                    <span className="dopa-flag mono">03 / FOUND</span>
                    <h3 className="disc-h3">本周收藏</h3>
                  </div>
                  <ul className="finds-duo-list">
                    {finds.map((f, i) => (
                      <li key={i}>
                        {f.url ? (
                          <a
                            className="finds-duo-item"
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="finds-duo-top">
                              <span className="finds-duo-title">{f.title}</span>
                              <span className="finds-duo-arrow mono" aria-hidden="true">
                                ↗
                              </span>
                            </span>
                            <span className="finds-duo-src mono">{f.source}</span>
                            <span className="finds-duo-why">{f.why}</span>
                          </a>
                        ) : (
                          <div className="finds-duo-item">
                            <span className="finds-duo-top">
                              <span className="finds-duo-title">{f.title}</span>
                            </span>
                            <span className="finds-duo-src mono">{f.source}</span>
                            <span className="finds-duo-why">{f.why}</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 公告入口 chip */}
      {posts.length > 0 && (
        <div className="htabs-foot">
          <AnnouncementsDrawer posts={posts} />
        </div>
      )}
    </section>
  );
}
