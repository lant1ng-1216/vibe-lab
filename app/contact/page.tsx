import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { COURSE_PACKS, MAIN_PACKS, PACK_LABEL, saleOff } from "@/data/courses";

export const metadata: Metadata = {
  title: "关于 & 联系 — Vibe Lab · 振动实验室",
  description:
    "Vibe Lab 是什么、怎么报名训练营、申请成为创作者、投稿与合作——关于我们与联系我们，都在这一页。",
};

const MAIL = "zfu9751@gmail.com";

/* 关于：Vibe Lab 是什么（三大板块） */
const BLOCKS = [
  {
    href: "/tools",
    no: "01",
    emoji: "🧰",
    name: "工具库",
    line: "装齐一套「能打」的 AI 工具",
    desc: "主流 AI 工具按用途收录、分类查找——别把时间浪费在找链接上。免费。",
    cta: "逛工具库",
  },
  {
    href: "/tutorials",
    no: "02",
    emoji: "📚",
    name: "教程库",
    line: "GitHub 开源文字教程，整本搬进站内",
    desc: "从入门通识到 Agent 实战，章节目录 + 站内阅读，跟着顺序学完一本。免费。",
    cta: "读教程库",
  },
  {
    href: "/courses",
    no: "03",
    emoji: "🎓",
    name: "训练营",
    line: "付费课程台 · 邀请码体验，付费解锁",
    desc: "低价尝鲜小课 + 系统三档训练营。课程为付费内容：感兴趣可联系获取邀请码先看体验课，付费后解锁全部。",
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
  "工具库 / 教程库免费开放；训练营课程与创始人亲自指导为付费内容",
  "训练营课程台需邀请码进入；感兴趣请联系获取邀请码，先试看体验课再决定",
  "付费解锁状态存于浏览器；正式售卖将升级账号体系",
];

/* 联系：四件事 + 创作者入驻 */
const USES = [
  {
    icon: "💬",
    t: "报名 / 咨询训练营",
    d: "想报名或了解档位：扫码加微信，备注「训练营 + 档位」；或先要一个邀请码，免费试看体验课再决定。",
    via: "微信",
  },
  {
    icon: "🧪",
    t: "创作者入驻 · Lab",
    d: "想把自己的作品摆上「实验室」？发邮件申请（白名单制）：附上你的 GitHub 用户名、想要的花名、简介与代表作。审核通过后我们会把你拉入白名单，之后你的提交才会被受理。",
    via: "邮箱",
  },
  {
    icon: "🛠",
    t: "推荐工具 / 教程 / Skill",
    d: "觉得哪个 AI 工具或开源教程值得收录？扫码告诉我们，编辑部人工审核后上架。",
    via: "微信",
  },
  {
    icon: "🤝",
    t: "合作 / 约稿 / 品牌",
    d: "课程共创、内容授权、行业合作——发邮件说明来意，24 小时内回复。",
    via: "邮箱",
  },
  {
    icon: "📮",
    t: "反馈 / Bug / 建议",
    d: "页面有问题、哪里想改进——欢迎直说，每一条都会被看到。",
    via: "邮箱",
  },
];

function PriceCard({
  p,
  hot,
}: {
  p: (typeof COURSE_PACKS)[number];
  hot: boolean;
}) {
  const off = saleOff(p.price, p.sale);
  return (
    <article className={"plan-card" + (hot ? " plan-card--hot" : "")}>
      {hot && <span className="plan-flag">最热门</span>}
      <div className="plan-head">
        <span className="mono plan-no">{p.emoji}</span>
        <span className="plan-name">{PACK_LABEL[p.key] || p.title}</span>
      </div>
      <div className="plan-price">
        <span className="plan-price-num">¥{p.sale ?? p.price}</span>
        {p.sale && p.sale < p.price && <span className="plan-orig">¥{p.price}</span>}
      </div>
      {off && <div className="plan-off mono">限时 {off.split("限时 ")[1]}</div>}
      <p className="plan-who">{p.who}</p>
      <ul className="plan-list">
        {p.perks.slice(0, 3).map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </article>
  );
}

export default function AboutContactPage() {
  const mains = MAIN_PACKS;
  return (
    <>
      <SiteNav />

      {/* Hero：关于 & 联系 */}
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
            Vibe Lab 是给「非科班普通人」的 AI 实践站。想知道我们是谁、想报名训练营、
            想成为创作者——这一页，找到我们。
          </p>
        </div>
      </header>

      <main className="join-main">
        {/* 1. 我们是谁 */}
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

        {/* 2. 我们相信 */}
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

        {/* 3. 收录与边界 */}
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

        {/* 4. 找到我们 */}
        <section className="course-sec course-sec--alt">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">04</span>
              <span>找到我们</span>
            </div>
            <h2 className="course-h2">你来找我们，多半是这几件事</h2>
            <div className="uselist">
              {USES.map((u, i) => (
                <div className="usecard" key={u.t}>
                  <div className="usecard-top">
                    <span className="mono usecard-no">{String(i + 1).padStart(2, "0")}</span>
                    <span className="usecard-icon" aria-hidden="true">
                      {u.icon}
                    </span>
                    <h3>{u.t}</h3>
                    <span className="tag mono">{u.via === "邮箱" ? "发邮件" : "扫码添加"}</span>
                  </div>
                  <p>{u.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. 想报名训练营 */}
        <section className="course-sec">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">05</span>
              <span>训练营 · 报名</span>
            </div>
            <h2 className="course-h2">三步，把训练营领回家</h2>
            <div className="join-steps">
              {[
                { n: "1", t: "联系创始人", d: "扫码加微信或发邮件，备注「训练营」。" },
                { n: "2", t: "拿邀请码 · 先试体验课", d: "我们会发你课程台邀请码——不花钱先试看每课包的体验课，感受风格与质量。" },
                { n: "3", t: "定档位 · 付款解锁", d: "确定要学，按档位付款，收到解锁码解锁全部课程，永久回看。" },
              ].map((s) => (
                <div className="join-step" key={s.n}>
                  <span className="join-step-no mono">{s.n}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>

            <div className="plans-grid" style={{ marginTop: 40 }}>
              {mains.map((p) => (
                <PriceCard key={p.key} p={p} hot={p.key === "builder"} />
              ))}
            </div>
            <p className="price-note mono">* 系统课三档 · 限时价开放中，结束后恢复原价。解锁码付款后由创始人发放，可叠加。</p>
          </div>

          {/* CTA */}
          <div className="course-wrap course-wrap--narrow" id="contact-cta">
            <div className="contact-grid" style={{ marginTop: 8 }}>
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
                  width={260}
                  height={553}
                />
                <p className="contact-hint mono">长按 / 扫码添加 · 备注「训练营」</p>
              </div>
              <div className="contact-side">
                <div className="contact-mail">
                  <div className="contact-label">Email / 邮箱</div>
                  <a className="contact-mail-link" href={`mailto:${MAIL}`}>
                    {MAIL}
                  </a>
                  <p>报名咨询、创作者入驻申请都走这里，24h 内回复。</p>
                </div>
                <div className="contact-mail">
                  <div className="contact-label">回复时效</div>
                  <p>
                    微信：工作时间通常 <b>1–2 小时</b>内回复
                    <br />
                    邮件：<b>24 小时</b>内回复
                  </p>
                </div>
                <p className="contact-ps mono">* 报名请备注档位（Starter / Builder / Hacker）· 创作者入驻请附 GitHub 用户名</p>
              </div>
            </div>
          </div>
        </section>

        {/* 收尾 */}
        <section className="about-closer">
          <p className="about-closer-quote">「好的课程，自己会说话。」</p>
          <p className="about-closer-sub">与其听我们介绍，不如先要个邀请码，去看一节课。</p>
          <a className="btn-main" href={`mailto:${MAIL}?subject=${encodeURIComponent("训练营邀请码申请")}`}>
            联系获取邀请码
          </a>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
