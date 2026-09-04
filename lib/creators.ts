// Lab 数据读取工具（server-safe）
// M1：读本地 data/creators。
// 切 GitHub 内容仓库（vibe-lab/creators）时：把下方 import 换为
// 按仓库结构拉取 index.json / <handle>/profile.json / works.json，
// 组件层无需改动。
import { CREATORS, WORKS, type Creator, type Work } from "@/data/creators";

export function listCreators(): Creator[] {
  return [...CREATORS].sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
}

export function getCreator(handle: string): Creator | undefined {
  return CREATORS.find((c) => c.handle === handle);
}

export function worksOf(handle: string): Work[] {
  return WORKS.filter((w) => w.handle === handle).sort((a, b) => b.date.localeCompare(a.date));
}

export function listWorks(): Work[] {
  return [...WORKS].sort((a, b) => b.date.localeCompare(a.date));
}
