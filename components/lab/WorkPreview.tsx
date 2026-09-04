"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Work } from "@/data/creators";

/**
 * 详情右栏：上图文（媒体） + 下文（README/简介），同一容器纵向滚动。
 * 图源优先级：创作者上传演示视频 > 上传截图 gallery > AI 自动封面。
 * 文档源：README.md 站内渲染；无 README → 简介兜底。
 */

type CoverState = { url?: string } | null;
type ReadmeState =
  | { phase: "loading" }
  | { phase: "err"; msg: string }
  | { phase: "md"; md: string; full: string; branch: string; dir: string };

function thumbSrc(thumb: string | null): string | null {
  if (!thumb) return null;
  if (thumb.startsWith("/assets/") || /^https?:|^\/\//.test(thumb)) return thumb;
  if (thumb.startsWith("covers/") || thumb.startsWith("/covers/")) {
    return `/api/lab-cover-file?path=${thumb.replace(/^\//, "")}`;
  }
  return thumb;
}

function readmeAbs(full: string, branch: string, dir: string, src: string) {
  if (/^(https?:|data:|blob:|#|\/\/)/i.test(src)) return src;
  const root = `https://cdn.jsdelivr.net/gh/${full}@${branch}/${dir ? dir + "/" : ""}`;
  return new URL(src, root).toString();
}

export default function WorkPreview({ work }: { work: Work }) {
  const [cover, setCover] = useState<CoverState>(null);
  const [readme, setReadme] = useState<ReadmeState>({ phase: "loading" });

  const hasUpload =
    !!work.demoVideo || (!!work.gallery && work.gallery.length > 0);

  // 顶部图：创作者上传的封面优先；否则确保 AI 封面存在（幂等）
  useEffect(() => {
    if (hasUpload) return;
    let alive = true;
    const local = thumbSrc(work.thumb);
    if (local) {
      setCover({ url: local });
      return;
    }
    fetch(`/api/lab-cover?workId=${encodeURIComponent(work.id)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.url) setCover({ url: d.url });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [work.id, work.thumb, work.demoVideo, work.gallery, hasUpload]);

  // 下方文档：README 站内渲染
  useEffect(() => {
    let alive = true;
    setReadme({ phase: "loading" });
    const ctrl = new AbortController();
    fetch(`/api/lab-readme?link=${encodeURIComponent(work.link)}`, {
      cache: "no-store",
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        if (!alive) return;
        if (d && d.markdown) {
          setReadme({ phase: "md", md: d.markdown, full: d.full, branch: d.branch, dir: d.dir });
        } else {
          setReadme({ phase: "err", msg: "no-readme" });
        }
      })
      .catch(() => alive && setReadme({ phase: "err", msg: "network" }));
    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [work.id, work.link]);

  return (
    <div className="lab4-pv">
      {/* ── 顶部：图 / 视频 ── */}
      {work.demoVideo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <iframe
          className="lab4-pv-video"
          src={work.demoVideo}
          title={`${work.title} 演示`}
          allowFullScreen
        />
      ) : work.gallery && work.gallery.length > 0 ? (
        <img className="lab4-pv-cover" src={work.gallery[0]} alt={work.title} loading="lazy" />
      ) : cover?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="lab4-pv-cover" src={cover.url} alt={work.title} loading="lazy" />
      ) : (
        <div className="lab4-pv-cover lab4-pv-cover--ph">✦</div>
      )}

      {/* ── 下方：文档 ── */}
      <div className="lab4-pv-doc">
        {readme.phase === "loading" && (
          <p className="lab4-pv-hint mono">正在读取 README ···</p>
        )}

        {readme.phase === "err" && (
          <div className="lab4-pv-hint">
            <p>这个作品还没有 README / 预览。可以先去作品本体看看 →</p>
            <a
              className="lab4-preview-link mono"
              href={work.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              打开作品 ↗
            </a>
          </div>
        )}

        {readme.phase === "md" && (
          <>
            <div className="md-body">
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
                    const u = `https://github.com/${readme.full}/blob/${readme.branch}/${
                      readme.dir ? readme.dir + "/" : ""
                    }${href}`;
                    return (
                      <a href={u} target="_blank" rel="noopener noreferrer" {...rest}>
                        {children}
                      </a>
                    );
                  },
                  img({ src, alt }) {
                    if (typeof src !== "string") return null;
                    const abs = readmeAbs(readme.full, readme.branch, readme.dir, src);
                    // eslint-disable-next-line @next/next/no-img-element
                    return <img src={abs} alt={alt || ""} loading="lazy" />;
                  },
                }}
              >
                {readme.md}
              </ReactMarkdown>
            </div>
            <p className="lab4-pv-src mono">
              README · {readme.full}@{readme.branch}
            </p>
          </>
        )}
      </div>
    </div>
  );
}