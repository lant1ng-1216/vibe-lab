"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import BuiCodeBlock from "./bui/BuiCodeBlock";
import PixelLoader from "./bui/PixelLoader";
import ThinkingTrace from "./bui/ThinkingTrace";

type Msg = { role: "user" | "assistant"; content: string };
type Phase = "idle" | "connect" | "stream" | "done";

const WELCOME =
  "你好，我是 **Lab Agent**。\n\n工具怎么选、Agent 是什么、小白从哪条路开始 —— 问我，我会用大白话给你讲清楚。也可以丢一段需求给我，我帮你拆成能上手的步骤。";

const SUGGESTIONS = [
  "推荐一个做图工具",
  "Agent 是什么？",
  "AI 小白先学什么？",
  "想做个产品，从哪开始？",
];

const CAPABILITIES = ["Agent 助手", "Vibe Coding", "Skill 封装", "工具选型", "学习路径"];

/* ---------- markdown 代码块 → Beautiful UI CodeBlock（原版移植） ---------- */
function MdCode(props: any) {
  const { inline, className, children } = props;
  if (inline) return <code className="vmd-code-inline">{children}</code>;
  const lang = /language-(\w+)/.exec(className || "")?.[1] || "txt";
  const raw = String(children ?? "").replace(/\n$/, "");
  const lines = raw.split("\n");
  return <BuiCodeBlock lines={lines} code={raw} filename={lang === "txt" ? "code" : `${lang}`} />;
}

/** Lab Agent —— 主流 AI Chat 桌面架构 + Beautiful UI 可视化 */
export default function AgentApp() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [doneMs, setDoneMs] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showTrace, setShowTrace] = useState(false); // 首 delta 前展示思考轨迹
  const [traceSettled, setTraceSettled] = useState(false); // 轨迹播完即隐藏等待流
  const listRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const t0Ref = useRef(0);

  // 计时器：connect/stream 期间每 100ms 刷新
  useEffect(() => {
    if (phase !== "connect" && phase !== "stream") return;
    const id = setInterval(() => setElapsed((performance.now() - t0Ref.current) / 1000), 100);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, phase]);

  async function ask(raw?: string) {
    const q = (raw ?? input).trim();
    if (!q || busy) return;
    setErr(null);
    setDoneMs(null);
    const history: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(history);
    setInput("");
    setBusy(true);
    t0Ref.current = performance.now();
    setElapsed(0);
    setPhase("connect");
    setShowTrace(false);
    setTraceSettled(false);
    if (taRef.current) taRef.current.style.height = "auto";

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      /* HTTP 已建立 → 进入流阶段。首 token 到达前展示 BUI ThinkingTrace */
      setPhase("stream");
      setShowTrace(true);
      setTraceSettled(false);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      let gotErr = false;
      let gotDelta = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const frames = buf.split("\n\n");
        buf = frames.pop() || "";
        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          try {
            const ev = JSON.parse(payload);
            if (ev.type === "delta") {
              /* 首个 delta 到达：撤掉思考轨迹，进入内容流 */
              if (!gotDelta) {
                setShowTrace(false);
                setTraceSettled(true);
              }
              gotDelta = true;
              acc += ev.text;
              setMessages((m) => {
                const c = [...m];
                if (c[c.length - 1]?.role === "assistant") {
                  c[c.length - 1] = { role: "assistant", content: acc };
                } else c.push({ role: "assistant", content: acc });
                return c;
              });
            } else if (ev.type === "error") {
              gotErr = true;
              setErr(ev.text || "出错了，稍后再试。");
            }
          } catch {
            /* ignore */
          }
        }
      }
      const ms = Math.round(performance.now() - t0Ref.current);
      setDoneMs(ms);
      setPhase("done");
      setShowTrace(false);
      if (gotErr) setPhase("idle");
      if (!gotErr && !gotDelta) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "（抱歉，我这边没收到模型的回应 —— 换句话再问一次。）" },
        ]);
        setPhase("idle");
      }
    } catch (e) {
      setPhase("idle");
      setErr("连不上助手服务，稍后再试。");
      void e;
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  }
  function autosize() {
    const t = taRef.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 150) + "px";
  }
  function reset() {
    setMessages([{ role: "assistant", content: WELCOME }]);
    setErr(null);
    setPhase("idle");
    setDoneMs(null);
  }

  return (
    <div className="labapp" aria-label="Lab Agent">
      {/* ===== 窗口 chrome ===== */}
      <div className="labapp-chrome">
        <span className="labapp-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="labapp-title mono">LAB AGENT</span>
        <button type="button" className="labapp-new mono" onClick={reset} title="新对话">
          ↻ new
        </button>
      </div>

      <div className="labapp-body">
        {/* ===== 左侧栏 Sidebar Nav ===== */}
        <aside className="labapp-side">
          <div className="labapp-side-head">
            <span className="labapp-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/flasks/green_1.png" alt="" aria-hidden="true" width={26} height={26} />
            </span>
            <span className="labapp-side-name">Lab Agent</span>
          </div>
          <button type="button" className="labapp-newchat" onClick={reset}>
            <span aria-hidden="true">+</span> 新对话
          </button>

          <nav className="labapp-nav" aria-label="会话导航">
            <div className="labapp-side-k mono">能力</div>
            <ul className="labapp-caps">
              {CAPABILITIES.map((c) => (
                <li key={c} className="labapp-cap mono">
                  {c}
                </li>
              ))}
            </ul>

            <div className="labapp-side-k mono">会话 · 本轮</div>
            {messages.filter((m) => m.role === "user").length === 0 ? (
              <div className="labapp-history-empty mono">还没有对话 —— 问点什么吧。</div>
            ) : (
              <ul className="labapp-history">
                {messages
                  .filter((m) => m.role === "user")
                  .slice(-6)
                  .map((m, i) => (
                    <li key={i} className="labapp-history-item mono">
                      {m.content.slice(0, 22)}
                      {m.content.length > 22 ? "…" : ""}
                    </li>
                  ))}
              </ul>
            )}
          </nav>
        </aside>

        {/* ===== 主对话区（内容列窄化居中） ===== */}
        <section className="labapp-main">
          <div className="labapp-scroll" ref={listRef}>
            <div className="lcol">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="lmsg lmsg--user">
                    <div className="lmsg-who mono">YOU</div>
                    <p className="lmsg-user-text">{m.content}</p>
                  </div>
                ) : (
                  <div key={i} className="lmsg lmsg--ai">
                    <div className="lmsg-who mono">
                      <span className="lmsg-who-dot" aria-hidden="true" /> AGENT
                    </div>
                    <div className="vmd">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: MdCode }}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                    {/* 回复完成 usage 行 */}
                    {i === messages.length - 1 && doneMs !== null && (
                      <div className="lusage mono">延迟 {doneMs / 1000}s · 完成</div>
                    )}
                  </div>
                )
              )}

              {/* 连接阶段 —— Beautiful UI Pixel Loader（原版：像素方阵 + shimmer + 计时） */}
              {busy && phase === "connect" && (
                <div className="lmsg lmsg--ai">
                  <div className="lmsg-who mono">
                    <span className="lmsg-who-dot" aria-hidden="true" /> AGENT
                  </div>
                  <PixelLoader label="Connecting" variant="Drive" />
                </div>
              )}

              {/* 流阶段·首 token 前 —— Beautiful UI ThinkingTrace（原版时序 + 可展开） */}
              {busy && phase === "stream" && showTrace && !traceSettled && (
                <div className="lmsg lmsg--ai">
                  <div className="lmsg-who mono">
                    <span className="lmsg-who-dot" aria-hidden="true" /> AGENT
                  </div>
                  <ThinkingTrace
                    activeLabel="Thinking"
                    doneLabel="Thinking done"
                    rows={[
                      { primary: "Connecting to model" },
                      { primary: "Waiting for first token", mono: true },
                    ]}
                  />
                </div>
              )}
              {err && <p className="labapp-err">{err}</p>}
            </div>
          </div>

          {messages.length <= 1 && !busy && (
            <div className="labapp-sugs">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="labapp-sug" onClick={() => ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* ===== Prompt Bar composer ===== */}
          <div className="labapp-composer">
            <div className="labapp-composer-box">
              <span className="labapp-at mono" aria-hidden="true">
                @
              </span>
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autosize();
                }}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="给 Lab Agent 派个活…"
                aria-label="向 Lab Agent 提问"
                disabled={busy}
              />
              <button
                type="button"
                className="labapp-send"
                onClick={() => ask()}
                disabled={busy || !input.trim()}
                aria-label="发送"
              >
                ↑
              </button>
            </div>
            <div className="labapp-composer-hint mono">
              <span>Enter 发送 · Shift+Enter 换行</span>
              <span>LLM 可犯错 · 仅供参考</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
