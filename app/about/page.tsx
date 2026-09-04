import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "关于 Vibe Lab — Vibe Lab · 振动实验室",
  description:
    "Vibe Lab：装齐 AI 工具的箱子、整本可读的开源教程、亲手做出作品的训练营。不背理论，第一节就动手。",
};

const BLOCKS = [
  {
    href: "/tools",
    no: "01",
    emoji: "🧰",
    name: "工具库",
    line: "装齐一套「能打」的 AI 工具",
    desc: "主流 AI 工具按用途收录、分类查找，配高清官方标识——别把时间浪费在找链接上。",
    cta: "逛工具库",
  },
  {
    href: "/tutorials",
    no: "02",
    emoji: "📚",
    name: "教程库",
    line: "GitHub 开源文字教程，整本搬进站内",
    desc: "从入门通识到 Agent 实战，章节目录 + 站内阅读，不用跳来跳去，跟着顺序学完一本。",
    cta: "读教程库",
  },
  {
    href: "/courses",
    no: "03",
    emoji: "🎓",
    name: "训练营",
    line: "录播课底座，按课包解锁",
    desc: "低价尝鲜小课 + 系统三档训练营，免费体验课先看质量，付费后永久回看。",
    cta: "进课程台",
  },
];

const BELIEFS = [
  { t: "收藏 100 篇，不如做出 1 个", d: "信息太多，动手太少。我们只围绕「做出作品」这一件事设计内容。" },
  { t: "不背理论，第一节就动手", d: "会打字、会用浏览器，就够了。剩下的交给一步步的实操。" },
  { t: "野路子也值得被认真对待", d: "非科班不是缺陷。把好用的「邪修」打法系统化，一样能做出正经作品。" },
];

const BOUNDARIES = [
  "收录的工具链接均指向官方来源，本站只做导航与整理",
  "教程内容来自 GitHub 开源项目，站内阅读页标注作者与开源协议，版权归原作者",
  "低价尝鲜课与训练营开放免费体验课，先试看再决定",
  "解锁状态存于浏览器；正式售卖将升级账号体系",
];

export default function AboutPage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <header className="about-hero">
        <div className="course-wrap">
          <div className="sec-no sec-no--light">
            <span className="mono">ABOUT / 关于</span>
          </div>
          <h1>
            AI 世界里，
            <br />
            <span className="hl">野路子</span>也能做出正经作品
          </h1>
          <p className="about-hero-lead">
            Vibe Lab 是一个给「非科班普通人」的 AI 实践站——工具、教程、训练营，
            三样东西都围绕同一件事：让你亲手做出东西。
          </p>
        </div>
      </header>

      <main className="join-main">
        {/* Vibe Lab 是什么 */}
        <section className="course-sec">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">01</span>
              <span>Vibe Lab 是什么</span>
            </div>
            <h2 className="course-h2">不贩卖焦虑，只贩卖「亲手做完的成就感」</h2>
            <p className="about-prose">
              市面上的 AI 内容大多数在教你「知道」，而 Vibe Lab 想帮你「做到」。
              这里没有高深的理论门槛，只有一条被反复走通的路：
              <b>装好工具 → 照着教程做 → 报名训练营把作品做完</b>。
            </p>
            <div className="blk-grid">
              {BLOCKS.map((b) => (
                <a className="blk-card" key={b.href} href={b.href}>
                  <div className="blk-top">
                    <span className="mono blk-no">{b.no}</span>
                    <span className="blk-emoji" aria-hidden="true">
                      {b.emoji}
                    </span>
                  </div>
                  <h3>{b.name}</h3>
                  <p className="blk-line">{b.line}</p>
                  <p className="blk-desc">{b.desc}</p>
                  <span className="blk-go">
                    {b.cta} →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 相信什么 */}
        <section className="course-sec course-sec--alt">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">02</span>
              <span>我们相信</span>
            </div>
            <h2 className="course-h2">几句朴素的话，是 Vibe Lab 的地基</h2>
            <div className="benefit-grid">
              {BELIEFS.map((x) => (
                <div className="benefit-card" key={x.t}>
                  <h3>{x.t}</h3>
                  <p>{x.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 收录与边界 */}
        <section className="course-sec">
          <div className="course-wrap course-wrap--narrow">
            <div className="sec-no">
              <span className="mono">03</span>
              <span>收录与边界</span>
            </div>
            <h2 className="course-h2">我们对内容负责</h2>
            <ul className="about-rules">
              {BOUNDARIES.map((r) => (
                <li key={r}>
                  <span className="about-dot" aria-hidden="true" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 收尾金句 */}
        <section className="about-closer">
          <p className="about-closer-quote">「好的课程，自己会说话。」</p>
          <p className="about-closer-sub">
            与其听我们介绍，不如先去看一节课。
          </p>
          <a className="btn-main" href="/courses">
            去课程台试看体验课
          </a>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
