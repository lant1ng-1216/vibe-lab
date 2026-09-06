"use client";

import { useState } from "react";

const MAIL = "zfu9751@gmail.com";

const box: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};
const row: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const label: React.CSSProperties = { display: "block", fontSize: 12, letterSpacing: ".05em", marginBottom: 6, color: "var(--ink-soft)" };
const field: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10,
  border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink)",
  font: "inherit", fontSize: 14,
};
const area: React.CSSProperties = { ...field, minHeight: 120, resize: "vertical", lineHeight: 1.7 };
const btn: React.CSSProperties = {
  alignSelf: "flex-start", padding: "11px 22px", borderRadius: 10, border: "none",
  background: "var(--accent)", color: "#fff", font: "inherit", fontSize: 14.5, fontWeight: 600, cursor: "pointer",
};

/** 快捷邮件表单：纯 mailto（无后端）——填好点发送，打开邮件客户端把内容带好 */
export default function ContactForm() {
  const [name, setNm] = useState("");
  const [who, setWho] = useState("个人开发者");
  const [topic, setTopic] = useState("赞助 Vibe Lab");
  const [msg, setMsg] = useState("");

  function send() {
    const subject = `[${topic}] ${name || "访客"}`;
    const body = ["我是谁：" + who, "留言：" + (msg || "(未填写)")].join("\n\n");
    window.location.href = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form
      style={box}
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <div style={row}>
        <div>
          <label style={label} htmlFor="cf-name">怎么称呼</label>
          <input id="cf-name" style={field} value={name} placeholder="你的名字 / 品牌" onChange={(e) => setNm(e.target.value)} autoComplete="name" />
        </div>
        <div>
          <label style={label} htmlFor="cf-who">身份</label>
          <select id="cf-who" style={field} value={who} onChange={(e) => setWho(e.target.value)}>
            {["个人开发者", "创作者", "公司 / 机构", "其它"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label style={label} htmlFor="cf-topic">想聊什么</label>
        <select id="cf-topic" style={field} value={topic} onChange={(e) => setTopic(e.target.value)}>
          {["赞助 Vibe Lab", "企业合作 / 品牌", "长期支持", "课程 / 内容共创", "其它"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={label} htmlFor="cf-msg">留言</label>
        <textarea id="cf-msg" style={area} value={msg} placeholder="想怎么支持 / 想聊什么，写几句就行…" onChange={(e) => setMsg(e.target.value)} />
      </div>
      <button type="submit" style={btn}>
        生成邮件 →
      </button>
      <p style={{ fontSize: 12, color: "var(--ink-faint)", margin: 0 }}>
        {MAIL} · 点按钮会唤起你的邮件客户端，内容已填好，发送前可再改。
      </p>
    </form>
  );
}
