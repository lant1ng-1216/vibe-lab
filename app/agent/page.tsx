import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import AgentApp from "@/components/AgentApp";

export const metadata: Metadata = {
  title: "Lab Agent 工作台 — Vibe Lab · 振动实验室",
  description:
    "和 Lab Agent 聊聊：工具怎么选、Agent 是什么、需求怎么拆——它会用大白话给你讲清楚。",
};

/** Lab Agent 工作台：从首页(概念演示)「去试 Lab Agent」进入 */
export default function AgentPage() {
  return (
    <>
      <SiteNav />
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 120px" }}>
        <div className="sec-no" style={{ marginBottom: 14 }}>
          <span className="mono">LAB AGENT · 工作台</span>
        </div>
        <h1 style={{ fontSize: 30, margin: "0 0 8px" }}>Lab Agent</h1>
        <p style={{ color: "var(--ink-soft)", margin: "0 0 28px", lineHeight: 1.8 }}>
          站内版本是监工愿景的第一步：先当一个懂 Vibe Lab 的向导与问询助手。
          工具怎么选、Agent 是什么、一段需求怎么拆——问它。
        </p>
        <AgentApp />
      </main>
    </>
  );
}
