import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCreator, worksOf, listCreators } from "@/lib/lab";
import { LabFeed } from "@/components/lab/LabFeed";
import CreatorHeader from "@/components/lab/CreatorHeader";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const c = await getCreator(handle);
  if (!c) return { title: "未找到 — Vibe Lab" };
  return { title: `${c.name} · Lab — Vibe Lab`, description: c.tagline };
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const c = await getCreator(handle);
  if (!c) notFound();
  const works = await worksOf(handle);
  const all = await listCreators();
  return (
    <>
      <CreatorHeader creator={c} />
      <LabFeed works={works} creators={all} />
    </>
  );
}