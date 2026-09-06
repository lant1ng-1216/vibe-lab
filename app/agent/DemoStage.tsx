"use client";

/* /agent 交互式演示 · 画布形态
 * 暗色画布 + 点阵 + 两个真终端节点(Lab Agent / Coding Agent) + 贝塞尔连线
 * 节点可拖、画布可平移可缩放、coding agent engine 可切换、两种场景可演
 * LLM 真调 DeepSeek(失败回落 script.ts 剧本) */

import { useEffect, useRef, useState } from "react";
import styles from "./agent.module.css";
import {
  CUSTOM_FALLBACK_ASK,
  ENDING,
  TASKS,
  customPrd,
  type PrdCard,
  type ScriptTask,
} from "./script";

const STEPS = ["对齐意图", "产出 PRD", "派活执行", "翻译汇报", "验收抉择", "交付"];

type Role = "you" | "lab" | "code" | "sys" | "warn" | "ok";
type LabLine = { role: Role; text: string };

type CodingEngine = "claude-code" | "codex" | "cursor" | "opencode";
const ENGINES: { id: CodingEngine; label: string }[] = [
  { id: "claude-code", label: "Claude Code" },
  { id: "codex", label: "Codex" },
  { id: "cursor", label: "Cursor" },
  { id: "opencode", label: "OpenCode" },
];

type Display =
  | { kind: "idle" }
  | { kind: "ask"; round: number; q?: string; options?: string[] }
  | { kind: "prd"; status: "producing" | "ready"; card?: PrdCard }
  | { kind: "run" }
  | { kind: "rogue"; note: string; label: string; asked: boolean; rejectVerdict?: string }
  | { kind: "end"; accepted: boolean };

type Scenario = "first" | "follow";

const LINES_MAX = 14;

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

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.max(90, Math.abs(x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

const GENERIC_REPORT =
  "核心功能完成。顺手加了点优化和一个新入口。代码结构保持整洁，测试通过。";
const GENERIC_TRANS: { t: string; p: string }[] = [
  { t: "核心功能完成，测试通过", p: "你要的那个东西，确实做出来了" },
  { t: "顺手加了点优化 + 一个新入口", p: "这是它自作主张——你从没提过" },
];

export default function DemoStage() {
  const [scene, setScene] = useState<"intro" | "play" | "end">("intro");
  const [scenario, setScenario] = useState<Scenario>("first");
  const [step, setStep] = useState(0);
  const [sys, setSys] = useState("");
  const [display, setDisplay] = useState<Display>({ kind: "idle" });
  const [labLines, setLabLines] = useState<LabLine[]>([]);
  const [codeLines, setCodeLines] = useState<LabLine[]>([]);
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);
  const [engine, setEngine] = useState<CodingEngine>("claude-code");
  const [activeEdge, setActiveEdge] = useState<"labToCode" | "codeToLab" | null>(null);
  const [canvas, setCanvas] = useState({ x: 0, y: 0 });
  const [labPos, setLabPos] = useState({ x: 80, y: 130 });
  const [coderPos, setCoderPos] = useState({ x: 520, y: 280 });
  const [customDraft, setCustomDraft] = useState("");

  const waitRef = useRef<((v: string) => void) | null>(null);
  const introRef = useRef(false);
  const lastRun = useRef<{ scenario: Scenario; id: string | null; text: string }>({
    scenario: "first",
    id: null,
    text: "",
  });
  const verdictRef = useRef<string | null>(null);
  const genRef = useRef(0);

  const dragRef = useRef<
    | { kind: "canvas"; sx: number; sy: number; cx: number; cy: number }
    | { kind: "node"; who: "lab" | "coder"; sx: number; sy: number; nx: number; ny: number }
    | null
  >(null);

  const gen = () => ++genRef.current;

  const saySys = async (text: string, g: number) => {
    setSys("");
    for (let i = 0; i <= text.length; i += 3) {
      if (genRef.current !== g) return;
      setSys(text.slice(0, i));
      await sleep(14);
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

  /* 序章 */
  useEffect(() => {
    if (introRef.current) return;
    introRef.current = true;
    void (async () => {
      const g = gen();
      setScene("intro");
      setLabLines([
        { role: "sys", text: "● Lab Agent · ready" },
        { role: "lab", text: "你好,我是 Lab Agent —" },
        { role: "lab", text: "Vibe Coding 时代的监工,不写代码,盯 coder 与你的意图对齐。" },
      ]);
      setCodeLines([
        { role: "sys", text: `● Coding Agent · ${ENGINES.find((e) => e.id === engine)?.label} · idle` },
      ]);
      await sleep(1200);
      setLabLines((cur) => [...cur, { role: "lab", text: "把想法告诉我,或者挑一个示例开演 ↓" }]);
      setScene("play");
      setDisplay({ kind: "idle" });
    })();
  }, []);

  /* 画布平移 / 节点拖动(固定不缩放) */
  function onCanvasPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (
      target.closest(`.${styles.node}`) ||
      target.closest(`.${styles.toolDock}`) ||
      target.closest(`.${styles.scenesDock}`) ||
      target.closest(`.${styles.inputBar}`)
    ) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { kind: "canvas", sx: e.clientX, sy: e.clientY, cx: canvas.x, cy: canvas.y };
  }
  function onCanvasPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    if (d.kind === "canvas") {
      setCanvas((c) => ({ ...c, x: d.cx + (e.clientX - d.sx), y: d.cy + (e.clientY - d.sy) }));
    } else if (d.kind === "node") {
      const dx = e.clientX - d.sx;
      const dy = e.clientY - d.sy;
      if (d.who === "lab") setLabPos({ x: d.nx + dx, y: d.ny + dy });
      else setCoderPos({ x: d.nx + dx, y: d.ny + dy });
    }
  }
  function onCanvasPointerUp() {
    dragRef.current = null;
  }
  function resetView() {
    setCanvas({ x: 0, y: 0 });
    setLabPos({ x: 80, y: 130 });
    setCoderPos({ x: 520, y: 280 });
  }

  function onNodePointerDown(who: "lab" | "coder", e: React.PointerEvent) {
    if (e.button !== 0) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const pos = who === "lab" ? labPos : coderPos;
    dragRef.current = { kind: "node", who, sx: e.clientX, sy: e.clientY, nx: pos.x, ny: pos.y };
  }

  /* —— 场景一:先聊再做 —— */
  async function startFirst(id: string | null, customText: string) {
    const g = gen();
    const t = id ? TASKS.find((x) => x.id === id) ?? null : null;
    const theIdea = t ? t.idea : customText.trim();
    if (!theIdea) return;
    lastRun.current = { scenario: "first", id, text: customText };
    verdictRef.current = null;

    setScene("play");
    setStep(0);
    setLabLines([{ role: "sys", text: "● Lab Agent · idle" }]);
    setCodeLines([{ role: "sys", text: `● Coding Agent · ${ENGINES.find((e) => e.id === engine)?.label} · idle` }]);
    setAnswers([]);
    setActiveEdge(null);
    setDisplay({ kind: "ask", round: 0 });
    await sleep(300);

    setLabLines((cur) => [...cur, { role: "lab", text: "动手前先把'你要的'问清楚。" }]);
    setCodeLines((cur) => [...cur, { role: "sys", text: "· 等待指令中" }]);
    const past: { q: string; a: string }[] = [];
    for (let r = 0; r < 3; r++) {
      if (genRef.current !== g) return;
      setStep(0);
      const ures = await api("ask", { idea: theIdea, past, round: r });
      const fb = t ? t.fallbackAsk[r] : CUSTOM_FALLBACK_ASK[r];
      const q = ures?.question ? String(ures.question) : fb.q;
      const options =
        Array.isArray(ures?.options) && (ures.options as string[]).length === 3
          ? (ures.options as string[])
          : fb.options;
      setDisplay({ kind: "ask", round: r, q, options });
      setLabLines((cur) => [...cur, { role: "lab", text: "Q" + (r + 1) + " " + q }]);
      const a = await waitChoice();
      if (genRef.current !== g) return;
      past.push({ q, a });
      setAnswers([...past]);
      setLabLines((cur) => [...cur, { role: "you", text: "→ " + a }]);
      await sleep(300);
    }

    if (genRef.current !== g) return;
    setStep(1);
    setDisplay({ kind: "prd", status: "producing" });
    setLabLines((cur) => [...cur, { role: "lab", text: "我把刚才的整理成一页 PRD。" }]);
    const pres = await api("prd", { idea: theIdea, answers: past });
    const prdCard: PrdCard = pres?.prd ?? (t ? t.prd : customPrd(theIdea));
    if (genRef.current !== g) return;
    setDisplay({ kind: "prd", status: "ready", card: prdCard });
    setLabLines((cur) => [
      ...cur,
      { role: "sys", text: "──── PRD v1 ────" },
      { role: "lab", text: prdCard.title },
      { role: "lab", text: prdCard.summary },
      { role: "lab", text: "· " + prdCard.sections.map((s) => s.h).join(" · ") },
    ]);
    await sleep(500);

    setDisplay({ kind: "prd", status: "ready", card: prdCard });
    const ok = await waitChoice();
    if (genRef.current !== g) return;
    if (ok !== "confirm") {
      setLabLines((cur) => [...cur, { role: "sys", text: "· PRD 未确认,演示中止" }]);
      return;
    }

    if (genRef.current !== g) return;
    setStep(2);
    setActiveEdge("labToCode");
    setDisplay({ kind: "run" });
    setLabLines((cur) => [...cur, { role: "lab", text: "→ 把 PRD 发给 Coding Agent,开始盯" }]);
    await sleep(800);
    setActiveEdge(null);
    setCodeLines((cur) => [
      ...cur,
      { role: "sys", text: "← 收到 PRD" },
      { role: "code", text: "$ 收到 PRD,开始实现…" },
      { role: "code", text: "✓ 核心流程跑通" },
      { role: "code", text: "→ 顺手加了个「分享浮层」" },
      { role: "code", text: "✓ 提交 diff" },
      { role: "code", text: "→ 向你汇报完成情况" },
    ]);
    await sleep(900);

    if (genRef.current !== g) return;
    setStep(3);
    setActiveEdge("codeToLab");
    setCodeLines((cur) => [
      ...cur,
      { role: "sys", text: "──── 汇报 ────" },
      { role: "code", text: t ? t.techReport : GENERIC_REPORT },
    ]);
    await sleep(700);
    setActiveEdge(null);
    const trans = t ? t.translate : GENERIC_TRANS;
    for (const pair of trans) {
      if (genRef.current !== g) return;
      setLabLines((cur) => [
        ...cur,
        { role: "warn", text: "▷ 它说「" + pair.t + "」" },
        { role: "lab", text: "→ " + pair.p },
      ]);
      await sleep(650);
    }

    if (genRef.current !== g) return;
    setStep(4);
    const rogueNote = t ? t.rogue.note : "验收发现一处偏离:它给自己加了个「分享浮层」,你的原始描述里没有。";
    const rogueLabel = t ? t.rogue.label : "分享浮层";
    setLabLines((cur) => [...cur, { role: "warn", text: "⚠ 验收:发现 1 处偏离 —「" + rogueLabel + "」" }]);
    setDisplay({ kind: "rogue", note: rogueNote, label: rogueLabel, asked: false });
    const c1 = await waitChoice();
    if (genRef.current !== g) return;

    if (c1 === "ask") {
      setLabLines((cur) => [...cur, { role: "you", text: "→ 为什么不能加?" }]);
      const vres = await api("verdict", { idea: theIdea, rogueLabel });
      const vText = vres?.reply ?? (t ? t.verdictFallback : "因为它不在你原本的意图里。");
      verdictRef.current = vText;
      setLabLines((cur) => [...cur, { role: "lab", text: "→ " + vText }]);
      setDisplay({ kind: "rogue", note: rogueNote, label: rogueLabel, asked: true, rejectVerdict: vText });
      await sleep(400);
      const c2 = await waitChoice();
      if (genRef.current !== g) return;
      await resolveRogue(c2, g, t, rogueLabel, theIdea);
      return;
    }
    await resolveRogue(c1, g, t, rogueLabel, theIdea);
  }

  async function resolveRogue(c: string, g: number, t: ScriptTask | null, rogueLabel: string, theIdea: string) {
    const fbV = t ? t.verdictFallback : "PRD 没写的,不许加。";
    if (c === "accept") {
      setLabLines((cur) => [
        ...cur,
        { role: "you", text: "→ 算了,让它留着" },
        { role: "warn", text: "· 已接受偏离,下次我在它加戏前先拦" },
      ]);
      setStep(5);
      setScene("end");
      setDisplay({ kind: "end", accepted: true });
      return;
    }
    setLabLines((cur) => [...cur, { role: "you", text: "→ 删掉,按我说的来" }]);
    setActiveEdge("labToCode");
    const vText = verdictRef.current ?? fbV;
    setDisplay({ kind: "rogue", note: rogueNoteFallback(t, rogueLabel), label: rogueLabel, asked: true, rejectVerdict: vText });
    await sleep(500);
    setLabLines((cur) => [...cur, { role: "lab", text: "→ 打回:" + vText }]);
    setCodeLines((cur) => [
      ...cur,
      { role: "warn", text: "↩ 收到打回:移除「" + rogueLabel + "」" },
      { role: "ok", text: "✓ 已回滚,与 PRD 对齐" },
    ]);
    setActiveEdge(null);
    await sleep(700);
    setLabLines((cur) => [...cur, { role: "ok", text: "✓ 验收通过 — 这次交付,和你说的一致" }]);
    setStep(5);
    setScene("end");
    setDisplay({ kind: "end", accepted: false });
    await sleep(400);
    setSys(ENDING.line);
  }

  /* —— 场景二:边做边盯 —— */
  async function startFollow() {
    const g = gen();
    lastRun.current = { scenario: "follow", id: null, text: "" };
    setScene("play");
    setStep(2);
    setLabLines([
      { role: "sys", text: "● Lab Agent · 跟随中" },
      { role: "lab", text: "Coding Agent 已在干活,我在旁边记录。" },
    ]);
    setCodeLines([
      { role: "sys", text: `● Coding Agent · ${ENGINES.find((e) => e.id === engine)?.label} · working` },
      { role: "code", text: "$ 实现 auth 模块…" },
      { role: "code", text: "✓ token refresh 通过" },
      { role: "code", text: "→ 加了个 i18n 支持" },
      { role: "warn", text: "⚠ 偏离:「i18n」不在你原始 PRD 里" },
    ]);
    setDisplay({ kind: "run" });
    await sleep(900);
    setDisplay({
      kind: "rogue",
      note: "Coding Agent 在写 auth。你有个疑问:该不该顺便加 i18n?(为了避免直接和 coder 讨论污染它的上下文,先和我对齐。)",
      label: "i18n",
      asked: false,
    });
    const ask = await waitChoice();
    if (genRef.current !== g) return;
    if (ask === "discuss") {
      setLabLines((cur) => [...cur, { role: "you", text: "→ 我拿不准 i18n 加不加,你觉得呢?" }]);
      await sleep(400);
      setLabLines((cur) => [
        ...cur,
        { role: "lab", text: "→ 我建议:第一版先别加。" },
        { role: "lab", text: "→ 你的原始意图是'第一版把 auth 跑通';i18n 会让第一版膨胀一倍。" },
        { role: "lab", text: "→ 想清楚了再告诉我,我打回给 coder。" },
      ]);
      setDisplay({ kind: "rogue", note: "现在你决定:打回 coder 让它回滚 i18n,还是接受?", label: "i18n", asked: true });
      const c2 = await waitChoice();
      if (genRef.current !== g) return;
      if (c2 === "reject") {
        setLabLines((cur) => [...cur, { role: "you", text: "→ 打回" }]);
        setCodeLines((cur) => [
          ...cur,
          { role: "warn", text: "↩ 收到打回:回滚 i18n" },
          { role: "ok", text: "✓ 已回滚" },
        ]);
        setLabLines((cur) => [...cur, { role: "ok", text: "✓ auth 模块通过,与你对齐" }]);
      } else if (c2 === "accept") {
        setLabLines((cur) => [...cur, { role: "you", text: "→ 留着" }]);
        setLabLines((cur) => [...cur, { role: "warn", text: "· 已接受,但 i18n 会让第一版膨胀" }]);
      }
    }
    setStep(5);
    setScene("end");
    setDisplay({ kind: "end", accepted: false });
    await sleep(300);
    setSys("整轮你只跟我聊了一次,coder 没被打断 — 这就是'隔离上下文'。");
  }

  function rogueNoteFallback(t: ScriptTask | null, rogueLabel: string) {
    return t ? t.rogue.note : "验收发现一处偏离:它给自己加了个「" + rogueLabel + "」。";
  }

  function replay() {
    const last = lastRun.current;
    if (last.scenario === "follow") void startFollow();
    else void startFirst(last.id, last.text);
  }

  const labStatus = (() => {
    if (scene === "intro") return "ready";
    switch (display.kind) {
      case "ask":
        return "working";
      case "prd":
        return "working";
      case "run":
        return "working";
      case "rogue":
        return "warn";
      case "end":
        return display.accepted ? "warn" : "done";
      default:
        return "idle";
    }
  })();

  const coderStatus = (() => {
    if (scene === "intro") return "idle";
    if (display.kind === "ask") return "idle";
    if (display.kind === "prd") return "idle";
    if (display.kind === "run") return "working";
    if (display.kind === "rogue") return "working";
    if (display.kind === "end") return "done";
    return "idle";
  })();

  const NODE_W = 320;
  const labOutX = labPos.x + NODE_W;
  const labOutY = labPos.y + 130;
  const coderInX = coderPos.x;
  const coderInY = coderPos.y + 130;
  const coderInY2 = coderInY + 28;

  return (
    <div
      className={styles.stage + " " + styles.noSelect}
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp}
      onPointerLeave={onCanvasPointerUp}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${canvas.x}px, ${canvas.y}px)`,
        }}
      >
        <svg className={styles.edgeLayer} style={{ width: "100%", height: "100%" }}>
          <defs>
            <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          <path
            d={bezier(labOutX, labOutY, coderInX, coderInY)}
            className={styles.edge + " " + (activeEdge === "labToCode" ? styles.edgeActive + " " + styles.edgeDash : "")}
            markerEnd={activeEdge === "labToCode" ? "url(#ah)" : undefined}
          />
          <path
            d={bezier(coderInX, coderInY2, labOutX, labOutY + 28)}
            className={styles.edge + " " + (activeEdge === "codeToLab" ? styles.edgeActive + " " + styles.edgeDash : "")}
            markerEnd={activeEdge === "codeToLab" ? "url(#ah)" : undefined}
          />
        </svg>

        <div
          className={styles.node + " " + (labStatus === "working" || labStatus === "warn" ? styles.nodeActive : "")}
          style={{ left: labPos.x, top: labPos.y }}
        >
          <div className={styles.nodeHeader} onPointerDown={(e) => onNodePointerDown("lab", e)}>
            <span className={`${styles.nodeDot} ${styles.nodeDotLab}`} />
            <span className={styles.nodeName}>Lab Agent</span>
            <span className={styles.nodeSub}>· 监工 · 不写代码</span>
            <span
              className={
                styles.nodeStatus +
                " " +
                (labStatus === "working"
                  ? styles.statusWorking
                  : labStatus === "warn"
                    ? styles.statusWarn
                    : labStatus === "done"
                      ? styles.statusDone
                      : styles.statusIdle)
              }
            >
              <span className={styles.statusPulse} />
              {labStatus === "working" ? "working" : labStatus === "warn" ? "alert" : labStatus === "done" ? "done" : labStatus === "ready" ? "ready" : "idle"}
            </span>
          </div>
          <div className={styles.nodeBody}>
            {labLines.map((l, i) => (
              <div key={i} className={styles[roleClass(l.role)]}>{l.text}</div>
            ))}
            {labStatus === "working" && <span className={styles.cursor} />}
          </div>
          <div className={`${styles.handle} ${styles.handleOut}`} />
        </div>

        <div
          className={styles.node + " " + (coderStatus === "working" ? styles.nodeActive : "")}
          style={{ left: coderPos.x, top: coderPos.y }}
        >
          <div className={styles.nodeHeader} onPointerDown={(e) => onNodePointerDown("coder", e)}>
            <span className={`${styles.nodeDot} ${styles.nodeDotCoder}`} />
            <span className={styles.nodeName}>Coding Agent</span>
            <span className={styles.nodeSub}>· {ENGINES.find((e) => e.id === engine)?.label}</span>
            <span
              className={
                styles.nodeStatus +
                " " +
                (coderStatus === "working"
                  ? styles.statusWorking
                  : coderStatus === "done"
                    ? styles.statusDone
                    : styles.statusIdle)
              }
            >
              <span className={styles.statusPulse} />
              {coderStatus === "working" ? "working" : coderStatus === "done" ? "done" : "idle"}
            </span>
          </div>
          <div className={styles.engineRow}>
            {ENGINES.map((e) => (
              <button
                key={e.id}
                className={styles.engineChip + " " + (engine === e.id ? styles.engineChipOn : "")}
                onClick={() => setEngine(e.id)}
              >
                {e.label}
              </button>
            ))}
          </div>
          <div className={styles.nodeBody}>
            {codeLines.map((l, i) => (
              <div key={i} className={styles[roleClass(l.role)]}>{l.text}</div>
            ))}
            {coderStatus === "working" && scene !== "intro" && <span className={styles.cursor} />}
          </div>
          <div className={`${styles.handle} ${styles.handleIn}`} />
        </div>
      </div>

      <div className={styles.topbar}>
        <div className={styles.topbarTitle}>
          <strong>Lab Agent</strong>
          <span style={{ color: "#55534e" }}>·</span>
          <span>与 Coding Agent 在画布上</span>
        </div>
        <div className={styles.topbarRight}>
          <div className={styles.steps}>
            {STEPS.map((_, i) => (
              <span key={i} className={styles.step + " " + (i <= step ? styles.stepOn : "")} />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.scenesDock}>
        <button
          className={styles.sceneChip + " " + (scenario === "first" ? styles.sceneChipOn : "")}
          onClick={() => setScenario("first")}
        >
          ① 先聊再做
        </button>
        <button
          className={styles.sceneChip + " " + (scenario === "follow" ? styles.sceneChipOn : "")}
          onClick={() => setScenario("follow")}
        >
          ② 边做边盯
        </button>
      </div>

      <div className={styles.toolDock}>
        <button className={styles.dockBtn} title="重置视图(节点归位)" onClick={resetView}>⊙</button>
      </div>

      {sys && scene !== "intro" && (
        <div className={styles.sysToast}>{sys}</div>
      )}

      {display.kind === "idle" && scene !== "intro" && answers.length === 0 && labLines.length < 5 && (
        <div className={styles.emptyStage}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyTitle}>画布已就位 · 两个终端等待对话</div>
            <div className={styles.emptyDesc}>
              在底部输入你的想法 — Lab Agent 会先和你聊,直到产出 PRD、确认后驱动右侧的 Coding Agent;
              <br />
              也可以切到「边做边盯」,看 Coding Agent 已经在干活时,Lab Agent 怎么跟进。
            </div>
            <button
              className={styles.emptyStart}
              onClick={() => {
                if (scenario === "first") void startFirst(null, customDraft);
                else void startFollow();
              }}
              disabled={scenario === "first" && !customDraft.trim()}
            >
              开演 →
            </button>
            {scenario === "first" && (
              <div className={styles.emptyHint}>或先在下面写你的想法 → 再点开演</div>
            )}
          </div>
        </div>
      )}

      <div className={styles.inputBar}>
        {display.kind === "ask" && display.options && (
          <>
            <div className={styles.inputLabel}>Lab Agent 追问 · Q{display.round + 1}/3</div>
            <div className={styles.chipRow}>
              {display.options.map((o) => (
                <button key={o} className={styles.chip} onClick={() => pick(o)}>{o}</button>
              ))}
            </div>
          </>
        )}
        {display.kind === "prd" && display.status === "ready" && (
          <>
            <div className={styles.inputLabel}>PRD 已出 · 审阅后可让 Coding Agent 开工</div>
            <div className={styles.chipRow}>
              <button className={styles.chip} style={{ background: "rgba(83,74,183,0.2)", borderColor: "#534ab7", color: "#ece6ff" }} onClick={() => pick("confirm")}>✓ 确认,发给 Coding Agent</button>
              <button className={styles.chip} onClick={() => pick("abort")}>再调调</button>
            </div>
          </>
        )}
        {display.kind === "rogue" && !display.asked && (
          <>
            <div className={styles.inputLabel}>Lab Agent 发现偏离 · 你的处置?</div>
            <div className={styles.chipRow}>
              <button className={styles.chip} onClick={() => pick("accept")}>算了,让它留着</button>
              <button className={styles.chip} style={{ background: "rgba(216,90,48,0.2)", borderColor: "#d85a30", color: "#f0b9a5" }} onClick={() => pick("reject")}>删掉,按 PRD</button>
              <button className={styles.chip} onClick={() => pick("ask")}>先问问为什么不能加</button>
            </div>
          </>
        )}
        {display.kind === "rogue" && display.asked && (
          <>
            <div className={styles.inputLabel}>Lab Agent 已给理由 · 回到抉择</div>
            <div className={styles.chipRow}>
              <button className={styles.chip} onClick={() => pick("accept")}>算了,留着</button>
              <button className={styles.chip} style={{ background: "rgba(216,90,48,0.2)", borderColor: "#d85a30", color: "#f0b9a5" }} onClick={() => pick("reject")}>打回给 coder</button>
            </div>
          </>
        )}
        {scenario === "follow" && display.kind === "run" && (
          <>
            <div className={styles.inputLabel}>Coding Agent 在写 · 你有疑问?</div>
            <div className={styles.chipRow}>
              <button className={styles.chip} onClick={() => pick("discuss")}>和 Lab Agent 讨论一下</button>
            </div>
          </>
        )}
        {display.kind === "end" && (
          <div className={styles.chipRow}>
            <button className={styles.chip} onClick={replay}>再演一次</button>
          </div>
        )}

        {display.kind === "idle" && (
          <>
            <div className={styles.inputLabel}>你想做什么?(发给 Lab Agent)</div>
            <div className={styles.inputRow}>
              <input
                className={styles.inputField}
                placeholder="比如:做一个给爸妈的用药提醒 App…"
                value={customDraft}
                onChange={(e) => setCustomDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && customDraft.trim() && pick("go")}
              />
              <button className={styles.sendBtn} disabled={!customDraft.trim()} onClick={() => pick("go")}>
                开演
              </button>
            </div>
            <div className={styles.chipRow}>
              {TASKS.slice(0, 3).map((t) => (
                <button key={t.id} className={styles.chip} onClick={() => setCustomDraft(t.idea)}>
                  {t.title}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function roleClass(r: Role) {
  switch (r) {
    case "you":
      return styles.lineYou;
    case "lab":
      return styles.lineLab;
    case "code":
      return styles.lineCode;
    case "warn":
      return styles.lineWarn;
    case "ok":
      return styles.lineOk;
    case "sys":
    default:
      return styles.lineSystem;
  }
}