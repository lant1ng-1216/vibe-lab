"use client";

import { useState } from "react";
import styles from "./home.module.css";

const FORMS = [
  {
    key: "canvas",
    name: "画布形态",
    desc: "一个工作区里同时开着 Coding Agent 与 Lab Agent，开发者在中间：左边看执行，右边是 Lab Agent 的意图面板与验收记录。最直觉的监工界面。",
  },
  {
    key: "sdk",
    name: "SDK / 嵌入形态",
    desc: "把「监工 Agent」作为子 Agent 嵌进你习惯的工作流：Claude Code hooks、CI、其它工具链都能调它——内核是同一套，形态随你放。",
  },
] as const;

export default function FormTabs() {
  const [key, setKey] = useState<string>("canvas");
  const cur = FORMS.find((f) => f.key === key) ?? FORMS[0];
  return (
    <div>
      <div className={styles.tabsHead} role="tablist" aria-label="形态切换">
        {FORMS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={key === f.key}
            className={`${styles.tab}${key === f.key ? " " + styles.tabOn : ""}`}
            onClick={() => setKey(f.key)}
          >
            {f.name}
          </button>
        ))}
      </div>
      <div className={styles.tabPanel} role="tabpanel">
        <h3>{cur.name}</h3>
        <p>{cur.desc}</p>
      </div>
    </div>
  );
}
