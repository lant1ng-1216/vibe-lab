import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Lab · 实验室 — Vibe Lab · 振动实验室",
  description: "Vibe Lab 创作者实验室：内容整理中，敬请期待。",
};

/** 实验室 · 暂时停展(内容重新组织中,不展示创作者与作品) */
export default function LabPage() {
  return (
    <>
      <SiteNav />
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "96px 24px 130px", textAlign: "center" }}>
        <div className="sec-no" style={{ marginBottom: 16, justifyContent: "center" }}>
          <span className="mono">LAB · 创作者实验室</span>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 12px", lineHeight: 1.3 }}>
          整理中，稍后回来
        </h1>
        <p style={{ color: "var(--ink-soft)", lineHeight: 1.9, maxWidth: 480, margin: "0 auto 26px", fontSize: 14 }}>
          这里将展示创作者与他们的作品——目前内容正在重新组织、暂不开放。
          <br />
          想第一时间知道开放时间，或聊聊入驻与合作，
          <a href="/contact" style={{ color: "var(--accent)", fontWeight: 600 }}>
            联系站长
          </a>
          。
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            background: "var(--accent)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 999,
            fontSize: 13.5,
            textDecoration: "none",
          }}
        >
          回首页逛逛
        </a>
      </main>
      <SiteFooter />
    </>
  );
}
