import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { COURSE_PACKS, MINI_PACKS, MAIN_PACKS, PACK_LABEL, saleOff } from "@/data/courses";

export const metadata: Metadata = {
  title: "报名训练营 — Vibe Lab · 振动实验室",
  description:
    "先免费试看，再低价尝鲜，最后系统训练营——用 AI 做出第一个能上线、能参赛的作品。限时价开放中。",
};

const FAQS = [
  {
    q: "我完全是零基础，能跟上吗？",
    a: "能。建议从「体验课」（课程台试看）开始感受，再选低价尝鲜课入门；想系统学就报 Starter。课程不背理论，第一节课就上手真实 AI 工具。",
  },
  {
    q: "课程是直播还是录播？有效期多久？",
    a: "录播为主，随到随学、永久回看。Builder 起配作业打卡与群内点评，节奏自己掌握。",
  },
  {
    q: "低价尝鲜课和系统训练营有什么区别？",
    a: "尝鲜课 2-4 节、解决一个具体问题（提效 / 提示词），适合想先体验；系统训练营是完整能力链路——从工具到做出能上线的作品。尝鲜课也单独卖，买了训练营不重复收你钱（详见价格区）。",
  },
  {
    q: "付款后怎么看课？",
    a: "付款后会收到对应课包的解锁码。打开顶部导航「训练营」（课程台），输入解锁码即开通该课包，多课包可叠加。",
  },
  {
    q: "解锁码能给别人用吗？",
    a: "解锁码绑定学员档案（基于设备）。请勿外传，后续升级账号体系后会改为邮箱/手机绑定登录。",
  },
  {
    q: "现在报名有什么优惠？",
    a: "当前为限时价：三档系统课均有折扣（见页面底部价格区），限时结束后恢复原价。",
  },
  {
    q: "怎么报名 / 付款？",
    a: "方式一：扫码添加企业微信（本页底部），备注「训练营 + 档位」；方式二：发邮件至 zfu9751@gmail.com 说明意向。确认后发送付款方式与对应档位解锁码。",
  },
];

function PriceCard({
  p,
  hot,
  isMini,
}: {
  p: (typeof COURSE_PACKS)[number];
  hot: boolean;
  isMini?: boolean;
}) {
  const off = saleOff(p.price, p.sale);
  return (
    <article className={"plan-card" + (hot ? " plan-card--hot" : "") + (isMini ? " plan-card--mini" : "")}>
      {hot && <span className="plan-flag">最热门</span>}
      <div className="plan-head">
        <span className="mono plan-no">{p.emoji}</span>
        <span className="plan-name">{PACK_LABEL[p.key] || p.title}</span>
      </div>
      <div className="plan-price">
        <span className="plan-price-num">
          ¥{p.sale ?? p.price}
        </span>
        {p.sale && p.sale < p.price && (
          <span className="plan-orig">¥{p.price}</span>
        )}
      </div>
      {off && <div className="plan-off mono">限时 {off.split("限时 ")[1]}</div>}
      <p className="plan-who">{p.who}</p>
      <ul className="plan-list">
        {p.perks.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <a className={"plan-cta" + (hot ? " plan-cta--hot" : "")} href="#join-cta">
        报名这一档
      </a>
    </article>
  );
}

export default function JoinPage() {
  return (
    <>
      <SiteNav />

      {/* 1. Hero */}
      <header className="join-hero">
        <div className="course-wrap">
          <div className="sec-no sec-no--light">
            <span className="mono">JOIN / 报名</span>
          </div>
          <h1>
            别再收藏教程了
            <br />
            亲手做出你的<span className="hl">第一个作品</span>
          </h1>
          <p className="join-hero-lead">
            从免费体验课开始，到低价尝鲜、再到系统训练营——每一层都比上一层更靠近「你能独立做出东西」。
          </p>
          <div className="course-hero-cta">
            <a className="btn-main" href="#how">
              看看怎么学
            </a>
            <a className="btn-ghost--light" href="#price">
              直达价格
            </a>
          </div>
        </div>
      </header>

      <main className="join-main">
        {/* 2. 三画像共鸣 */}
        <section className="course-sec">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">01</span>
              <span>你现在卡在哪</span>
            </div>
            <h2 className="course-h2">不是你不努力，是缺一条「能走通的路」</h2>
            <div className="pain-grid">
              {[
                { t: "收藏党", d: "关注博主、收藏教程，一年过去文件夹吃灰，还是什么都不会做。" },
                { t: "只会聊天", d: "AI 用了一年，只会写文案、翻译、聊天——不知道还能帮你赚钱、做产品。" },
                { t: "瞎折腾党", d: "自己装工具、跑流程，卡住没人问，三天热情耗尽就放弃。" },
              ].map((p) => (
                <div className="pain-card" key={p.t}>
                  <span className="pain-x mono" aria-hidden="true">
                    ✕
                  </span>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. 三条路 */}
        <section className="course-sec course-sec--alt" id="how">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">02</span>
              <span>怎么学</span>
            </div>
            <h2 className="course-h2">先尝，再小步试，最后系统跑</h2>
            <div className="join-steps">
              {[
                { n: "0", t: "免费 · 体验课", d: "课程台开放体验课，不花钱先感受教学风格与内容质量。" },
                { n: "¥98", t: "低价尝鲜课", d: "花一顿饭钱，解决一个具体问题（AI 提效 / 提示词）。" },
                { n: "¥199", t: "专项小课", d: "再深入一步，掌握一套能立刻用起来的方法。" },
                { n: "→", t: "系统训练营", d: "Starter → Builder → Hacker：完整能力链路，做出能上线、能参赛的作品。" },
              ].map((s, i) => (
                <div className={"join-step" + (i === 3 ? " join-step--final" : "")} key={s.n}>
                  <span className="join-step-no mono">{s.n}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. 你将做出什么 */}
        <section className="course-sec">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">03</span>
              <span>你将获得</span>
            </div>
            <h2 className="course-h2">三档系统课，对应三种「作品成果」</h2>
            <div className="benefit-grid">
              {[
                { t: "🔰 Starter · 入门", d: "做出你的第一个 AI 作品：一个能跑的产品想法 + 一个自己做的 Skill / Agent。", m: MAIN_PACKS[0].price },
                { t: "🚀 Builder · 进阶", d: "独立完成作品墙：一个能上线的产品 + 一个展示你的个人网站。", m: MAIN_PACKS[1].price },
                { t: "🎯 Hacker · 打比赛", d: "创始人 1v1 带你把作品打磨到能参赛，带着项目去拿名次。", m: MAIN_PACKS[2].price },
              ].map((b) => (
                <div className="benefit-card" key={b.t}>
                  <h3>{b.t}</h3>
                  <p>{b.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. 承诺 */}
        <section className="course-sec course-sec--alt">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">04</span>
              <span>承诺</span>
            </div>
            <h2 className="course-h2">我们保证的，写在这里</h2>
            <div className="benefit-grid">
              {[
                { t: "不教理论，第一节就动手", d: "所有课以「做出一个东西」为终点。" },
                { t: "作业 + 点评，不是看了就完", d: "Builder 起配作业、打卡、讲师点评。" },
                { t: "群答疑 + 同伴", d: "一个人学容易放弃，一群人学容易上头。" },
                { t: "录播永久回看", d: "随时学、反复看，进度自己掌握。" },
              ].map((b) => (
                <div className="benefit-card" key={b.t}>
                  <h3>{b.t}</h3>
                  <p>{b.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. FAQ */}
        <section className="course-sec">
          <div className="course-wrap course-wrap--narrow">
            <div className="sec-no">
              <span className="mono">05</span>
              <span>常见问题</span>
            </div>
            <h2 className="course-h2">报名前，先看这里</h2>
            <div className="faq-list">
              {FAQS.map((f) => (
                <details className="faq" key={f.q}>
                  <summary>
                    <span>{f.q}</span>
                    <span className="faq-x mono" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 7. 价格区（沉底 · 决策收口） */}
        <section className="price-zone" id="price">
          <div className="course-wrap">
            <div className="sec-no sec-no--light">
              <span className="mono">06 / PRICE</span>
              <span>选择你的档位</span>
            </div>
            <h2 className="price-h2">
              限时价
              <span className="price-h2-sub">· 结束后恢复原价</span>
            </h2>

            {/* 系统训练营三档 */}
            <div className="plans-grid">
              {MAIN_PACKS.map((p) => (
                <PriceCard key={p.key} p={p} hot={p.key === "builder"} />
              ))}
            </div>

            {/* 低价尝鲜课 */}
            <div className="mini-price-head">
              <h3>
                <span aria-hidden="true">🎁</span> 先花小钱试试？
              </h3>
              <p>低价尝鲜课 · 与系统课独立售卖 · 买了系统课不重复收费</p>
            </div>
            <div className="plans-grid plans-grid--mini">
              {MINI_PACKS.map((p) => (
                <PriceCard key={p.key} p={p} hot={false} isMini />
              ))}
            </div>

            <div className="price-note mono">
              * 解锁码由创始人付款后发放 · 每个课包一个码，可叠加
            </div>
          </div>

          {/* CTA */}
          <div className="course-wrap course-wrap--narrow" id="join-cta">
            <div className="join-cta">
              <h2>定了档位，剩下的交给我们</h2>
              <p className="join-cta-sub">扫码添加企业微信 · 备注「训练营 + 档位」，付款后发解锁码</p>

              <div className="join-cta-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/card/wechat-card.png"
                  alt="Vibe Lab 企业微信名片二维码"
                  width={210}
                  height={447}
                />
              </div>
              <p className="join-cta-mail">
                或发邮件至 <a href="mailto:zfu9751@gmail.com">zfu9751@gmail.com</a>
                <span className="mono"> · 24h 内回复</span>
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
