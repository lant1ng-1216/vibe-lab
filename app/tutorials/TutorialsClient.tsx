"use client";

import { useMemo, useState } from "react";
import type { Tutorial } from "@/data/tutorials";

type TutorialItem = Tutorial & { chapters: number | null };

/* ---------- 图标 ---------- */
function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flex: "none" }}>
      <path d="M5 3h8v8M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- 卡片 ---------- */
function TutorialCard({ t }: { t: TutorialItem }) {
  const ready = t.chapters !== null;
  if (ready) {
    return (
      <a className="tcard tcard--link" href={`/tutorials/${t.id}`}>
        <div className="tcard-top">
          <span className="tcard-idx mono" aria-hidden="true">
            {t.org}
          </span>
          <span className="tcard-name">{t.title}</span>
          <span className="tcard-go" aria-hidden="true">
            <ArrowIcon />
          </span>
        </div>
        <p className="tcard-desc">{t.desc}</p>
        <div className="tcard-tags">
          <span className="tag tag--ac">{t.cat}</span>
          <span className="tag">{t.license}</span>
          <span className="tag tag--ok mono">{t.stars}★</span>
        </div>
        <div className="tcard-foot">
          <span className="tcard-meta mono">已收录 {t.chapters} 章 · 站内阅读</span>
          <span className="tcard-domain mono">{t.repo}</span>
        </div>
      </a>
    );
  }
  // 整理中：纯展示占位，灰色不可点
  return (
    <div className="tcard tcard--disabled">
      <div className="tcard-top">
        <span className="tcard-idx mono" aria-hidden="true">
          {t.org}
        </span>
        <span className="tcard-name">{t.title}</span>
      </div>
      <p className="tcard-desc">{t.desc}</p>
      <div className="tcard-tags">
        <span className="tag tag--ac">{t.cat}</span>
        <span className="tag">{t.license}</span>
        <span className="tag tag--ok mono">{t.stars}★</span>
      </div>
      <div className="tcard-foot">
        <span className="tcard-meta mono">整理中 · 即将上线</span>
        <span className="tcard-domain mono">{t.repo}</span>
      </div>
    </div>
  );
}

/* ---------- 区块头 ---------- */
function SectionHead({ no, title, count }: { no: string; title: string; count: number }) {
  return (
    <div className="tsec-head">
      <h2 className="tsec-title">
        <span className="mono tsec-no">{no}</span>
        {title}
      </h2>
      <span className="mono tsec-count">{count} 本</span>
    </div>
  );
}

/* ---------- 主组件 ---------- */
export default function TutorialsClient({
  tutorials,
  categories,
}: {
  tutorials: TutorialItem[];
  categories: string[];
}) {
  const [cat, setCat] = useState("全部");
  const [query, setQuery] = useState("");
  const [pendingOpen, setPendingOpen] = useState(true);

  const counts = useMemo(() => {
    const m: Record<string, number> = { 全部: tutorials.length };
    for (const t of tutorials) m[t.cat] = (m[t.cat] || 0) + 1;
    return m;
  }, [tutorials]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tutorials.filter((t) => {
      if (cat !== "全部" && t.cat !== cat) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.org.toLowerCase().includes(q) ||
        t.repo.toLowerCase().includes(q)
      );
    });
  }, [tutorials, cat, query]);

  const ready = list.filter((t) => t.chapters !== null);
  const pending = list.filter((t) => t.chapters === null);

  return (
    <>
      <div className="page-head">
        <div className="sec-num">02 / TUTORIALS</div>
        <h1>教程库</h1>
        <p className="lead">
          精选 GitHub 开源文字教程整本收录，站内直接阅读 —— 已收录的放心读，整理中的先去原仓库逛逛。
        </p>
      </div>

      <div className="toolbox">
        <div className="toolbox-bar">
          <label className="tsearch" htmlFor="tut-search">
            <span className="tsearch-icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.6" />
                <path d="M10.6 10.6L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <input
              id="tut-search"
              type="search"
              placeholder="搜索教程、关键词或出品方…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </label>
          <div className="toolbox-stats">
            <span className="mono">{ready.length}</span> 本可读 · <span className="mono">{pending.length}</span>{" "}
            本整理中
          </div>
        </div>

        <div className="chips" role="tablist" aria-label="教程分类">
          {["全部", ...categories].map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={cat === c}
              className={"chip" + (cat === c ? " chip--on" : "")}
              onClick={() => setCat(c)}
            >
              {c}
              <span className="chip-count">{counts[c] || 0}</span>
            </button>
          ))}
        </div>

        <p className="count-note mono">
          {cat === "全部" ? "全部教程" : cat} · {list.length} 本{query ? ` · 含「${query.trim()}」` : ""}
        </p>

        {ready.length > 0 && (
          <section className="tsec">
            <SectionHead no="01" title="站内已收录 · 可直接阅读" count={ready.length} />
            <div className="tgrid tgrid--tut">
              {ready.map((t) => (
                <TutorialCard key={t.id} t={t} />
              ))}
            </div>
          </section>
        )}

        {pending.length > 0 && (
          <section className="tsec tsec--pending">
            <button
              type="button"
              className={"tsec-toggle" + (pendingOpen ? " is-open" : "")}
              onClick={() => setPendingOpen((v) => !v)}
              aria-expanded={pendingOpen}
            >
              <span className="tsec-toggle-label">
                <span className="mono tsec-no">02</span>
                整理中 · 即将上线
              </span>
              <span className="mono tsec-toggle-meta">
                {pending.length} 本
                <svg className="tsec-chev" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            {pendingOpen && (
              <div className="tgrid tgrid--tut tsec-pending-grid">
                {pending.map((t) => (
                  <TutorialCard key={t.id} t={t} />
                ))}
              </div>
            )}
          </section>
        )}

        {ready.length === 0 && pending.length === 0 && (
          <div className="tempty">
            <p>没找到匹配的教程。</p>
            <p className="mono">换个关键词，或看看别的分类。</p>
          </div>
        )}
      </div>
    </>
  );
}
