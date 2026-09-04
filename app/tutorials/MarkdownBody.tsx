"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { memo } from "react";
import type { TocEntry } from "@/data/tutorials";

type Props = {
  content: string;
  repo: string;
  branch: string;
  filePath: string; // 当前章节路径（用于解析相对资源）
  toc?: TocEntry[]; // 供相对章节链接 -> 站内跳转
  base: string; // 站内教程根 /tutorials/<id>
};

/** 把 md 里的相对资源路径解析成 jsdelivr 绝对 URL */
function absUrl(src: string, repo: string, branch: string, filePath: string) {
  if (/^(https?:|data:|blob:|#)/i.test(src)) return src;
  const dir = filePath.includes("/") ? filePath.slice(0, filePath.lastIndexOf("/")) : "";
  const base = `https://cdn.jsdelivr.net/gh/${repo}@${branch}/${dir ? dir + "/" : ""}`;
  return new URL(src, base).toString();
}

function MarkdownBody({ content, repo, branch, filePath, toc, base }: Props) {
  const idx = toc ? new Map(toc.map((e, i) => [e.path, i])) : new Map<string, number>();

  return (
    <div className="md-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a({ href, children, ...rest }) {
            if (!href) return <a {...rest}>{children}</a>;
            // 去掉锚点，看是否为 toc 内章节
            const [p, hash] = href.split("#");
            if (p && idx.has(p)) {
              const u = `${base}/${idx.get(p)}${hash ? "#" + hash : ""}`;
              return (
                <a href={u} {...rest}>
                  {children}
                </a>
              );
            }
            // 区分：相对 .md 文件但未收录 → 不外跳，标"站内未收录"
            const isRelativeMd =
              !!p && p.endsWith(".md") && !/^https?:|^mailto:|^\/\//i.test(p);
            if (isRelativeMd) {
              return (
                <span className="md-unlinked" title={`站内暂未收录：${p}`}>
                  {children}
                </span>
              );
            }
            // 其它资源链接（图片、assets、绝对 URL）→ jsdelivr 绝对，原链/外链兜底
            const abs = absUrl(href, repo, branch, filePath);
            const isExternal = /^https?:|^\/\//i.test(abs);
            return (
              <a
                href={abs}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                {...rest}
              >
                {children}
              </a>
            );
          },
          img({ src, alt }) {
            const abs =
              src && typeof src === "string"
                ? absUrl(src, repo, branch, filePath)
                : typeof src === "string"
                  ? src
                  : "";
            // eslint-disable-next-line @next/next/no-img-element
            return <img src={abs} alt={alt || ""} loading="lazy" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default memo(MarkdownBody);
