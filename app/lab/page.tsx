import type { Metadata } from "next";
import { listCreators, listWorks } from "@/lib/lab";
import { LabFeed } from "@/components/lab/LabFeed";

export const metadata: Metadata = {
  title: "Lab · 实验室 — Vibe Lab",
  description: "Vibe Lab 的创作者实验室：创作者把各自折腾出的作品摆上台。",
};

export const dynamic = "force-dynamic";

export default async function LabPage() {
  const creators = await listCreators();
  const works = await listWorks();
  return <LabFeed works={works} creators={creators} />;
}