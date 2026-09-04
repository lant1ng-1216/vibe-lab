import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import MarkdownBody from "../../MarkdownBody";
import { getTutorial, readToc, groupToc, fetchMd } from "@/lib/tutorials";

type Props = { params: Promise<{ tutorialId: string; chapter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tutorialId, chapter } = await params;
  const t = getTutorial(tutorialId);
  const toc = t ? readToc(t.id) : null;
  const n = Number(chapter);
  const e = toc && Number.isInteger(n) && toc[n];
  return { title: e ? `${e.t} · ${t?.title} — Vibe Lab` : "章节不存在" };
}

export default async function ChapterPage({ params }: Props) {
  const { tutorialId, chapter } = await params;
  const t = getTutorial(tutorialId);
  if (!t) notFound();
  const toc = readToc(t.id);
  const n = Number(chapter);
  if (!toc || !Number.isInteger(n) || n < 0 || n >= toc.length) notFound();

  const entry = toc[n];
  const content = await fetchMd(t.repo, t.branch, entry.path);
  const groups = groupToc(toc);
  const prev = n > 0 ? toc[n - 1] : null;
  const next = n < toc.length - 1 ? toc[n + 1] : null;
  const root = `/tutorials/${t.id}`;

  return (
    <>
      <SiteNav />
      <main className="readpage">
        <div className="readpage-bar mono">
          <Link href={root}>目录</Link>
          <span className="readpage-bar-sep">/</span>
          <span className="readpage-bar-title">{entry.t}</span>
        </div>

        <div className="read-layout">
          {/* 目录树 */}
          <nav className="read-toc" aria-label="章节目录">
            {groups.map((g, gi) => (
              <div className="read-toc-group" key={gi}>
                {g.name !== "开头" && <div className="read-toc-gname">{g.name}</div>}
                {g.entries.map((e) => {
                  const i = toc.indexOf(e);
                  return (
                    <Link
                      key={e.path}
                      className={"read-toc-item" + (i === n ? " is-on" : "")}
                      href={`${root}/${i}`}
                    >
                      <span className="mono">{String(i).padStart(2, "0")}</span> {e.t}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* 正文 */}
          <div className="read-main">
            {content ? (
              <>
                <MarkdownBody
                  content={content}
                  repo={t.repo}
                  branch={t.branch}
                  filePath={entry.path}
                  toc={toc}
                  base={root}
                />
                <div className="read-credit mono">
                  「{t.title}」· 第 {n + 1}/{toc.length} 章 · 内容开源自{" "}
                  <a href={t.repoUrl} target="_blank" rel="noopener noreferrer">
                    {t.repo}
                  </a>{" "}
                  （{t.license}），版权归原作者
                </div>
                <div className="read-nav">
                  {prev ? (
                    <Link className="read-nav-item" href={`${root}/${n - 1}`}>
                      <span className="read-nav-dir mono">← 上一章</span>
                      <span className="read-nav-title">{prev.t}</span>
                    </Link>
                  ) : (
                    <span />
                  )}
                  {next ? (
                    <Link className="read-nav-item read-nav-item--next" href={`${root}/${n + 1}`}>
                      <span className="read-nav-dir mono">下一章 →</span>
                      <span className="read-nav-title">{next.t}</span>
                    </Link>
                  ) : (
                    <Link className="read-nav-item read-nav-item--next" href={root}>
                      <span className="read-nav-dir mono">返回目录 →</span>
                      <span className="read-nav-title">读完啦，去目录逛逛</span>
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <div className="tbook-pending">
                <h2>章节加载失败</h2>
                <p>暂时无法获取本节内容（源仓库或网络问题），稍后再试。</p>
                <a className="btn-ghost" href={root}>
                  ← 返回目录
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
