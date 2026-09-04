import { NextRequest, NextResponse } from "next/server";
import { listCreators, listWorks, invalidateLabCache, fetchRepoText } from "@/lib/lab";
import { commitFile, toBase64 } from "@/lib/github-writer";
import { generateImage, generateSummary, buildCoverPrompt } from "@/lib/minimax";

export const dynamic = "force-dynamic";

/**
 * Lab 作品封面生成 + 一句话摘要（幂等；?force=1 可重生成覆盖）
 *  GET /api/lab-cover?workId=<id>[&force=1]
 * 返回 { ok, url?, summary?, existing? }
 * - url 为站内代理 /api/lab-cover-file?path=covers/<id>.jpg
 */
const inflight = new Map<string, Promise<NextResponse>>();

export async function GET(req: NextRequest) {
  const workId = req.nextUrl.searchParams.get("workId");
  if (!workId) return NextResponse.json({ ok: false, error: "workId required" }, { status: 400 });
  const force = req.nextUrl.searchParams.get("force") === "1";

  const running = inflight.get(workId);
  if (running) return running;
  const p = handle(workId, force);
  inflight.set(workId, p);
  try {
    return await p;
  } finally {
    inflight.delete(workId);
  }
}

async function handle(workId: string, force: boolean): Promise<NextResponse> {
  const { works } = await loadFresh();
  const work = works.find((w) => w.id === workId);
  if (!work) return NextResponse.json({ ok: false, error: "work not found" }, { status: 404 });

  const coverPath = `covers/${work.id}.jpg`;

  // 已有封面且未强制重生成 → 直接返回
  if (work.thumb && !force) {
    const url = resolveCoverUrl(work.thumb, work.id);
    const summary = work.cardSummary || null;
    return NextResponse.json({ ok: true, existing: true, url, summary });
  }

  // —— 生成封面（首次或 force）+ 摘要 ——
  const prompt = buildCoverPrompt({
    title: work.title,
    desc: work.desc,
    tags: work.tags,
    type: work.type,
    coverHint: work.coverHint,
  });

  const img = await generateImage(prompt, { aspectRatio: "16:9" });
  if (!img) {
    return NextResponse.json(
      { ok: false, error: "MiniMax 生成失败（key/网络/限流）" },
      { status: 502 }
    );
  }

  const okUpload = await commitFile(coverPath, toBase64(img), `chore(lab): AI cover for ${work.id}`);
  if (!okUpload) {
    return NextResponse.json(
      { ok: false, error: "写入仓库失败（VLAB_GH_TOKEN 权限不足？）" },
      { status: 502 }
    );
  }

  let summary = await generateSummary({
    title: work.title,
    desc: work.desc,
    tags: work.tags,
  });

  // 回写 works.json：thumb + cardSummary
  await writeBackWorks(work, coverPath, summary);

  const url = `/api/lab-cover-file?path=${coverPath}`;
  return NextResponse.json({ ok: true, existing: false, regenerated: force, url, summary });
}

/** 把 coverPath + summary 写入该创作者 works.json */
async function writeBackWorks(
  work: { id: string; handle: string },
  coverPath: string,
  summary: string | null
): Promise<void> {
  try {
    const creators = await listCreators();
    const creator = creators.find((c) => c.handle === work.handle);
    if (!creator) return;
    const dir = (creator as unknown as { dir?: string }).dir || creator.handle;
    const filePath = `creators/${dir}/works.json`;
    const text = await fetchRepoText(filePath);
    if (!text) return;
    const data = JSON.parse(text) as { works: Array<Record<string, unknown>> };
    const target = data.works.find((w) => w.id === work.id);
    if (!target) return;
    target.thumb = coverPath;
    if (summary) target.cardSummary = summary;
    const ok = await commitFile(
      filePath,
      toBase64(Buffer.from(JSON.stringify(data, null, 2), "utf8")),
      `chore(lab): AI cover + summary for ${work.id}`
    );
    if (ok) invalidateLabCache(filePath);
  } catch {
    /* 回写失败不阻塞 */
  }
}

/** 读最新（避免缓存旧数据导致重复生成） */
async function loadFresh() {
  invalidateLabCache();
  return { works: await listWorks() };
}

function resolveCoverUrl(thumb: string, workId: string): string {
  if (thumb.startsWith("/assets/")) return thumb;
  if (thumb.startsWith("covers/") || thumb.startsWith("/covers/")) {
    return `/api/lab-cover-file?path=${thumb.replace(/^\//, "")}`;
  }
  return thumb;
}