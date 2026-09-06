import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** 创作者主页 · 实验室暂停展示 → 统一回 /lab 占位页 */
export default async function CreatorPage() {
  redirect("/lab");
}
