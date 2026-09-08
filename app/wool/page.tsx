import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import WoolClient, { type WoolCard } from "./WoolClient";
import { WOOL } from "@/data/wool";
import { TOOLS } from "@/data/tools";

export const metadata: Metadata = {
  title: "羊毛福利专区 — Vibe Lab · 振动实验室",
  description:
    "主流 AI 工具的免费额度、白嫖姿势与门槛清单：能薅多少、要不要验证、什么时候过期，逐条标明核实日期。",
};

/** 按 toolId 关联资源库，把 logo 文件名在服务端解析好（客户端不打包整个 TOOLS） */
function withLogo(): WoolCard[] {
  const byId = new Map(TOOLS.map((t) => [t.id, t]));
  return WOOL.map((w) => {
    const logo = w.toolId ? byId.get(w.toolId)?.logo : undefined;
    if (!logo) return { ...w, logo: null };
    const hasExt = /\.(svg|png|jpe?g|webp)$/i.test(logo);
    return { ...w, logo: hasExt ? logo : `${logo}.png` };
  });
}

export default function WoolPage() {
  return (
    <>
      <SiteNav />
      <main>
        <WoolClient items={withLogo()} />
      </main>
      <SiteFooter />
    </>
  );
}
