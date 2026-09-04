import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "关于 & 联系 — Vibe Lab · 振动实验室",
  description:
    "Vibe Lab 是给普通人的 AI 学习与创作平台：聚合工具、精读教程、创作者把作品摆上台——想聊聊，从这里找到我们。",
};

const MAIL = "zfu9751@gmail.com";

/* 01 平台四大能力（平铺，Lab 为里子、Agent 是愿景） */
const PILLARS: {
  href?: string;
  emoji: string;
  name: string;
  line: string;
  desc: string;
  cta: string;
}[] = [
  {
    href: "/tools",
    emoji: "🧰",
    name: "AI 工具聚合",
    line: "把好用的 AI 工具一次装齐",
    desc: "70+ 精选工具按用途收录、附上手介绍——别把时间浪费在找链接上。免费。",
    cta: "逛工具库",
  },
  {
    href: "/tutorials",
    emoji: "📚",
    name: "高质量教程库",
    line: "开源教程，整本搬进站内精读",
    desc: "从入门通识到 Agent 实战，按顺序读完一本，就真的会用了。免费。",
    cta: "读教程",
  },
  {
    href: "/lab",
    emoji: "🧪",
    name: "创作者实验室",
    line: "作品摆上台，被更多人看见",
    desc: "平台的里子：创作者把做出来的东西摆上台——野路子的作品，也值得被认真对待。",
    cta: "去看作品",
  },
  {
    emoji: "🚀",
    name: "正在路上 · AI Agent",
    line: "从一个问询助手开始",
    desc: "Lab 里的小助手只是起点；我们在把它打磨成真正能帮上忙的 AI 产品，做深做厚，给你用。",
    cta: "打磨中",
  },
];

const BELIEFS = [
  { t: "收藏 100 篇，不如做出 1 个", d: "内容只围绕「做出作品」这一件事设计。" },
  { t: "不背理论，第一节就动手", d: "会打字、会开浏览器，就够了。" },
  { t: "野路子也值得被认真对待", d: "把好用的「邪修」打法系统化，一样出正经作品。" },
];

const BOUNDARIES = [
  "收录的工具链接均指向官方来源，本站只做导航与整理",
  "教程内容来自 GitHub 开源项目，站内阅读标注作者与开源协议，版权归原作者",
  "工具库 / 教程库免费开放；训练营课程与创始人亲自指导为付费内容",
  "训练营课程台需邀请码进入——感兴趣可先联系获取邀请码，免费试看体验课",
];

/* 04 你可以来找我们（场景） */
const SCENES = [
  { icon: "💬", t: "报名 / 咨询训练营", d: "想报名、想了解档位、或先要个邀请码试看体验课。", via: "微信" },
  { icon: "🧪", t: "创作者入驻 · Lab", d: "发邮件申请：附 GitHub 用户名、花名、简介与代表作，审核通过后拉你入白名单。", via: "邮箱" },
  { icon: "🛠", t: "推荐工具 / 教程 / Skill", d: "觉得哪个值得收录？告诉我们，人工审核后上架。", via: "微信" },
  { icon: "🤝", t: "合作 / 约稿 / 品牌", d: "课程共创、内容授权、行业合作，邮件说明来意。", via: "邮箱" },
  { icon: "📮", t: "反馈 / Bug / 建议", d: "哪里有问题、哪里想改进，直说就好。", via: "微信" },
];

export default function AboutContactPage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <header className="about-hero">
        <div className="course-wrap">
          <div className="sec-no sec-no--light">
            <span className="mono">ABOUT · CONTACT / 关于 & 联系</span>
          </div>
          <h1>
            AI 世界里，
            <br />
            <span className="hl">野路子</span>也能做出正经作品
          </h1>
          <p className="about-hero-lead">
            Vibe Lab 是给「非科班普通人」的 AI 学习与创作平台：
            聚合工具让你会用，精读教程让你学得懂，实验室让作品被看见。
            想聊聊——这一页，找到我们。
          </p>
        </div>
      </header>

      <main className="join-main">
        {/* 01 这是个什么地方 */}
        <section className="course-sec">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">01</span>
              <span>这是个什么地方</span>
            </div>
            <h2 className="course-h2">不贩卖焦虑，只贩卖「亲手做完的成就感」</h2>
            <p className="about-prose">
              市面上的 AI 内容大多在教你「知道」，Vibe Lab 想帮你「做到」。
              从装好工具、读懂教程，到把自己做的东西摆上台被看见——
              这里没有高深门槛，只有一条被反复走通的路。
            </p>
            <div className="blk-grid blk-grid--4">
              {PILLARS.map((p) =>
                p.href ? (
                  <a className="blk-card" key={p.name} href={p.href}>
                    <div className="blk-top">
                      <span className="mono blk-no">{p.emoji}</span>
                    </div>
                    <h3>{p.name}</h3>
                    <p className="blk-line">{p.line}</p>
                    <p className="blk-desc">{p.desc}</p>
                    <span className="blk-go">
                      {p.cta} →
                    </span>
                  </a>
                ) : (
                  <div className="blk-card blk-card--plain" key={p.name}>
                    <div className="blk-top">
                      <span className="mono blk-no">{p.emoji}</span>
                    </div>
                    <h3>{p.name}</h3>
                    <p className="blk-line">{p.line}</p>
                    <p className="blk-desc">{p.desc}</p>
                    <span className="blk-go blk-go--muted">
                      {p.cta} →
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* 02 我们相信 */}
        <section className="course-sec course-sec--alt course-sec--compact">
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

        {/* 03 收录与边界 */}
        <section className="course-sec course-sec--compact">
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

        {/* 04 联系我们（场景 + 渠道同屏） */}
        <section className="course-sec course-sec--alt" id="contact-ways">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">04</span>
              <span>联系我们</span>
            </div>
            <h2 className="course-h2">你来，多半是这几件事</h2>
            <p className="about-prose" style={{ marginBottom: 26 }}>
              无论报名、入驻、投稿还是反馈，都从下面的渠道开始——微信聊得快，邮件留得下正式申请。
            </p>

            <div className="c-grid">
              {/* 场景清单 */}
              <div className="c-scenes" role="list">
                {SCENES.map((s) => (
                  <div className="c-scene" role="listitem" key={s.t}>
                    <span className="c-scene-icon" aria-hidden="true">
                      {s.icon}
                    </span>
                    <div className="c-scene-body">
                      <div className="c-scene-head">
                        <h3>{s.t}</h3>
                        <span className="tag mono">{s.via === "邮箱" ? "发邮件" : "扫码"}</span>
                      </div>
                      <p>{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 渠道 */}
              <div className="c-channels">
                <div className="contact-card">
                  <div className="contact-card-head">
                    <span className="contact-label">企业微信</span>
                    <span className="contact-name">yu7dan · VibeLab</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="contact-qr"
                    src="/assets/card/wechat-card.png"
                    alt="Vibe Lab 企业微信名片二维码"
                    width={200}
                    height={425}
                  />
                  <p className="contact-hint mono">扫码添加 · 备注用途</p>
                </div>

                <div className="c-mail">
                  <div className="contact-label">Email / 邮箱</div>
                  <a className="contact-mail-link" href={`mailto:${MAIL}`}>
                    {MAIL}
                  </a>
                  <p className="contact-ps mono" style={{ marginTop: 10 }}>
                    * 报名备注档位 · 入驻附 GitHub 用户名
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 收尾 */}
        <section className="about-closer">
          <p className="about-closer-quote">「做出来，摆上台，被看见。」</p>
          <p className="about-closer-sub">无论你走到哪一步——先发一封邮件，我们都在。</p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
