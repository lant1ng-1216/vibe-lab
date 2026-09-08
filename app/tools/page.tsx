import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import ToolsClient from "./ToolsClient";
import { TOOLS } from "@/data/tools";

export const metadata: Metadata = {
  title: "资源库 — Vibe Lab · 振动实验室",
  description:
    "主流 AI 工具一站收录、Skill 即学即用；另有羊毛专区独立整理免费额度与白嫖渠道。",
};

export default function ToolsPage() {
  return (
    <>
      <SiteNav />
      <main>
        <ToolsClient toolCount={TOOLS.length} />
      </main>
      <SiteFooter />
    </>
  );
}
