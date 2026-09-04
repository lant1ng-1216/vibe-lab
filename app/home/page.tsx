import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import NewsPlayer from "./NewsPlayer";
import HomeTabs from "./HomeTabs";
import { POSTS } from "@/data/posts";
import { GUIDE, LEXICON, FINDS } from "@/data/homeExtra";
import { collectFeed } from "@/lib/feed";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "首页 — Vibe Lab · 振动实验室",
  description:
    "Vibe Lab：AI 头条单屏速览、AI 热词、今日导读与创始人收藏 —— AI 世界的新东西，每天都在这。",
};

export default async function HomePage() {
  const feed = await collectFeed(12);

  // 站内公告：只保留"真实更新"，剔除带比赛/带打类的营销向条目
  const posts = POSTS.filter((p) => !p.href.includes("hacker"));

  return (
    <>
      <SiteNav />
      <main>
        {/* ============ Hero：左标语 · 右 AI 头条播放器 ============ */}
        <section className="home-hero-grid">
          <div className="hh-left">
            <div className="sec-num">VIBE LAB · HOME</div>
            <h1>
              AI 世界的新东西，
              <br />
              每天都在这。
            </h1>
            <p className="lead">
              头条替你筛好，热词替你数好 —— 有人在帮你盯着这些变化，每天几分钟就够了。
            </p>
          </div>
          <div className="hh-right">
            <NewsPlayer items={feed} />
          </div>
        </section>

        {/* ============ Agent 工作窗 + 三大内容 Tab（统一） ============ */}
        <div className="dopa-wrap">
          <HomeTabs guide={GUIDE} lexicon={LEXICON} finds={FINDS} posts={posts} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
