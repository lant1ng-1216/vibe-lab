"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

type Role = "you" | "lab" | "code";

const SCRIPT: { role: Role; text: string }[] = [
  { role: "you", text: "我想给完全小白做个「AI 作品集生成器」。先别写代码，帮我理思路。" },
  { role: "lab", text: "好。先问三个问题：小白做到哪一步算完成？会用到什么工具？先做 1 页还是全流程？" },
  { role: "you", text: "第 ① 个：上传 3 张截图+简介，自动生成一页能发的作品页。" },
  { role: "lab", text: "✅ 意图已锁定 → PRD v1 生成（范围 3 节 · 验收清单 5 条）→ 交给 Coding Agent 开工。" },
  { role: "code", text: "[feat] scaffold + 作品页骨架完成（diff +48 −9，提交 3a9f2c）" },
  { role: "lab", text: "验收中… ✓ 2/3 通过 · 打回 1 项：图片上传校验与 PRD 不符，已附理由，让 Coding Agent 重做。" },
];

const TAG: Record<Role, string> = { you: "YOU", lab: "LAB", code: "CODE" };
const ROLE_CLS: Record<Role, string> = { you: "tagYou", lab: "tagLab", code: "tagCode" };

export default function AgentDemo() {
  const [mi, setMi] = useState(0); // message index
  const [chars, setChars] = useState(0);
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (mi >= SCRIPT.length) {
      setDone(true);
      return;
    }
    const full = SCRIPT[mi].text;
    if (chars >= full.length) {
      const t = setTimeout(() => {
        setMi((v) => v + 1);
        setChars(0);
      }, 460);
      timers.current.push(t);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setChars((c) => c + 1), 26);
    timers.current.push(t);
    return () => clearTimeout(t);
  }, [mi, chars]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function skip() {
    setMi(SCRIPT.length);
    setChars(0);
    setDone(true);
  }

  return (
    <div
      className={styles.term}
      onClick={() => (done ? (setMi(0), setChars(0), setDone(false)) : skip())}
      style={{ cursor: "pointer" }}
      role="img"
      aria-label="Lab Agent 监工会话演示"
    >
      <div className={styles.termBar}>
        <span className={styles.dot} style={{ background: "#ff5f57" }} />
        <span className={styles.dot} style={{ background: "#febc2e" }} />
        <span className={styles.dot} style={{ background: "#28c840" }} />
        <span className={styles.termTitle}>lab-agent@vibe — 监工会话</span>
      </div>
      <div className={styles.termBody}>
        {SCRIPT.slice(0, mi).map((m, i) => (
          <div className={styles.line} key={i}>
            <span className={`${styles.tag} ${styles[ROLE_CLS[m.role]]}`}>{TAG[m.role]}</span>
            <span className={styles.text}>{m.text}</span>
          </div>
        ))}
        {mi < SCRIPT.length && (
          <div className={styles.line}>
            <span className={`${styles.tag} ${styles[ROLE_CLS[SCRIPT[mi].role]]}`}>{TAG[SCRIPT[mi].role]}</span>
            <span className={styles.text}>
              {SCRIPT[mi].text.slice(0, chars)}
              <span className={styles.caret} />
            </span>
          </div>
        )}
        {done && (
          <div className={styles.doneHint}>
            点卡片重播 · 或{" "}
            <a href="/agent" style={{ color: "#8b7dff" }}>
              去工作台亲自试试 →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
