"use client";

import { useEffect, useMemo, useState } from "react";
import type { Tool } from "@/data/tools";
import { SKILLS, SKILL_PREVIEW_TAGS } from "@/data/skills";

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

/* ---------- Logo 头像：有官方 logo 显示图，否则回退首字母 ---------- */
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

/* ---------- 详情 Modal（居中弹窗） ---------- */
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

/* ---------- Skill 空态 ---------- */
function SkillEmpty({ onContact }: { onContact: () => void }) {
  const count = SKILLS.length;
  return (
    <div className="skill-empty">
      <div className="skill-empty-icon" aria-hidden="true">
        <span className="skill-empty-flask">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/flasks/green_1.png" alt="" width={40} height={40} />
        </span>
      </div>
      {count === 0 ? (
        <>
          <h3>Skill 收录中</h3>
          <p>
            Skill 是把「重复的 AI 用法」打包成的可复用技能包 —— 一份提示词、一个工作流、
            一段可安装的 Agent 技能。未来这里会聚合网上优秀的开源 Skill，装上就能用。
          </p>
          <div className="skill-empty-tags">
            {SKILL_PREVIEW_TAGS.map((t) => (
              <span key={t} className="tag tag--ac">
                {t}
              </span>
            ))}
          </div>
          <button type="button" className="skill-empty-btn" onClick={onContact}>
            有好 Skill 推荐？告诉我
          </button>
        </>
      ) : (
        <h3>共收录 {count} 个 Skill</h3>
      )}
    </div>
  );
}

/* ---------- 主组件 ---------- */
export default function ToolsClient({
  tools,
  categories,
}: {
  tools: Tool[];
  categories: string[];
}) {
  const [tab, setTab] = useState<"tools" | "skills">("tools");
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
    <>
      <div className="page-head">
        <div className="sec-num">01 / TOOLBOX</div>
        <h1>资源库</h1>
        <p className="lead">
          工具装齐一套「能打」的，技能随用随装 —— 别把时间浪费在找链接和配环境上。
        </p>
      </div>

      {/* 主 Tab：AI 工具 / Skill */}
      <div className="toolbox">
        <div className="ttabs-bar" role="tablist" aria-label="资源类型">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "tools"}
            className={"ttab" + (tab === "tools" ? " is-on" : "")}
            data-tone="tools"
            onClick={() => setTab("tools")}
          >
            <span className="ttab-no mono">01</span> AI 工具
            <span className="ttab-count mono">{tools.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "skills"}
            className={"ttab" + (tab === "skills" ? " is-on" : "")}
            data-tone="skills"
            onClick={() => setTab("skills")}
          >
            <span className="ttab-no mono">02</span> Skill
            <span className="ttab-count mono">{SKILLS.length}</span>
          </button>
        </div>

        {tab === "tools" ? (
          <div className="ttab-panel">
            <div className="toolbox-bar">
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

            <div className="chips" role="tablist" aria-label="分类筛选">
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
        ) : (
          <div className="ttab-panel">
            <SkillEmpty onContact={() => (window.location.href = "/contact")} />
          </div>
        )}
      </div>

      {/* 详情 Modal */}
      <ToolModal tool={activeTool} onClose={() => setActiveTool(null)} />
    </>
  );
}
