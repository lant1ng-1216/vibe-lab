import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { getTutorial, readToc, groupToc } from "@/lib/tutorials";

type Props = { params: Promise<{ tutorialId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tutorialId } = await params;
  const t = getTutorial(tutorialId);
  if (!t) return { title: "教程未找到" };
  return { title: `${t.title} — Vibe Lab · 振动实验室`, description: t.desc };
}

export default async function TutorialHome({ params }: Props) {
  const { tutorialId } = await params;
  const t = getTutorial(tutorialId);
  if (!t) notFound();
  const toc = readToc(t.id);
  const groups = toc ? groupToc(toc) : [];

  return (
    <>
      <SiteNav />
      <main className="tpage">
        <div className="tpage-inner">
          <div className="crumb mono">
            <Link href="/tutorials">教程库</Link>
            <span>/</span>
            <span>{t.title}</span>
          </div>

          {!toc || groups.length === 0 ? (
            <div className="tbook-pending">
              <h1>{t.title}</h1>
              <p>这本教程正在整理入库，很快就能在站内阅读。</p>
              <a className="btn-ghost" href={t.repoUrl} target="_blank" rel="noopener noreferrer">
                先去原仓库看看 <span aria-hidden="true">↗</span>
              </a>
            </div>
          ) : (
            <>
              <header className="tbook-head">
                <div className="tbook-tags">
                  <span className="tag tag--ac">{t.cat}</span>
                  <span className="tag tag--cy">{t.org}</span>
                  <span className="tag">{t.license}</span>
                  <span className="tag tag--ok mono">{t.stars} ★</span>
                </div>
                <h1>{t.title}</h1>
                <p className="tbook-desc">{t.desc}</p>
                <p className="tbook-src mono">
                  开源作者：{t.repo} · 站内排版仅供学习，版权归原作者
                </p>
              </header>

              <section className="toc-panel">
                <div className="toc-panel-head">
                  <h2>目录</h2>
                  <span className="mono">{toc.length} 章 · 站内阅读</span>
                </div>
                {groups.map((g, gi) => (
                  <div className="toc-group" key={gi}>
                    {g.name !== "开头" && <h3 className="toc-group-name">{g.name}</h3>}
                    <ol className="toc-list">
                      {g.entries.map((e) => {
                        const idx = toc.indexOf(e);
                        return (
                          <li key={e.path}>
                            <Link className="toc-item" href={`/tutorials/${t.id}/${idx}`}>
                              <span className="toc-no mono">{String(idx).padStart(2, "0")}</span>
                              <span className="toc-title">{e.t}</span>
                              <span className="toc-go" aria-hidden="true">
                                →
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ))}
              </section>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
