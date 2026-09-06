import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import DemoStage from "./DemoStage";

export const metadata: Metadata = {
  title: "Lab Agent · 交互演示 — Vibe Lab · 振动实验室",
  description:
    "当一次开发者，体验有 Lab Agent 监工的开发循环：开工前把意图问清楚、开工时盯着 Coding Agent 别跑偏、交差时对照 PRD 验收。",
};

/** Lab Agent 交互式演示：监工愿景的「可玩版」 */
export default function AgentPage() {
  return (
    <>
      <SiteNav />
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "30px 24px 70px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 6 }}>
          <span className="sec-no" style={{ marginBottom: 0 }}>
            <span className="mono">LAB AGENT · 交互演示</span>
          </span>
          <span style={{ color: "var(--ink-faint)", fontSize: 12.5 }}>
            画布上的两个终端 · 你只跟 Lab Agent 聊 · Coding Agent 是哪个 engine 由你切
          </span>
        </div>
        <h1 style={{ fontSize: 25, margin: "0 0 10px", fontWeight: 700, lineHeight: 1.25, maxWidth: 760 }}>
          你当一次开发者，看监工怎么保住你的意图
        </h1>
        <p style={{ color: "var(--ink-soft)", margin: "0 0 18px", maxWidth: 680, lineHeight: 1.7, fontSize: 13.5 }}>
          写代码的是 Coding Agent（Claude Code / Codex / Cursor…任你切换）；Lab Agent 不写代码，只守住「你想要的」：
          开工前问清楚写成 PRD、执行时盯着别跑偏、交差时翻译汇报并对照验收。走完一个循环，你就知道监工值多少。
        </p>
        <DemoStage />
      </main>
      <SiteFooter />
    </>
  );
}
