import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Lab Agent — Vibe Lab · 振动实验室",
  description:
    "Lab Agent：Vibe Coding 时代的『监工』——不写代码，守住你的意图与质量。做代码的是 Claude Code，全程跟随、验收与纠偏的是 Lab Agent。",
};

const ROLES = [
  { icon: "📝", t: "意图记录器", d: "陪你头脑风暴，把想法追问成一份高完成度 PRD，再交给执行 Agent 开工。", st: "已在做" },
  { icon: "🗣", t: "翻译官", d: "执行 Agent 的汇报看不懂？它翻成人话和要点，别错过细节。", st: "已在做" },
  { icon: "✅", t: "验收官", d: "对照 PRD 逐项验收产出；不合格带着理由打回重做。", st: "规划中" },
  { icon: "👀", t: "偏差哨兵", d: "从 diff 与汇报里发现『跑偏了』，第一时间提醒你和执行 Agent。", st: "规划中" },
  { icon: "🕹", t: "调度员", d: "真正驱动执行 Agent 推进任务——等主流 Coding Agent 开放监管协议后解锁。", st: "最远期" },
];

const PAINS = [
  {
    t: "对齐的不是任务，是『感受』",
    d: "小白看不懂进度；经验丰富的开发者会在长开发中『忘了当初要的那个东西』——Lab Agent 全程跟随，第一时间指出偏离。",
  },
  {
    t: "讨论必须与执行隔离",
    d: "拿 Coding Agent 当讨论对象会污染它的上下文与产品认知。Lab Agent 拥有独立上下文：先在它这里把想法磨清楚，再决定是否转指令。",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <header className="about-hero">
        <div className="course-wrap">
          <div className="sec-no sec-no--light">
            <span className="mono">LAB AGENT · VIBE CODING 监工</span>
          </div>
          <h1>
            做代码的是 Claude Code，
            <br />
            守住<span className="hl">意图与质量</span>的是 Lab Agent
          </h1>
          <p className="about-hero-lead">
            Lab Agent 不写代码。它从产品诞生起就全程跟随：陪你把想法磨成 PRD，
            盯着执行 Agent 别跑偏，把专业汇报翻译成人话，最后逐项验收。
            它是你 Vibe Coding 时的监工。
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <a className="btn-main" href="/agent">
              去试 Lab Agent →
            </a>
            <a className="btn-ghost--light" href="/contact">
              联系创始人
            </a>
          </div>
        </div>
      </header>

      <main className="join-main">
        {/* 01 为什么需要 */}
        <section className="course-sec">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">01</span>
              <span>为什么需要监工</span>
            </div>
            <h2 className="course-h2">两个真实的痛点，它只解决这一件事</h2>
            <div className="benefit-grid">
              {PAINS.map((p) => (
                <div className="benefit-card" key={p.t}>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 02 三层结构 */}
        <section className="course-sec course-sec--alt">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">02</span>
              <span>怎么运行</span>
            </div>
            <h2 className="course-h2">三层结构：意图层 / 执行层 / 验收层</h2>
            <ol className="about-rules" style={{ listStyle: "none" }}>
              <li>
                <span className="about-dot" aria-hidden="true" />
                <b>开发者 ↔ Lab Agent（意图层）</b>：随时讨论、对齐感受，沉淀成「决策记录」——上下文与执行完全隔离。
              </li>
              <li>
                <span className="about-dot" aria-hidden="true" />
                <b>授权 → Coding Agent（执行层）</b>：Claude Code / Codex 等在干净上下文里干活，产出 diff 与汇报。
              </li>
              <li>
                <span className="about-dot" aria-hidden="true" />
                <b>回 Lab Agent（验收层）</b>：对照 PRD + 决策记录验收、纠偏、打回；翻译成你看得懂的语言。
              </li>
            </ol>
          </div>
        </section>

        {/* 03 五大职责 */}
        <section className="course-sec">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">03</span>
              <span>它管什么</span>
            </div>
            <h2 className="course-h2">五个可独立交付的能力</h2>
            <div className="blk-grid">
              {ROLES.map((r) => (
                <div className="blk-card blk-card--plain" key={r.t}>
                  <div className="blk-top">
                    <span className="mono blk-no" style={{ fontSize: 18 }}>
                      {r.icon}
                    </span>
                    <span className="tag mono">{r.st}</span>
                  </div>
                  <h3>{r.t}</h3>
                  <p className="blk-desc">{r.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 04 两种形态 */}
        <section className="course-sec course-sec--alt">
          <div className="course-wrap">
            <div className="sec-no">
              <span className="mono">04</span>
              <span>两种形态</span>
            </div>
            <h2 className="course-h2">画布，或 SDK——内核是同一套</h2>
            <div className="benefit-grid">
              <div className="benefit-card">
                <h3>🧩 画布形态</h3>
                <p>一个工作区里同时开着 Coding Agent 与 Lab Agent，开发者在中间——最自然的监工界面。</p>
              </div>
              <div className="benefit-card">
                <h3>🧰 SDK / 嵌入形态</h3>
                <p>把「监工 Agent」作为子 Agent 嵌进你习惯的工具链，供其它工作流调用。</p>
              </div>
            </div>
          </div>
        </section>

        {/* 05 CTA */}
        <section className="about-closer">
          <p className="about-closer-quote">做出来，摆上台，被看见。</p>
          <p className="about-closer-sub">Lab Agent 正在从「站内问询助手」走向你的代码工作台。</p>
          <a className="btn-main" href="/agent" style={{ marginTop: 26 }}>
            和 Lab Agent 聊聊 →
          </a>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
