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
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "46px 24px 110px" }}>
        <div className="sec-no" style={{ marginBottom: 12 }}>
          <span className="mono">LAB AGENT · 交互演示</span>
        </div>
        <h1 style={{ fontSize: 34, margin: "0 0 10px", fontWeight: 700, lineHeight: 1.2 }}>
          你当一次开发者，<br style={{ display: "none" }} />
          看监工怎么保住你的意图
        </h1>
        <p style={{ color: "var(--ink-soft)", margin: "0 0 26px", maxWidth: 640, lineHeight: 1.8, fontSize: 14.5 }}>
          下面的画面里，真正写代码的是 Claude Code——而 Lab Agent 全程不碰代码，只做三件事：
          开工前把你的想法问清楚写成 PRD，执行时盯着别跑偏，交差时逐句翻给你听、对照验收。
          走完这一个循环，你就知道「监工」在 Vibe Coding 里到底值多少钱。
        </p>
        <DemoStage />
        <p className="mono" style={{ marginTop: 18, textAlign: "center", fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.04em" }}>
          演示对话由 DeepSeek 实时生成 · 失败时自动回落内置剧本 · 纯前端演出，不写真实代码
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
