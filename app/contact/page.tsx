import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "支持我们 — Vibe Lab · 振动实验室",
  description:
    "Vibe Lab 免费提供资源库、教程与作品实验室，并正在把 Lab Agent 做成真正的产品。你的支持，让它继续开下去。",
};

const MAIL = "zfu9751@gmail.com";

const WHY = [
  {
    t: "免费是态度",
    d: "资源库、教程库、作品实验室永久免费——不靠广告、不靠卖课维持，独立地做好内容。",
  },
  {
    t: "独立的下一步",
    d: "训练营正在重新打磨，Lab Agent 正从问询助手走向真正的产品——都需要时间与投入。",
  },
  {
    t: "每一份都算数",
    d: "无论是赞助、建议还是单纯转发，都会出现在官网的支持者名单与致谢里。",
  },
];

const WAYS = [
  {
    t: "个人赞助",
    d: "随心一次、或小额长期。适合认可 Vibe Lab 想让它跑更久的朋友。",
  },
  {
    t: "长期支持",
    d: "按月 / 按季支持，可以指定方向：课程共创、Lab Agent 开发、资源库扩充。",
  },
  {
    t: "企业 / 品牌合作",
    d: "品牌露出、内容合作、工具与资源共建——额度与形式都可以聊，我们一起定。",
  },
];

const RETURNS = [
  "官网「支持者名单」致谢（含链接，按你的意愿）",
  "优先参与内测：Lab Agent / 新课程上线的第一波体验资格",
  "内容共建：想支持的方向可以点名（Agent、教程、工具收录）",
  "企业合作可协商资源库与首页的品牌露出",
];

export default function SupportPage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <header className="about-hero">
        <div className="course-wrap">
          <div className="sec-no sec-no--light">
            <span className="mono">SUPPORT / 支持我们</span>
          </div>
          <h1>
            让野路子训练场，
            <br />
            <span className="hl">继续开下去</span>
          </h1>
          <p className="about-hero-lead">
            Vibe Lab 一直把好东西免费做出来：资源库、教程、作品实验室，
            还有正在变成产品的 Lab Agent。你的支持，会直接变成它跑得更久、做得更好的燃料。
          </p>
        </div>
      </header>

      <main className="join-main">
        {/* 01 为什么支持 */}
        <section className="course-sec">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">01</span>
              <span>为什么支持</span>
            </div>
            <h2 className="course-h2">我们正在做的东西，值得你搭把手</h2>
            <div className="benefit-grid">
              {WHY.map((w) => (
                <div className="benefit-card" key={w.t}>
                  <h3>{w.t}</h3>
                  <p>{w.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 02 怎么支持 */}
        <section className="course-sec course-sec--alt">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">02</span>
              <span>怎么支持</span>
            </div>
            <h2 className="course-h2">三种方式，额度与形式都好商量</h2>
            <div className="benefit-grid">
              {WAYS.map((w) => (
                <div className="benefit-card" key={w.t}>
                  <h3>{w.t}</h3>
                  <p>{w.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 03 回馈 */}
        <section className="course-sec">
          <div className="course-wrap course-wrap--narrow">
            <div className="sec-no">
              <span className="mono">03</span>
              <span>你会得到</span>
            </div>
            <h2 className="course-h2">我们不把支持者当"金主"，当一路人</h2>
            <ul className="about-rules">
              {RETURNS.map((r) => (
                <li key={r}>
                  <span className="about-dot" aria-hidden="true" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 04 联系我们(邮箱 + 快捷表单) */}
        <section className="course-sec course-sec--alt" id="sponsor-contact">
          <div className="course-wrap course-wrap--narrow">
            <div className="sec-no">
              <span className="mono">04</span>
              <span>联系我们</span>
            </div>
            <h2 className="course-h2">留一句，或直接发邮件</h2>
            <p className="about-prose" style={{ marginBottom: 30 }}>
              填下面的快捷表单，点「生成邮件」会自动带上内容唤起你的邮件客户端；
              想直接写邮件也行：<b style={{ color: "var(--accent)" }}>{MAIL}</b>，24 小时内回复。
            </p>
            <ContactForm />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
