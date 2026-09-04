import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import TutorialsClient from "./TutorialsClient";
import { TUTORIALS, TUTORIAL_CATEGORIES } from "@/data/tutorials";
import { readToc } from "@/lib/tutorials";

export const metadata: Metadata = {
  title: "教程库 — Vibe Lab · 振动实验室",
  description:
    "精选 GitHub 开源文字教程，站内直接阅读：从入门通识、提示词到 Vibe Coding、Agent 实战与产品上线。",
};

export default function TutorialsPage() {
  const tutorials = TUTORIALS.map((t) => ({
    ...t,
    chapters: readToc(t.id)?.length ?? null,
  }));
  return (
    <>
      <SiteNav />
      <main>
        <TutorialsClient tutorials={tutorials} categories={TUTORIAL_CATEGORIES} />
      </main>
      <SiteFooter />
    </>
  );
}
