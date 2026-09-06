"use client";

/* /agent 交互式演示 · 双画布形态
 * 左: Claude Code 工作画面(终端滚动 + 行末徽章) → 中: 监工视线 → 右: Lab Agent 姿态面板
 * Lab Agent 不再"对话", 改为"批注" —— 在 coder 行后加 ✓ ⚠ ✗, 右侧只显示"此刻在干嘛"
 * 整页锁 viewport, 终端内部滚动, 旧行顶出, 演示永不拉长页面。LLM 失败自动回落剧本。 */

import { useEffect, useRef, useState } from "react";
import styles from "./agent.module.css";
import {
  CUSTOM_FALLBACK_ASK,
  ENDING,
  NO_LAB,
  TASKS,
  customPrd,
  type PrdCard,
  type ScriptTask,
} from "./script";

const STEPS = ["对齐意图", "产出 PRD", "派活执行", "翻译汇报", "验收抉择", "交付"];

/* 终端行类型 —— 行末有徽章（Lab Agent 的批注） */
type BadgeKind = "ok" | "warn" | "reject" | "ask" | "dim" | "none";
type CodeLn = { tone: "ok" | "warn" | "cmd" | "dim"; text: string; badge: BadgeKind };

const TONE_CLS: Record<CodeLn["tone"], string> = {
  ok: "cOk",
  warn: "cWarn",
  cmd: "cCmd",
  dim: "cDim",
};
const BADGE_CLS: Record<BadgeKind, string> = {
  ok: "bOk",
  warn: "bWarn",
  reject: "bReject",
  ask: "bAsk",
  dim: "bDim",
  none: "bNone",
};
const BADGE_TXT: Record<BadgeKind, string> = {
  ok: "✓ 通过",
  warn: "⚠ 偏离",
  reject: "✗ 打回",
  ask: "? 需解释",
  dim: "·",
  none: "·",
};

/* Lab Agent 当前姿态（不再累积气泡，只显示此刻状态） */
type Display =
  | { kind: "idle" }
  | { kind: "ask"; round: number; q?: string; options?: string[]; lastAnswer?: string }
  | { kind: "prd"; status: "producing" | "ready"; card?: PrdCard }
  | { kind: "run"; reportReceived: boolean; translating: boolean }
  | { kind: "rogue"; note: string; label: string; asked: boolean; rejectVerdict?: string }
  | { kind: "end"; accepted: boolean };

const MAX_CODE_LINES = 14;

/* 自定义任务(无特化剧本)的通用演出素材 */
const GENERIC_ROLL: string[] = [
  "> 初始化项目 · Next.js + TS",
  "✓ 项目骨架生成",
  "→ 实现核心流程",
  "✓ 主流程跑通",
  "→ 顺手加了个「锦上添花」的东西（先记着）",
  "✓ 样式打磨",
  "✓ 测试通过",
  "→ 准备提交",
];
const GENERIC_REPORT =
  "核心功能完成。实现过程中顺手加了点优化和一个新入口，觉得用户会喜欢；代码结构保持整洁，测试通过。";
const GENERIC_TRANS: { t: string; p: string }[] = [
  { t: "核心功能完成，测试通过", p: "你要的那个东西，确实做出来了" },
  { t: "顺手加了点优化 + 一个新入口", p: "这是它自作主张——你从没提过" },
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api(kind: string, payload: Record<string, unknown>): Promise<any | null> {
  try {
    const r = await fetch("/api/lab-demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, ...payload }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j && j.ok ? j : null;
  } catch {
    return null;
  }
}

export default function DemoStage() {
  const [scene, setScene] = useState<"intro" | "play" | "end">("intro");
  const [step, setStep] = useState(0);
  const [linkLabel, setLinkLabel] = useState("就绪");
  const [sys, setSys] = useState("");
  const [idea, setIdea] = useState("");
  const [task, setTask] = useState<ScriptTask | null>(null);
  const [customDraft, setCustomDraft] = useState("");
  const [display, setDisplay] = useState<Display>({ kind: "idle" });
  const [code, setCode] = useState<CodeLn[]>([]);
  const [codeBusy, setCodeBusy] = useState(false);
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);

  const genRef = useRef(0);
  const waitRef = useRef<((v: string) => void) | null>(null);
  const introRef = useRef(false);
  const lastRun = useRef<{ id: string | null; text: string }>({ id: null, text: "" });
  const verdictRef = useRef<string | null>(null);

  const gen = () => ++genRef.current;

  const pushCode = async (lines: CodeLn[], pace: number, g: number) => {
    for (const ln of lines) {
      if (genRef.current !== g) return;
      setCode((c) => {
        const next = [...c, ln];
        if (next.length > MAX_CODE_LINES) next.splice(0, next.length - MAX_CODE_LINES);
        return next;
      });
      await sleep(pace);
    }
  };

  const waitChoice = () =>
    new Promise<string>((resolve) => {
      waitRef.current = resolve;
    });

  const pick = (v: string) => {
    waitRef.current?.(v);
    waitRef.current = null;
  };

  /* ---------- 序章 · 无监工预告（仅一次） ---------- */
  useEffect(() => {
    if (introRef.current) return;
    introRef.current = true;
    void (async () => {
      const g = gen();
      setScene("intro");
      setCodeBusy(true);
      setLinkLabel("序章");
      for (const m of NO_LAB) {
        if (genRef.current !== g) return;
        if (m.who === "sys") {
          await saySys(m.text, g);
        } else if (m.who === "code") {
          setCode((c) => {
            const next = [
              ...c,
              { tone: m.text.startsWith("✓") ? ("ok" as const) : ("cmd" as const), text: m.text, badge: "none" as const },
            ];
            if (next.length > MAX_CODE_LINES) next.splice(0, next.length - MAX_CODE_LINES);
            return next;
          });
          await sleep(800);
        } else {
          await saySys(m.text, g);
        }
      }
      if (genRef.current !== g) return;
      setCodeBusy(false);
      setScene("play");
      setDisplay({ kind: "idle" });
      setStep(0);
      setLinkLabel("选任务");
    })();
  }, []);

  async function saySys(text: string, g: number) {
    setSys("");
    for (let i = 0; i <= text.length; i += 3) {
      if (genRef.current !== g) return;
      setSys(text.slice(0, i));
      await sleep(14);
    }
  }

  /* ---------- 开始 / 重演 ---------- */
  function skipIntro() {
    gen();
    setCodeBusy(false);
    setCode([]);
    setSys("");
    setScene("play");
    setDisplay({ kind: "idle" });
    setStep(0);
    setLinkLabel("选任务");
  }

  function replay() {
    if (!lastRun.current.id && !lastRun.current.text) {
      skipIntro();
      return;
    }
    void start(lastRun.current.id, lastRun.current.text);
  }

  async function start(id: string | null, customText: string) {
    const g = gen();
    const t = id ? TASKS.find((x) => x.id === id) ?? null : null;
    const theIdea = t ? t.idea : customText.trim();
    if (!theIdea) return;
    lastRun.current = { id, text: customText };
    verdictRef.current = null;
    setTask(t);
    setIdea(theIdea);
    setScene("play");
    setCodeBusy(true);
    setStep(0);
    setCode([]);
    setAnswers([]);
    setDisplay({ kind: "idle" });
    setLinkLabel("对齐意图");
    setSys("");
    await sleep(400);

    /* 第一幕 · 对齐意图（3 轮追问） */
    setDisplay({ kind: "ask", round: 0 });
    await saySys("Lab Agent 把你的想法拆细一点，3 个问题问完就能定 PRD。", g);
    const past: { q: string; a: string }[] = [];
    for (let r = 0; r < 3; r++) {
      if (genRef.current !== g) return;
      setStep(0);
      setLinkLabel(`对齐 · 第 ${r + 1}/3 问`);
      const ures = await api("ask", { idea: theIdea, past, round: r });
      const fb = t ? t.fallbackAsk[r] : CUSTOM_FALLBACK_ASK[r];
      const q = ures?.question ? String(ures.question) : fb.q;
      const options =
        Array.isArray(ures?.options) && (ures.options as string[]).length === 3
          ? (ures.options as string[])
          : fb.options;
      setDisplay({ kind: "ask", round: r, q, options, lastAnswer: past.length ? past[past.length - 1].a : undefined });
      const a = await waitChoice();
      if (genRef.current !== g) return;
      past.push({ q, a });
      setAnswers([...past]);
      setDisplay({ kind: "ask", round: r, q, options, lastAnswer: a });
      await sleep(300);
    }

    /* 第二幕 · PRD */
    if (genRef.current !== g) return;
    setStep(1);
    setLinkLabel("产出 PRD");
    setDisplay({ kind: "prd", status: "producing" });
    await saySys("3 个问题问完。Lab Agent 把你的话整理成一页 PRD。", g);
    const pres = await api("prd", { idea: theIdea, answers: past });
    const prdCard: PrdCard = pres?.prd ?? (t ? t.prd : customPrd(theIdea));
    if (genRef.current !== g) return;
    setDisplay({ kind: "prd", status: "ready", card: prdCard });
    await sleep(700);

    /* 第三幕 · 派活 + 终端执行 */
    if (genRef.current !== g) return;
    setStep(2);
    setLinkLabel("派活 · 盯中");
    setDisplay({ kind: "run", reportReceived: false, translating: false });
    await saySys("PRD 派给 Claude Code —— Lab Agent 跟着它干活，全程盯。", g);
    const roll: string[] = t ? t.roll : GENERIC_ROLL;
    const rollLn: CodeLn[] = roll.map((x): CodeLn => {
      let badge: BadgeKind = "ok";
      if (x.startsWith(">")) badge = "none";
      else if (x.includes("顺手") || x.includes("先记着")) badge = "none"; // 待 Lab Agent 在翻译阶段打 warn
      return { tone: x.startsWith(">") ? "cmd" : "ok", text: x, badge };
    });
    await pushCode(rollLn, 380, g);
    if (genRef.current !== g) return;

    /* 第四幕 · 提交报告 + Lab Agent 逐句翻译 + 在 coder 行后打批注 */
    setStep(3);
    setLinkLabel("翻译 · 批注中");
    await pushCode(
      [
        { tone: "dim", text: "→ git commit -m \"feat: 模块一交付\"", badge: "dim" },
        { tone: "cmd", text: "→ 向开发者汇报完成情况", badge: "dim" },
        { tone: "ok", text: "【汇报】", badge: "dim" },
        { tone: "ok", text: t ? t.techReport : GENERIC_REPORT, badge: "none" },
      ],
      560,
      g,
    );
    if (genRef.current !== g) return;
    setDisplay({ kind: "run", reportReceived: true, translating: true });
    await saySys("coder 交差了。Lab Agent 在技术汇报上一句句批注,翻译给你听。", g);
    const trans = t ? t.translate : GENERIC_TRANS;
    for (let i = 0; i < trans.length; i++) {
      if (genRef.current !== g) return;
      const pair = trans[i];
      const isLast = i === trans.length - 1;
      /* 在终端最后一行的"汇报"行后插入翻译行（带 bWarn 标记） */
      setCode((c) => {
        const lastIdx = c.length - 1;
        const inject = {
          tone: "warn" as const,
          text: `▷ 翻译：${pair.t}\n   → ${pair.p}`,
          badge: (isLast ? "warn" : "ok") as BadgeKind,
        };
        const next = [...c.slice(0, lastIdx), c[lastIdx], inject, ...c.slice(lastIdx + 1)];
        if (next.length > MAX_CODE_LINES) next.splice(0, next.length - MAX_CODE_LINES);
        return next;
      });
      await sleep(820);
    }

    /* 第五幕 · 验收抉择 */
    if (genRef.current !== g) return;
    setStep(4);
    setLinkLabel("验收 · 抉择");
    const rogueNote = t
      ? t.rogue.note
      : "验收发现一处偏离：它给自己加了个「从没提过的附加功能」。你的原始描述里没有它。";
    const rogueLabel = t ? t.rogue.label : "附加功能";
    setDisplay({ kind: "rogue", note: rogueNote, label: rogueLabel, asked: false });
    const c1 = await waitChoice();
    if (genRef.current !== g) return;

    if (c1 === "ask") {
      setLinkLabel("验收 · 解释中");
      await saySys("你问 Lab Agent：为什么不该加？", g);
      const vres = await api("verdict", { idea: theIdea, rogueLabel });
      const vText =
        vres?.reply ??
        (t
          ? t.verdictFallback
          : "因为它不在你原本的意图里。想要的时候，写进 PRD 再让它做——顺序不能反。");
      verdictRef.current = vText;
      setDisplay({ kind: "rogue", note: rogueNote, label: rogueLabel, asked: true, rejectVerdict: vText });
      await sleep(500);
      await saySys("你被说服了。回到抉择——", g);
      setLinkLabel("验收 · 抉择");
      const c2 = await waitChoice();
      if (genRef.current !== g) return;
      await resolveRogue(c2, g, t, rogueLabel, theIdea, rogueNote);
      return;
    }
    await resolveRogue(c1, g, t, rogueLabel, theIdea, rogueNote);
  }

  async function resolveRogue(c: string, g: number, t: ScriptTask | null, rogueLabel: string, theIdea: string, rogueNote: string) {
    if (c === "accept") {
      setLinkLabel("收工");
      await saySys("你选了：让它留着。Lab Agent 把它标记为「偏离 · 你已接受」。", g);
      await sleep(400);
      setStep(5);
      setCodeBusy(false);
      setDisplay({ kind: "end", accepted: true });
      setScene("end");
      return;
    }
    /* reject */
    setLinkLabel("打回 · coder 重做");
    await saySys("你选了：删掉。Lab Agent 把这一行打回给 coder。", g);
    const fbVerdict = t
      ? t.verdictFallback
      : `已打回 Claude Code：移除「${rogueLabel}」。理由：它不在你原本的意图里——PRD 没写的，不许加。`;
    let vText: string | null = verdictRef.current;
    if (!vText) {
      const vres = await api("verdict", { idea: theIdea, rogueLabel });
      vText = String(vres?.reply ?? "") || fbVerdict;
      verdictRef.current = vText;
    }
    setDisplay({ kind: "rogue", note: rogueNote, label: rogueLabel, asked: true, rejectVerdict: vText });
    await sleep(500);
    await pushCode(
      [
        { tone: "warn", text: `↩ 收到打回：移除「${rogueLabel}」`, badge: "reject" },
        { tone: "ok", text: "✓ 已回滚，与 PRD 对齐", badge: "ok" },
      ],
      750,
      g,
    );
    if (genRef.current !== g) return;
    setLinkLabel("验收 · 通过");
    setStep(5);
    setCodeBusy(false);
    setDisplay({ kind: "end", accepted: false });
    setScene("end");
    await saySys(ENDING.line, g);
  }

  /* ---------- 回调 ---------- */
  function onPick(id: string) {
    void start(id, "");
  }
  function onCustomStart() {
    if (!customDraft.trim()) return;
    void start(null, customDraft);
  }
  function onAskType() {
    const el = document.getElementById("agent-ask-input") as HTMLInputElement | null;
    const v = el?.value;
    if (v && v.trim()) pick(v.trim());
  }

  /* ---------- 渲染辅助：badge 文本 + Lab Agent 抬头文字 ---------- */
  const labTitle = (() => {
    switch (display.kind) {
      case "idle":
        return scene === "intro" ? "序章 · 没有监工" : "就绪 · 等你下任务";
      case "ask":
        return `追问 · 第 ${display.round + 1}/3 问`;
      case "prd":
        return display.status === "producing" ? "整理 PRD 中…" : `PRD · ${display.card?.title ?? ""}`;
      case "run":
        return display.translating ? "翻译汇报 · 批注中" : "派活执行 · 盯中";
      case "rogue":
        return display.asked ? "已给出打回理由" : "验收 · 发现 1 处偏离";
      case "end":
        return display.accepted ? "收工 · 偏离已留" : "收工 · 验收通过";
    }
  })();

  const labSub = (() => {
    switch (display.kind) {
      case "idle":
        return scene === "intro" ? "先看没监工时会怎么跑偏" : "左: Claude Code 执行端 · 中: 监工视线 · 右: 我的姿态";
      case "ask":
        return "Lab Agent 把你的想法拆细,3 个问题问完就能定 PRD";
      case "prd":
        return display.status === "producing" ? "把对话汇总成一页" : "这是接下来 coder 唯一要听的东西";
      case "run":
        return display.reportReceived ? "我正把它的技术汇报翻译给你" : "我盯着它,你看进程就好";
      case "rogue":
        return display.asked ? "理由如上,现在回到你的抉择" : "它在 PRD 之外加了个东西,你看怎么处理";
      case "end":
        return display.accepted
          ? "你接受了偏离——下次我会更早提醒你"
          : "这一刻交付和你说的完全一致 ✓";
    }
  })();

  const stepName = STEPS[Math.min(step, STEPS.length - 1)];

  /* ---------- 渲染 ---------- */
  return (
    <div className={styles.stage}>
      {/* topbar */}
      <div className={styles.topbar}>
        <div className={styles.dotrow}>
          <span className={styles.dot} style={{ background: "#ff5f57" }} />
          <span className={styles.dot} style={{ background: "#febc2e" }} />
          <span className={styles.dot} style={{ background: "#28c840" }} />
        </div>
        <div className={styles.topbarTitle}>vibe-lab · 一个开发循环</div>
        <div className={styles.paneTag}>{scene === "end" ? "演示完成" : scene === "intro" ? "序章" : stepName}</div>
      </div>

      {/* steps */}
      <div className={styles.steps}>
        {STEPS.map((s, i) => (
          <span key={s} className={`${styles.step} ${i <= step ? styles.stepOn : ""}`} />
        ))}
      </div>

      {/* 双画布 */}
      <div className={styles.canvas}>
        {/* 左：Claude Code 工作画面 */}
        <div className={styles.codeCanvas} aria-label="Claude Code 工作画面">
          {code.map((ln, i) => (
            <div key={i} className={styles.codeLine}>
              <span className={`${styles.codeBadge} ${styles[BADGE_CLS[ln.badge]]}`}>
                {BADGE_TXT[ln.badge]}
              </span>
              <span className={`${styles.codeText} ${styles[TONE_CLS[ln.tone]]}`}>{ln.text}</span>
            </div>
          ))}
          {(scene === "intro" || codeBusy) && <span className={styles.cursor} />}
        </div>

        {/* 中：监工视线 */}
        <div className={styles.linkZone} aria-hidden="true">
          <div className={styles.linkTrack}>
            <span className={styles.linkDot} />
          </div>
          <div className={styles.linkLabel}>{linkLabel}</div>
        </div>

        {/* 右：Lab Agent 监工姿态 */}
        <div className={styles.labCanvas}>
          <div className={styles.labHeader}>
            <div className={styles.labKicker}>LAB AGENT · 监工姿态</div>
            <div className={styles.labTitle}>{labTitle}</div>
            <div className={styles.labSub}>{labSub}</div>
          </div>
          <div className={styles.labBody}>
            {display.kind === "prd" && display.status === "ready" && display.card && (
              <div className={styles.prdCard}>
                <div className={styles.prdTitle}>{display.card.title}</div>
                <p className={styles.prdSummary}>{display.card.summary}</p>
                {display.card.sections.map((s, j) => (
                  <div key={j} className={styles.prdSection}>
                    <h4>{s.h}</h4>
                    <ul>
                      {s.items.map((it, k) => (
                        <li key={k}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {display.kind === "rogue" && (
              <div className={styles.rogueCard}>
                <b>它加了：</b>
                <span className={styles.rogueLabel}>{display.label}</span>
                <p style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.7, color: "#5b4a1a" }}>
                  {display.note}
                </p>
                {display.asked && display.rejectVerdict && (
                  <p style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.7, color: "#3c3489" }}>
                    <b>我的理由：</b>
                    {display.rejectVerdict}
                  </p>
                )}
                <div className={styles.choiceRow}>
                  <button className={styles.choice} onClick={() => pick("accept")}>
                    算了,让它加上也行
                  </button>
                  <button className={styles.choice} onClick={() => pick("reject")}>
                    删掉,按我说的来
                  </button>
                  {!display.asked && (
                    <button className={styles.choice} onClick={() => pick("ask")}>
                      为什么不能加？让它说说
                    </button>
                  )}
                </div>
              </div>
            )}

            {display.kind === "end" && (
              <div className={styles.endCard}>
                <b>一个开发循环,走完了</b>
                <p>{ENDING.body}</p>
                <div className={styles.endCtas}>
                  <button className={styles.actBtn} onClick={replay}>
                    再演一次
                  </button>
                  <a className={styles.ghostBtn} href="/home">
                    看完整概念 →
                  </a>
                  <a className={styles.ghostBtn} href="/contact">
                    支持我们
                  </a>
                </div>
              </div>
            )}

            {(display.kind === "idle" || display.kind === "run" || display.kind === "ask") && (
              <div className={styles.statRow}>
                <span className={styles.statChip}>已对齐 {answers.length}/3</span>
                <span>·</span>
                <span className={styles.statChip}>PRD 待产</span>
                <span>·</span>
                <span className={styles.statChip}>偏离 0</span>
              </div>
            )}
            {(display.kind === "prd" || display.kind === "run" || display.kind === "rogue" || display.kind === "end") && (
              <div className={styles.statRow}>
                <span className={styles.statChip}>已对齐 {answers.length}/3</span>
                <span>·</span>
                <span className={styles.statChip}>PRD 已签</span>
                <span>·</span>
                <span className={styles.statChip}>偏离 1</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部对话区 / sysbar */}
      {display.kind === "ask" ? (
        <div className={styles.dialogue}>
          <div className={styles.askPrompt}>
            <b>Lab Agent 追问：</b>
            {display.q}
          </div>
          {display.options && (
            <div className={styles.askChips}>
              {display.options.map((o) => (
                <button key={o} className={styles.chip} onClick={() => pick(o)}>
                  {o}
                </button>
              ))}
            </div>
          )}
          <div className={styles.dialogueInput}>
            <input id="agent-ask-input" placeholder="或者自己答一句…" onKeyDown={(e) => e.key === "Enter" && onAskType()} />
            <button className={styles.actBtn} onClick={onAskType}>
              答
            </button>
          </div>
        </div>
      ) : display.kind === "idle" && scene !== "end" ? (
        <div className={styles.dialogue}>
          <div className={styles.taskChipsBox}>
            <div className={styles.dialogueIdle}>挑一个开演,或者写下你自己的:</div>
            <div className={styles.taskRow}>
              {TASKS.map((t) => (
                <button key={t.id} className={styles.taskChip} onClick={() => onPick(t.id)}>
                  {t.title}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.customBox}>
            <input
              placeholder="比如:做一个给爸妈的用药提醒…"
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onCustomStart()}
              style={{ flex: 1, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink)", borderRadius: 9, padding: "7px 11px", font: "inherit", fontSize: 12.5 }}
            />
            <button className={styles.actBtn} disabled={!customDraft.trim()} onClick={onCustomStart}>
              开演
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.sysBar}>
          <span>
            <b>{sys || (scene === "intro" ? "序章进行中…" : "演完了一段")}</b>
          </span>
          {scene === "intro" && (
            <button className={styles.skipBtn} onClick={skipIntro}>
              跳过序章 →
            </button>
          )}
        </div>
      )}
    </div>
  );
}