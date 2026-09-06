import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import AgentDemo from "./AgentDemo";
import FormTabs from "./FormTabs";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Lab Agent — Vibe Lab · 振动实验室",
  description:
    "Lab Agent：Vibe Coding 时代的监工。写代码的是 Claude Code / Codex，守住意图、进度与质量的是 Lab Agent——讨论时给你第二颗大脑，执行时当验收监工。",
};

const ABILITIES = [
  { no: "01", name: "📝 意图记录", d: "想法 → 追问 → 高完成度 PRD。产品还没写代码，方向先被钉住。", st: "已在做" },
  { no: "02", name: "🗣 翻译官", d: "执行 Agent 的汇报翻成人话，标注关键决定，不让你漏掉细节。", st: "已在做" },
  { no: "03", name: "✅ 验收", d: "对照 PRD 与决策记录逐项打勾；不合格带理由打回重做。", st: "规划中" },
  { no: "04", name: "👀 偏差哨兵", d: "从 diff 与汇报里抓「跑偏了」，第一时间提醒你和执行 Agent。", st: "规划中" },
  { no: "05", name: "🧠 决策记忆", d: "每次重要讨论沉淀成决策记录 + 你的偏好档案，越用越懂你。", st: "规划中" },
  { no: "06", name: "🕹 调度", d: "真正驱动执行 Agent 推进——等主流 Coding Agent 开放监管协议后解锁。", st: "最远期" },
];

const SCENES = [
  {
    k: "新手 · 第一周",
    t: "看不懂 Agent 在干嘛",
    d: "它把「模块 A 用了 Repository 模式」翻成「你项目的数据库层已经能存东西了」，还告诉你下一步该验证哪。",
  },
  {
    k: "老手 · 三个月项目",
    t: "怕做着做着忘了初心",
    d: "它拿当初的 PRD 与决策记录盯每一次 diff：这个改动和周三定的范围冲突了，要推翻吗？",
  },
  {
    k: "任何人 · 改需求前",
    t: "想先讨论，别污染执行上下文",
    d: "拿 Coding Agent 当讨论对象会带偏它；先在 Lab Agent 这儿把想法磨清楚，确认了再下指令。",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteNav />

      {/* ===== Hero：定位 + 打字机终端 demo ===== */}
      <header className={styles.hero}>
        <div className={styles.heroGrid}>
          <div>
            <div className={styles.badges}>
              <span className={styles.badge}>Apache-2.0 开源</span>
              <span className={styles.badge}>概念验证中 · 2026</span>
              <span className={styles.badge}>已在 vibe-lab 站内可对话</span>
            </div>
            <h1 className={styles.h1}>
              你的 Coding Agent 负责快，
              <br />
              <span className={styles.hl}>Lab Agent 负责“别跑偏”</span>
            </h1>
            <p className={styles.lead}>
              写代码的交给 <b>Claude Code / Codex / Cursor</b>；
              意图、进度与质量交给 <b>Lab Agent</b>——它全程跟随：讨论时给你第二颗大脑，执行时当验收监工。
              现在就能对话，去工作台试试。
            </p>
            <div className={styles.ctaRow}>
              <a className={styles.btnMain} href="/agent">
                去试 Lab Agent →
              </a>
              <a className={styles.btnGhost} href="#how">
                看它怎么工作
              </a>
            </div>
          </div>
          <AgentDemo />
        </div>
      </header>

      <main>
        {/* ===== 定位条：不是又一个 coding agent ===== */}
        <section className={styles.sec}>
          <div className={styles.wrap}>
            <div className={styles.posRow}>
              <span className={styles.posLabel}>写代码的是它们</span>
              <span className={styles.posTag}>Claude Code</span>
              <span className={styles.posTag}>Codex</span>
              <span className={styles.posTag}>Cursor</span>
              <span className={styles.posTag}>Aider · Cline …</span>
              <span className={styles.posLine}>
                —— 而 Lab Agent 不和它们抢活：它站在执行层外面，专门盯"你的意图有没有被跑偏"。
              </span>
            </div>
          </div>
        </section>

        {/* ===== 能力：动词式短句 ===== */}
        <section className={`${styles.sec} ${styles.secAlt}`} id="how">
          <div className={styles.wrap}>
            <div className={styles.k}>WHAT IT DOES</div>
            <h2 className={styles.h2}>一个监工，六个可独立交付的能力</h2>
            <p className={styles.sub}>每一项都可以单独先用起来；越往后越接近"真·驱动"。</p>
            <div className={styles.abilityGrid}>
              {ABILITIES.map((a) => (
                <div className={styles.ability} key={a.no}>
                  <div className={styles.abilityHead}>
                    <span className={styles.abilityName}>
                      <span className={styles.abilityNo}>{a.no}</span> {a.name}
                    </span>
                    <span className={`${styles.state} ${a.st === "已在做" ? styles.stateDo : styles.statePlan}`}>{a.st}</span>
                  </div>
                  <p className={styles.abilityDesc}>{a.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 场景 ===== */}
        <section className={styles.sec}>
          <div className={styles.wrap}>
            <div className={styles.k}>USE CASES</div>
            <h2 className={styles.h2}>挑一个场景，看看监工怎么帮你</h2>
            <div className={styles.sceneGrid}>
              {SCENES.map((s) => (
                <div className={styles.scene} key={s.k}>
                  <span className={styles.sceneK}>{s.k}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                  <a href="/agent">去和 Lab Agent 聊聊 →</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 两种形态 ===== */}
        <section className={`${styles.sec} ${styles.secAlt}`}>
          <div className={styles.wrap}>
            <div className={styles.k}>TWO FORMS · ONE CORE</div>
            <h2 className={styles.h2}>画布，还是 SDK？内核是同一套</h2>
            <FormTabs />
          </div>
        </section>
      </main>

      {/* ===== 收尾 CTA ===== */}
      <section className={styles.closer}>
        <h2>
          试试你的第一个
          <span className={styles.hl}>监工对话</span>
        </h2>
        <p>现在就能和 Lab Agent 聊：让它帮你拆一段需求、或问你该不该用某个工具。</p>
        <a className={styles.btnMain} href="/agent">
          打开 Lab Agent 工作台 →
        </a>
      </section>

      <SiteFooter />
    </>
  );
}
