import type { Metadata } from "next";
import { listCreators, listWorks } from "@/lib/creators";
import { LabFeed } from "@/components/lab/LabFeed";

export const metadata: Metadata = {
  title: "Lab · 实验室 — Vibe Lab",
  description: "Vibe Lab 的创作者实验室：创作者把各自折腾出的作品摆上台。",
};

export default function LabPage() {
  const creators = listCreators();
  const works = listWorks();
  return <LabFeed works={works} creators={creators} />;
}
