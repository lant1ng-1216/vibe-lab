import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CoursesClient from "./CoursesClient";
import { COURSE_PACKS } from "@/data/courses";

export const metadata: Metadata = {
  title: "训练营课程台 — Vibe Lab · 振动实验室",
  description:
    "Vibe Lab 训练营课程台：系统训练营（Starter / Builder / Hacker）与低价尝鲜小课，按课包解锁观看，永久回看。",
};

export default function CoursesPage() {
  return (
    <>
      <SiteNav />
      <main>
        <CoursesClient packs={COURSE_PACKS} />
      </main>
      <SiteFooter />
    </>
  );
}
