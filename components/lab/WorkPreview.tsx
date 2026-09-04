"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Work } from "@/data/creators";

/**
 * 作品预览（详情右栏）。
 * 优先级：
 *  1. 创作者上传演示视频（demoVideo）
 *  2. 创作者上传截图集（gallery）
 *  3. 均无 → 自动拉取该作品 GitHub 仓库的 README.md，站内渲染为可滚动文档
 *     （没有 README / link 非 GitHub → 显示作品简介兜底）
 */

function githubAbs(baseFull: string, branch: string, dir: string, src: string) {
  if (/^(https?:|data:|blob:|#|\/\/)/i.test(src)) return src;
  const root = `https://cdn.jsdelivr.net/gh/${baseFull}@${branch}/${dir ? dir + "/" : ""}`;
  return new URL(src, root).toString();
}

type State =
  | { phase: "loading" }
  | { phase: "err"; msg: string }
  | { phase: "md"; md: string; full: string; branch: string; dir: string };

export default function WorkPreview({ work }: { work: Work }) {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    let alive = true;
    setState({ phase: "loading" });
    const ctrl = new AbortController();
    fetch(`/api/lab-readme?link=${encodeURIComponent(work.link)}`, {
      cache: "no-store",
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        if (!alive) return;
        if (d && d.markdown) {
          setState({ phase: "md", md: d.markdown, full: d.full, branch: d.branch, dir: d.dir });
        } else {
          setState({ phase: "err", msg: "no-readme" });
        }
      })
      .catch(() => alive && setState({ phase: "err", msg: "network" }));
    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [work.id, work.link]);

  // 1) 演示视频（创作者上传）
  if (work.demoVideo) {
    return (
      <div className="lab4-preview-box">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <iframe
          className="lab4-video"
          src={work.demoVideo}
          title={`${work.title} 演示`}
          allowFullScreen
        />
      </div>
    );
  }

  // 2) 截图集（创作者上传）
  if (work.gallery && work.gallery.length > 0) {
    return (
      <div className="lab4-preview-box lab4-preview-imgs">
        {work.gallery.map((g, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={g} alt={`${work.title} ${i + 1}`} loading="lazy" />
        ))}
      </div>
    );
  }

  // 3) README 站内文档
  if (state.phase === "loading") {
    return (
      <div className="lab4-preview-box">
        <p className="lab4-preview-hint mono">正在读取 README ···</p>
      </div>
    );
  }

  if (state.phase === "err") {
    return (
      <div className="lab4-preview-box">
        <p className="lab4-preview-hint">
          这个作品还没有 README / 预览。可以先去作品本体看看 →
        </p>
        <a className="lab4-preview-link mono" href={work.link} target="_blank" rel="noopener noreferrer">
          打开作品 ↗
        </a>
      </div>
    );
  }

  return (
    <div className="lab4-readme-wrap">
      <div className="lab4-readme md-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            a({ href, children, ...rest }) {
              if (!href) return <a {...rest}>{children}</a>;
              if (/^#/.test(href)) return <a href={href} {...rest}>{children}</a>;
              if (/^https?:|^\/\//i.test(href)) {
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
                    {children}
                  </a>
                );
              }
              // 仓库内相对链接 → GitHub blob 页
              const u = `https://github.com/${state.full}/blob/${state.branch}/${
                state.dir ? state.dir + "/" : ""
              }${href}`;
              return (
                <a href={u} target="_blank" rel="noopener noreferrer" {...rest}>
                  {children}
                </a>
              );
            },
            img({ src, alt }) {
              if (typeof src !== "string") return null;
              const abs = githubAbs(state.full, state.branch, state.dir, src);
              // eslint-disable-next-line @next/next/no-img-element
              return <img src={abs} alt={alt || ""} loading="lazy" />;
            },
          }}
        >
          {state.md}
        </ReactMarkdown>
      </div>
      <p className="lab4-readme-src mono">README · {state.full}@{state.branch}</p>
    </div>
  );
}