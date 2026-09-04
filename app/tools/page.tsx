import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import ToolsClient from "./ToolsClient";
import { TOOLS, TOOL_CATEGORIES } from "@/data/tools";

export const metadata: Metadata = {
  title: "AI 工具库 — Vibe Lab · 振动实验室",
  description:
    "ChatGPT、Claude、DeepSeek、Cursor、ComfyUI 等主流 AI 工具一站收录，按用途分类快速查找跳转。",
};

export default function ToolsPage() {
  return (
    <>
      <SiteNav />
      <main>
        <ToolsClient tools={TOOLS} categories={TOOL_CATEGORIES} />
      </main>
      <SiteFooter />
    </>
  );
}
