import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "联系 — Vibe Lab · 振动实验室",
  description:
    "报名咨询训练营、推荐好工具/教程/Skill、合作与反馈——扫码添加或发邮件，Vibe Lab 都在。",
};

const MAIL = "zfu9751@gmail.com";

const USES = [
  {
    icon: "💬",
    t: "报名 / 咨询训练营",
    d: "先扫码加微信，备注「训练营 + 档位」（如：训练营 Builder），我们按档位发解锁码。",
    via: "微信",
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

export default function ContactPage() {
  return (
    <>
      <SiteNav />

      <header className="about-hero">
        <div className="course-wrap">
          <div className="sec-no sec-no--light">
            <span className="mono">CONTACT / 联系</span>
          </div>
          <h1>
            找到<span className="hl">我们</span>
          </h1>
          <p className="about-hero-lead">
            报名、投稿、合作、还是单纯聊聊——选一种你舒服的方式。
          </p>
        </div>
      </header>

      <main className="join-main">
        {/* 用途 */}
        <section className="course-sec">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">01</span>
              <span>想做什么，选对应入口</span>
            </div>
            <h2 className="course-h2">你来找我们，多半是这四件事</h2>
            <div className="uselist">
              {USES.map((u, i) => (
                <div className="usecard" key={u.t}>
                  <div className="usecard-top">
                    <span className="mono usecard-no">{String(i + 1).padStart(2, "0")}</span>
                    <span className="usecard-icon" aria-hidden="true">
                      {u.icon}
                    </span>
                    <h3>{u.t}</h3>
                    <span className="tag mono">{u.via === "邮箱" ? "邮箱" : "扫码添加"}</span>
                  </div>
                  <p>{u.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 联系渠道 */}
        <section className="course-sec course-sec--alt">
          <div className="course-wrap course-wrap--narrow">
            <div className="sec-no">
              <span className="mono">02</span>
              <span>直接联系</span>
            </div>
            <h2 className="course-h2">扫码，或发一封邮件</h2>

            <div className="contact-grid">
              {/* 企业微信名片 */}
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
                <p className="contact-hint mono">长按 / 扫码添加 · 备注用途</p>
              </div>

              {/* 邮箱 + 其它 */}
              <div className="contact-side">
                <div className="contact-mail">
                  <div className="contact-label">Email / 邮箱</div>
                  <a className="contact-mail-link" href={`mailto:${MAIL}`}>
                    {MAIL}
                  </a>
                  <p>合作 · 约稿 · 批量 / 企业咨询请走邮件，24h 内回复。</p>
                </div>
                <div className="contact-mail">
                  <div className="contact-label">回复时效</div>
                  <p>
                    微信：工作时间通常 <b>1–2 小时</b>内回复
                    <br />
                    邮件：<b>24 小时</b>内回复
                  </p>
                </div>
                <p className="contact-ps mono">* 报名训练营请备注档位，方便我们直接发对应解锁码</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
