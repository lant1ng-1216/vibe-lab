import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCreator, worksOf, listCreators } from "@/lib/creators";
import { LabFeed } from "@/components/lab/LabFeed";
import CreatorHeader from "@/components/lab/CreatorHeader";

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const c = getCreator(handle);
  if (!c) return { title: "未找到 — Vibe Lab" };
  return { title: `${c.name} · Lab — Vibe Lab`, description: c.tagline };
}

export function generateStaticParams() {
  return listCreators().map((c) => ({ handle: c.handle }));
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const c = getCreator(handle);
  if (!c) notFound();
  const works = worksOf(handle);
  const all = listCreators();
  return (
    <>
      <CreatorHeader creator={c} />
      <LabFeed works={works} creators={all} />
    </>
  );
}
