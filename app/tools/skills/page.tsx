import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SkillsClient from "./SkillsClient";

export const metadata: Metadata = {
  title: "Skill — 资源库 · Vibe Lab · 振动实验室",
  description: "可复用的 AI 技能包：一份提示词、一个工作流，装上就能用。",
};

/** Skill 二级页 —— 资源库点「Skill」入口卡跳转过来 */
export default function SkillsPage() {
  return (
    <>
      <SiteNav />
      <main>
        <SkillsClient />
      </main>
      <SiteFooter />
    </>
  );
}
