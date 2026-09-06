import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import ToolsClient from "./ToolsClient";
import type { WoolCard } from "./WoolClient";
import { TOOLS, TOOL_CATEGORIES } from "@/data/tools";
import { WOOL } from "@/data/wool";

export const metadata: Metadata = {
  title: "资源库 — Vibe Lab · 振动实验室",
  description:
    "主流 AI 工具一站收录、Skill 即学即用、羊毛额度持续更新——AI 工具、白嫖姿势按用途快速查。",
};

/** 按 toolId 关联工具条目，把 logo 文件名在服务端解析好（客户端不打包整个 TOOLS） */
function woolWithLogo(): WoolCard[] {
  const byId = new Map(TOOLS.map((t) => [t.id, t]));
  return WOOL.map((w) => {
    const logo = w.toolId ? byId.get(w.toolId)?.logo : undefined;
    if (!logo) return { ...w, logo: null };
    const hasExt = /\.(svg|png|jpe?g|webp)$/i.test(logo);
    return { ...w, logo: hasExt ? logo : `${logo}.png` };
  });
}

export default function ToolsPage() {
  return (
    <>
      <SiteNav />
      <main>
        <ToolsClient tools={TOOLS} categories={TOOL_CATEGORIES} wool={woolWithLogo()} />
      </main>
      <SiteFooter />
    </>
  );
}
