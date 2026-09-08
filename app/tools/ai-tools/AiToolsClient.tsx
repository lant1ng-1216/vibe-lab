"use client";

/* AI 工具二级页 —— 资源库点「AI 工具」入口卡跳转过来（2026-09-07）
   搜索 / 分类筛选 / 工具网格 / 详情 Modal，风格与资源库主站一致 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Tool } from "@/data/tools";

/* ---------- 图标 ---------- */
function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flex: "none" }}>
      <path d="M5 3h8v8M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Badge({ text, type }: { text: string; type: string }) {
  return <span className={`tag tag--${type || ""}`}>{text}</span>;
}

/* ---------- Logo 头像 ---------- */
function LogoAvatar({ tool }: { tool: Tool }) {
  const hasExt = tool.logo ? /\.(svg|png|jpe?g|webp)$/i.test(tool.logo) : false;
  const src = tool.logo
    ? `/assets/tool-logos/${hasExt ? tool.logo : tool.logo + ".png"}`
    : "";
  return (
    <span className="tcard-avatar tcard-avatar--img">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${tool.name} logo`}
        width={40}
        height={40}
        loading="lazy"
        onError={(e) => {
          (e.currentTarget.parentElement as HTMLElement)?.setAttribute("data-fallback", "1");
          e.currentTarget.style.display = "none";
        }}
      />
      {tool.logo ? null : (
        <span className="tcard-avatar-fallback" aria-hidden="true">
          {tool.name.charAt(0)}
        </span>
      )}
    </span>
  );
}

/* ---------- 卡片 ---------- */
function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: (t: Tool) => void }) {
  return (
    <button type="button" className="tcard tcard--btn" onClick={() => onOpen(tool)}>
      <div className="tcard-top">
        <LogoAvatar tool={tool} />
        <span className="tcard-name">{tool.name}</span>
        <span className="tcard-more">详情</span>
      </div>
      <p className="tcard-desc">{tool.desc}</p>
      <div className="tcard-tags">
        {tool.badges.map((b) => (
          <Badge key={b.text} text={b.text} type={b.type} />
        ))}
        <span className="tag tag--ac">{tool.cat}</span>
      </div>
    </button>
  );
}

/* ---------- 详情 Modal ---------- */
function ToolModal({ tool, onClose }: { tool: Tool | null; onClose: () => void }) {
  useEffect(() => {
    if (!tool) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [tool, onClose]);

  if (!tool) return null;

  return (
    <div className="modal-mask" onClick={onClose} role="dialog" aria-modal="true" aria-label={tool.name}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-x" onClick={onClose} aria-label="关闭">
          ✕
        </button>

        <div className="modal-head">
          <span className="modal-logo">
            {tool.logo ? (
              (() => {
                const m = tool.logo.match(/\.[a-z]+$/i);
                const ext = m ? m[0] : ".png";
                const id = tool.logo.replace(/\.[a-z]+$/i, "");
                // eslint-disable-next-line @next/next/no-img-element
                return <img src={`/assets/tool-logos/${id}${ext}`} alt="" width={48} height={48} />;
              })()
            ) : (
              tool.name.charAt(0)
            )}
          </span>
          <div className="modal-head-text">
            <h2>{tool.name}</h2>
            <div className="modal-badges">
              {tool.badges.map((b) => (
                <Badge key={b.text} text={b.text} type={b.type} />
              ))}
              <span className="tag tag--ac">{tool.cat}</span>
            </div>
          </div>
        </div>

        <p className="modal-desc">{tool.longDesc}</p>

        <div className="modal-actions">
          {tool.links.map((l) => (
            <span key={l.url} className="modal-act">
              <a className="modal-btn" href={l.url} target="_blank" rel="noopener noreferrer">
                {l.label}
                <ArrowIcon />
              </a>
              {l.note && <span className="modal-btn-note mono">{l.note}</span>}
            </span>
          ))}
        </div>

        <p className="modal-note mono">点击上方按钮跳转官网 · 本站仅作收录导航</p>
      </div>
    </div>
  );
}

/* ---------- 主组件 ---------- */
export default function AiToolsClient({
  tools,
  categories,
}: {
  tools: Tool[];
  categories: string[];
}) {
  const [cat, setCat] = useState("全部");
  const [query, setQuery] = useState("");
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  const counts = useMemo(() => {
    const m: Record<string, number> = { 全部: tools.length };
    for (const t of tools) m[t.cat] = (m[t.cat] || 0) + 1;
    return m;
  }, [tools]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      if (cat !== "全部" && t.cat !== cat) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.links.some((l) => l.url.toLowerCase().includes(q))
      );
    });
  }, [tools, cat, query]);

  return (
    <div className="tools-home-wrap">
      {/* 标题区：横排压缩，返回按钮挂右上 */}
      <div className="aitools-head">
        <div className="aitools-head-text">
          <div className="sec-num">01 / TOOLBOX</div>
          <h1>AI 工具</h1>
          <p className="lead">
            能直接上手的 AI 工具收录 —— 搜索或按分类找，点击卡片看详情与官网入口。
          </p>
        </div>
        <Link href="/tools" className="skill-empty-btn" style={{ textDecoration: "none" }}>
          ← 返回资源库
        </Link>
      </div>

      <div className="toolbox aitools-panel">
        {/* 搜索 + 统计 + 分类收进同一个面板容器 */}
        <div className="aitools-box">
          <div className="aitools-toolbar">
            <label className="tsearch" htmlFor="tool-search">
              <span className="tsearch-icon" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M10.6 10.6L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="tool-search"
                type="search"
                placeholder="搜索工具名或用途…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
            </label>
            <p className="toolbox-stats">
              <span className="mono">{list.length}</span> 款工具 · 点击卡片看详情
            </p>
          </div>

          <div className="aitools-chips" role="tablist" aria-label="分类筛选">
            {["全部", ...categories].map((c) => (
              <button
                key={c}
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
        </div>

        {list.length > 0 ? (
          <div className="tgrid">
            {list.map((t) => (
              <ToolCard key={t.id} tool={t} onOpen={setActiveTool} />
            ))}
          </div>
        ) : (
          <div className="empty">
            {query
              ? `没有搜到「${query}」相关工具 —— 有推荐？联系我收录。`
              : "这个分类还没收录工具 —— 有推荐？联系我收录。"}
          </div>
        )}
      </div>

      <ToolModal tool={activeTool} onClose={() => setActiveTool(null)} />
    </div>
  );
}
