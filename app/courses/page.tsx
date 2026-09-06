import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "训练营 — Vibe Lab · 振动实验室",
  description:
    "Vibe Lab 实战训练营正在重新打磨中：从工具到作品的能力爬坡课程。敬请期待。",
};

/**
 * 训练营页占位版（2026-09 定位调整中）：
 * 原课程台内容暂缓上线，先占位「开发中」，页面定位与内容将在下一版重做。
 * 旧的课程台客户端组件（CoursesClient / CourseGate / 邀请码解锁）保留在仓库，
 * 待训练营重新上线时按新定位接入，勿删。
 */
export default function CoursesPage() {
  return (
    <>
      <SiteNav />

      <header className="about-hero">
        <div className="course-wrap">
          <div className="sec-no sec-no--light">
            <span className="mono">COURSES / 训练营</span>
          </div>
          <h1>
            训练营正在
            <br />
            <span className="hl">重新打磨</span>
          </h1>
          <p className="about-hero-lead">
            Vibe Lab 实战训练营正在筹备下一版课程：从上手 AI 工具，到做出能上线的作品。
            先逛逛资源库，或留下你的想法——课程上线会第一时间通知你。
          </p>
        </div>
      </header>

      <main className="join-main">
        <section className="course-sec">
          <div className="course-wrap course-wrap--narrow">
            <div className="sec-no">
              <span className="mono">01</span>
              <span>状态</span>
            </div>
            <h2 className="course-h2">页面建设中 · 敬请期待</h2>
            <p className="about-prose">
              课程内容与形态正在重新设计，暂不开放报名。在此期间：
              <br />
              · 想学 AI 工具与技能？去
              <a href="/tools" style={{ color: "var(--accent)", textDecoration: "underline" }}>
                资源库
              </a>
              免费逛；
              <br />
              · 有想学的内容、或想第一时间收到开课通知？
              <a href="/contact" style={{ color: "var(--accent)", textDecoration: "underline" }}>
                联系我们
              </a>
              。
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
