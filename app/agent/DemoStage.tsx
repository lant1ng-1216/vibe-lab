"use client";

/* /agent 交互式演示舞台
 * 流程: 序章(无监工灾难预告) → 选任务 → LLM 追问×3(chips+自由输入)
 *      → PRD 卡 → 终端执行演出 → 汇报逐句翻译 → 决策点(接受/拒绝/问它)
 *      → 验收交付 / 落幕。LLM 全程可回落 script.ts 剧本, 演示永不卡死。 */

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

type Tone = "lab" | "ok" | "warn";
type LabMsg =
  | { kind: "text"; text: string; tone: Tone }
  | { kind: "trans"; pair: { t: string; p: string } };
type CodeLn = { tone: "ok" | "warn" | "cmd" | "dim"; text: string };
type Ui = "intro" | "pick" | "ask" | "rogue" | "idle";

const CODE_TONE: Record<CodeLn["tone"], string> = {
  ok: "cOk",
  warn: "cWarn",
  cmd: "cCmd",
  dim: "cDim",
};

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
  const [ui, setUi] = useState<Ui>("intro");
  const [step, setStep] = useState(0);
  const [sys, setSys] = useState("");
  const [idea, setIdea] = useState("");
  const [task, setTask] = useState<ScriptTask | null>(null);
  const [customDraft, setCustomDraft] = useState("");

  const [labMsgs, setLabMsgs] = useState<LabMsg[]>([]);
  const [prd, setPrd] = useState<PrdCard | null>(null);
  const [code, setCode] = useState<CodeLn[]>([]);
  const [codeBusy, setCodeBusy] = useState(false);

  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);
  const [askUI, setAskUI] = useState<{ q: string; options: string[] } | null>(null);
  const [rogueUI, setRogueUI] = useState<{ note: string; asked: boolean } | null>(null);

  const genRef = useRef(0);
  const waitRef = useRef<((v: string) => void) | null>(null);
  const introRef = useRef(false);
  const lastRun = useRef<{ id: string | null; text: string }>({ id: null, text: "" });
  const verdictRef = useRef<string | null>(null);

  /* ---------- 舞台基础 ---------- */
  const gen = () => ++genRef.current;

  const resetBoard = () => {
    setLabMsgs([]);
    setPrd(null);
    setCode([]);
    setSys("");
    setAnswers([]);
    setAskUI(null);
    setRogueUI(null);
    setUi("idle");
    setStep(0);
  };

  const saySys = async (text: string, g: number) => {
    setSys("");
    for (let i = 0; i <= text.length; i += 3) {
      if (genRef.current !== g) return;
      setSys(text.slice(0, i));
      await sleep(16);
    }
  };

  const sayLab = async (text: string, tone: Tone, g: number) => {
    setLabMsgs((m) => [...m, { kind: "text", text: "", tone }]);
    for (let i = 0; i < text.length; i += 2) {
      if (genRef.current !== g) return;
      const head = text.slice(0, i);
      setLabMsgs((m) => {
        if (!m.length) return m;
        const last = m[m.length - 1];
        if (last.kind !== "text") return m;
        return [...m.slice(0, -1), { ...last, text: head }];
      });
      await sleep(13);
    }
    if (genRef.current !== g) return;
    setLabMsgs((m) => {
      if (!m.length) return m;
      const last = m[m.length - 1];
      if (last.kind !== "text") return m;
      return [...m.slice(0, -1), { ...last, text }];
    });
  };

  const sayTrans = async (pair: { t: string; p: string }) => {
    setLabMsgs((m) => [...m, { kind: "trans", pair }]);
    await sleep(650);
  };

  const pushCode = async (lines: CodeLn[], pace: number, g: number) => {
    for (const ln of lines) {
      if (genRef.current !== g) return;
      setCode((c) => [...c, ln]);
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

  /* ---------- 序章 · 无监工预告(挂载一次) ---------- */
  useEffect(() => {
    if (introRef.current) return;
    introRef.current = true;
    void (async () => {
      const g = gen();
      setScene("intro");
      setUi("intro");
      setCodeBusy(true);
      for (const m of NO_LAB) {
        if (genRef.current !== g) return;
        if (m.who === "sys") {
          await saySys(m.text, g);
        } else if (m.who === "code") {
          setCode((c) => [...c, { tone: m.text.startsWith("✓") ? "ok" : "cmd", text: m.text }]);
          await sleep(850);
        } else {
          await sayLab(m.text, "ok", g);
        }
      }
      if (genRef.current !== g) return;
      setCodeBusy(false);
      setScene("play");
      setUi("pick");
      setStep(0);
    })();
  }, []);

  /* ---------- 开始 / 重演 ---------- */
  function skipIntro() {
    gen(); // 取消正在跑的序章
    setCodeBusy(false);
    setScene("play");
    resetBoard();
    setUi("pick");
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
    resetBoard();
    await sleep(500);

    /* 第一幕 · 对齐意图(3 轮) */
    await sayLab("开工前，先把你要的东西问清楚。你负责想，我负责别让它跑偏。", "lab", g);
    const past: { q: string; a: string }[] = [];
    for (let r = 0; r < 3; r++) {
      if (genRef.current !== g) return;
      const res = await api("ask", { idea: theIdea, past, round: r });
      const fb = t ? t.fallbackAsk[r] : CUSTOM_FALLBACK_ASK[r];
      const q = res?.question ? String(res.question) : fb.q;
      const options =
        Array.isArray(res?.options) && (res.options as string[]).length === 3
          ? (res.options as string[])
          : fb.options;
      setStep(0);
      setAskUI({ q, options });
      setUi("ask");
      const a = await waitChoice();
      if (genRef.current !== g) return;
      past.push({ q, a });
      setAnswers([...past]);
      setAskUI(null);
      setUi("idle");
      await sayLab(`收到——「${a}」。`, "ok", g);
      await sleep(320);
    }

    /* 第二幕 · PRD */
    if (genRef.current !== g) return;
    setStep(1);
    await saySys(
      "三个问题问完。Lab Agent 把你的话整理成一页 PRD——接下来，这是 Claude Code 唯一要听的东西。",
      g,
    );
    const pres = await api("prd", { idea: theIdea, answers: past });
    const prdCard: PrdCard = pres?.prd ?? (t ? t.prd : customPrd(theIdea));
    if (genRef.current !== g) return;
    setPrd(prdCard);
    await sleep(500);

    /* 第三幕 · 派活 + 终端执行 */
    if (genRef.current !== g) return;
    setStep(2);
    await sayLab("PRD 定了。派给 Claude Code——我开始盯。", "ok", g);
    await saySys("Claude Code 收到 PRD，开工。Lab Agent 在旁边，全程跟着。", g);
    const roll: string[] = t ? t.roll : GENERIC_ROLL;
    const rollLn: CodeLn[] = roll.map((x) => {
      if (x.startsWith(">")) return { tone: "cmd", text: x };
      if (x.includes("顺手") || x.includes("先记着")) return { tone: "warn", text: x };
      return { tone: "ok", text: x };
    });
    await pushCode(rollLn, 430, g);
    if (genRef.current !== g) return;

    /* 第四幕 · 交差 + 逐句翻译 */
    setStep(3);
    await pushCode(
      [
        { tone: "dim", text: "→ git commit -m \"feat: 模块一交付\"" },
        { tone: "cmd", text: "→ 向开发者汇报完成情况" },
      ],
      720,
      g,
    );
    if (genRef.current !== g) return;
    await saySys("coder 交差了。它的原始汇报长这样——技术话术，你看得懂几句？", g);
    await sayLab(t ? t.techReport : GENERIC_REPORT, "lab", g);
    await sleep(650);
    await saySys("Lab Agent 开始逐句翻译，并对照 PRD 验收。", g);
    for (const pair of t ? t.translate : GENERIC_TRANS) {
      if (genRef.current !== g) return;
      await sayTrans(pair);
    }

    /* 第五幕 · 决策点 */
    if (genRef.current !== g) return;
    setStep(4);
    const rogueNote = t
      ? t.rogue.note
      : "验收发现一处偏离：它给自己加了个「从没提过的附加功能」。你的原始描述里没有它。";
    const rogueLabel = t ? t.rogue.label : "附加功能";
    await sayLab(rogueNote, "warn", g);
    setRogueUI({ note: rogueNote, asked: false });
    setUi("rogue");
    const c1 = await waitChoice();
    if (genRef.current !== g) return;

    if (c1 === "ask") {
      setUi("idle");
      await saySys("你问了 Lab Agent：为什么不该加？", g);
      const vres = await api("verdict", { idea: theIdea, rogueLabel });
      const vText =
        vres?.reply ??
        (t
          ? t.verdictFallback
          : "因为它不在你原本的意图里。想要的时候，写进 PRD 再让它做——顺序不能反。");
      verdictRef.current = vText;
      await sayLab(vText, "warn", g);
      await sleep(500);
      await saySys("你被说服了。回到刚才的抉择——", g);
      setRogueUI({ note: rogueNote, asked: true });
      setUi("rogue");
      const c2 = await waitChoice();
      if (genRef.current !== g) return;
      await resolveRogue(c2, g, t, rogueLabel, theIdea);
      return;
    }
    await resolveRogue(c1, g, t, rogueLabel, theIdea);
  }

  async function resolveRogue(c: string, g: number, t: ScriptTask | null, rogueLabel: string, theIdea: string) {
    if (c === "accept") {
      setUi("idle");
      await saySys("你选了：算了，让它留着。", g);
      await sayLab(
        "留着可以——但它不是你要的，是它想加的。范围每松一次，产品就离你真正想要的样子远一步。",
        "warn",
        g,
      );
      if (genRef.current !== g) return;
      setStep(5);
      setCodeBusy(false);
      setUi("idle");
      setScene("end");
      return;
    }
    /* reject */
    setUi("idle");
    await saySys("你选了：按我说的来，删掉。", g);
    await sayLab("打回。", "warn", g);
    const fbVerdict = t
      ? t.verdictFallback
      : `已打回 Claude Code：移除「${rogueLabel}」。理由：它不在你原本的意图里——PRD 没写的，不许加。`;
    let vText: string | null = verdictRef.current;
    if (!vText) {
      const vres = await api("verdict", { idea: theIdea, rogueLabel });
      vText = String(vres?.reply ?? "") || fbVerdict;
      verdictRef.current = vText;
    }
    await sayLab(vText, "warn", g);
    if (genRef.current !== g) return;
    await pushCode(
      [
        { tone: "warn", text: `- 移除「${rogueLabel}」(按验收打回)` },
        { tone: "ok", text: "✓ 已回滚，与 PRD 对齐" },
      ],
      850,
      g,
    );
    if (genRef.current !== g) return;
    await saySys("重新验收……", g);
    await sayLab("验收通过 ✓ 这次交付，和你说的完全一致。", "ok", g);
    if (genRef.current !== g) return;
    setStep(5);
    setCodeBusy(false);
    setUi("idle");
    setScene("end");
    await saySys(ENDING.line, g);
  }

  /* ---------- 交互回调 ---------- */
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

  /* ---------- 渲染 ---------- */
  const stepName = STEPS[Math.min(step, STEPS.length - 1)];
  const codeTag = scene === "intro" ? "演出中" : codeBusy ? "工作中" : scene === "end" ? "交付" : "待命";

  return (
    <div className={styles.stage}>
      <div className={styles.topbar}>
        <div className={styles.dotrow}>
          <span className={styles.dot} style={{ background: "#ff5f57" }} />
          <span className={styles.dot} style={{ background: "#febc2e" }} />
          <span className={styles.dot} style={{ background: "#28c840" }} />
        </div>
        <div className={styles.topbarTitle}>vibe-lab · 开发演示舞台 · 一个循环</div>
        <div className={styles.paneTag}>{scene === "end" ? "演示完成" : scene === "intro" ? "序章" : stepName}</div>
      </div>

      <div className={styles.steps}>
        {STEPS.map((s, i) => (
          <span key={s} className={styles.step + (i <= step ? " " + styles.stepOn : "")} />
        ))}
      </div>

      <div className={styles.panes}>
        {/* 开发者 · 你 */}
        <section className={styles.pane + " " + styles.youPane}>
          <div className={styles.paneHead}>
            <span>开发者 · 你</span>
            <span className={styles.paneSub}>YOU</span>
          </div>
          <div className={styles.youFlow}>
            {ui === "pick" && (
              <>
                <div className={styles.statusNote}>选一个任务开演——或者写下你自己的。</div>
                <div className={styles.taskList}>
                  {TASKS.map((t) => (
                    <button key={t.id} className={styles.taskCard} onClick={() => onPick(t.id)}>
                      <div className={styles.taskTitle}>{t.title}</div>
                      <div className={styles.taskHint}>{t.idea.slice(0, 24)}…</div>
                    </button>
                  ))}
                </div>
                <div className={styles.orNote}>──── 或写你自己的 ────</div>
                <div className={styles.customBox}>
                  <input
                    className={styles.youInput}
                    placeholder="比如：做一个给爸妈的用药提醒…"
                    value={customDraft}
                    onChange={(e) => setCustomDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onCustomStart()}
                  />
                  <button className={styles.actBtn} disabled={!customDraft.trim()} onClick={onCustomStart}>
                    开演
                  </button>
                </div>
              </>
            )}

            {ui === "ask" && askUI && (
              <>
                <div className={styles.youBubble}>
                  <b>Lab Agent 追问：{askUI.q}</b>
                  <div className={styles.qLabel}>点一个答复，或自己输入一句</div>
                </div>
                <div className={styles.chipRow}>
                  {askUI.options.map((o) => (
                    <button key={o} className={styles.chip} onClick={() => pick(o)}>
                      {o}
                    </button>
                  ))}
                </div>
                <div className={styles.customBox}>
                  <input id="agent-ask-input" className={styles.youInput} placeholder="自己答一句…" onKeyDown={(e) => e.key === "Enter" && onAskType()} />
                  <button className={styles.actBtn} onClick={onAskType}>
                    答
                  </button>
                </div>
              </>
            )}

            {ui === "rogue" && rogueUI && (
              <>
                <div className={styles.statusNote}>{rogueUI.note}</div>
                <div className={styles.chipRow}>
                  <button className={styles.chip} onClick={() => pick("accept")}>
                    算了，让它加上也行
                  </button>
                  <button className={styles.chip} onClick={() => pick("reject")}>
                    删掉，按我说的来
                  </button>
                  {!rogueUI.asked && (
                    <button className={styles.chip} onClick={() => pick("ask")}>
                      为什么不能加？让它说说
                    </button>
                  )}
                </div>
              </>
            )}

            {answers.map((p, i) => (
              <div key={i} className={styles.youBubble}>
                <span className={styles.qLabel}>Q{i + 1} · {p.q}</span>
                <br />
                <b>你：{p.a}</b>
              </div>
            ))}

            {ui === "idle" && scene === "play" && !askUI && !rogueUI && answers.length === 0 && (
              <div className={styles.statusNote}>正在上演——请看 Claude Code 与 Lab Agent 两侧。</div>
            )}
          </div>
        </section>

        {/* Claude Code 终端 */}
        <section className={styles.pane + " " + styles.codePane}>
          <div className={styles.paneHead}>
            <span>Claude Code · 执行</span>
            <span className={styles.paneTag}>{codeTag}</span>
          </div>
          <div className={styles.codeScroll}>
            {code.map((ln, i) => (
              <div key={i} className={styles.codeLine + " " + styles[CODE_TONE[ln.tone]]}>
                {ln.text}
              </div>
            ))}
            {(scene === "intro" || codeBusy) && <span className={styles.cursor} />}
          </div>
        </section>

        {/* Lab Agent 监工 */}
        <section className={styles.pane + " " + styles.labPane}>
          <div className={styles.paneHead}>
            <span>Lab Agent · 监工</span>
            <span className={styles.paneTag}>{scene === "end" ? "收工" : "跟随中"}</span>
          </div>
          <div className={styles.labScroll}>
            {labMsgs.map((m, i) =>
              m.kind === "trans" ? (
                <div key={i} className={styles.labBubble + " " + styles.ok}>
                  <b>“{m.pair.t}”</b>
                  <br />
                  意思是 —— {m.pair.p}
                </div>
              ) : (
                <div key={i} className={styles.labBubble + (m.tone === "ok" ? " " + styles.ok : m.tone === "warn" ? " " + styles.warn : "")}>
                  {m.text}
                </div>
              ),
            )}
            {prd && (
              <div className={styles.labBubble}>
                <b>PRD · {prd.title}</b>
                <br />
                {prd.summary}
                {prd.sections.map((s, j) => (
                  <div key={j}>
                    <br />
                    <b>{s.h}</b>
                    <br />
                    {s.items.map((it, k) => (
                      <span key={k}>
                        · {it}
                        <br />
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {(ui === "ask" || (scene === "play" && codeBusy)) && <span className={styles.typing} />}
          </div>
        </section>
      </div>

      {scene === "end" ? (
        <div className={styles.endCard}>
          <h3 className={styles.endTitle}>一个开发循环，走完了</h3>
          <p className={styles.endBody}>{ENDING.body}</p>
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
      ) : (
        <div className={styles.sysBar}>
          {sys || (scene === "intro" ? "序章：先看没有监工会发生什么……" : "就绪")}
          {scene === "intro" && (
            <button className={styles.ghostBtn} style={{ float: "right", marginTop: -6 }} onClick={skipIntro}>
              跳过序章 →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

