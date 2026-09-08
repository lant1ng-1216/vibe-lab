import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import AiToolsClient from "./AiToolsClient";
import { TOOLS, TOOL_CATEGORIES } from "@/data/tools";

export const metadata: Metadata = {
  title: "AI 工具 — 资源库 · Vibe Lab · 振动实验室",
  description:
    "ChatGPT、Claude、DeepSeek、Cursor、ComfyUI 等主流 AI 工具一站收录，按用途分类快速查找跳转。",
};

/** AI 工具二级页 —— 资源库点「AI 工具」入口卡跳转过来 */
export default function AiToolsPage() {
  return (
    <>
      <SiteNav />
      <main>
        <AiToolsClient tools={TOOLS} categories={TOOL_CATEGORIES} />
      </main>
      <SiteFooter />
    </>
  );
}
