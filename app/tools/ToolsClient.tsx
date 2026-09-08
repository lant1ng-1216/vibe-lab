"use client";

/* 资源库主页（2026-09-08）：
   三张竖版大方块入口卡（logo 铺满整卡），点击各自跳转二级页：
   AI 工具 → /tools/ai-tools；Skill → /tools/skills；羊毛福利 → /wool。
   没有内容的部分留空，不填充凑数内容（老大明确要求）。 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SKILLS } from "@/data/skills";
import { WOOL } from "@/data/wool";

/**
 * 悬浮方块的边缘粒子 —— 参数写死不用 Math.random（SSR hydration 一致性）。
 */
/* ---------- 像素毛线团（羊毛专区 logo，2026-09-08） ---------- */
const WOOL_PIXELS = [
  "....bbbb....",
  "..bbWWWWbb..",
  ".bWWdWWdWWb.",
  "bWWdWWWWdWWb",
  "bWdWWWWWWdWb",
  "bWWWdWWdWWWb",
  "bWWWWddWWWWb",
  "bWdWWWWWWdWb",
  ".bWWdWWdWWb.",
  "..bbWWWWbb..",
  "....bbbb....",
];

function PixelArt({
  rows,
  colors,
  viewBox,
}: {
  rows: string[];
  colors: Record<string, string>;
  viewBox: string;
}) {
  const rects: React.ReactElement[] = [];
  rows.forEach((row, y) => {
    row.split("").forEach((ch, x) => {
      if (colors[ch]) {
        rects.push(
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={colors[ch]} />
        );
      }
    });
  });
  return (
    <svg viewBox={viewBox} width="100%" height="100%" shapeRendering="crispEdges" aria-hidden="true">
      {rects}
    </svg>
  );
}

function WoolBall() {
  return (
    <PixelArt
      rows={WOOL_PIXELS}
      viewBox="0 0 12 11"
      colors={{ b: "var(--ink)", W: "#CFC7B4", d: "var(--accent)" }}
    />
  );
}

/* ---------- 入口卡（竖版大方块，logo 铺满整卡，信息条叠底部） ---------- */
function EntryCard({
  tone,
  title,
  count,
  desc,
  hint,
  onClick,
}: {
  tone: "tools" | "skills" | "wool";
  title: string;
  count: number;
  desc: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="tentry" data-tone={tone} onClick={onClick}>
      {tone === "tools" ? (
        <span className="tentry-logo" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/flasks/green_1.png" alt="" />
        </span>
      ) : tone === "wool" ? (
        <span className="tentry-logo" aria-hidden="true">
          <WoolBall />
        </span>
      ) : (
        <span className="tentry-logo" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/skill-claw.png" alt="" />
        </span>
      )}

      <span className="tentry-bar">
        <span className="tentry-title">
          {title}
          <span className="tentry-count mono">{count}</span>
        </span>
        <span className="tentry-desc">{desc}</span>
      </span>

      <span className="tentry-hint mono">{hint}</span>
    </button>
  );
}

/* ---------- 主组件 ---------- */
export default function ToolsClient({ toolCount }: { toolCount: number }) {
  const router = useRouter();

  // 入口卡是 button+push（要执行跳转逻辑），Next 自动预取只认 <Link>，
  // 所以这里挂载时手动预取两条跳转目标，点击即开（2026-09-08 体检补）
  useEffect(() => {
    router.prefetch("/tools/ai-tools");
    router.prefetch("/tools/skills");
    router.prefetch("/wool");
  }, [router]);

  return (
    <div className="tools-home-wrap">
      <div className="page-head">
        <div className="sec-num">01 / RESOURCES</div>
        <h1>资源库</h1>
        <p className="lead">
          工具装齐一套「能打」的，技能随用随装 —— 别把时间浪费在找链接和配环境上。
        </p>
        <a className="btn-main" href="/wool" style={{ display: "inline-flex", marginTop: 16 }}>
          🧪 羊毛专区 · 免费额度 / 白嫖渠道 →
        </a>
      </div>

      <div className="tgrid tools-home-grid">
        <EntryCard
          tone="tools"
          title="AI 工具"
          count={toolCount}
          desc="能直接上手的 AI 工具收录"
          hint="进入 →"
          onClick={() => router.push("/tools/ai-tools")}
        />
        <EntryCard
          tone="skills"
          title="Skill"
          count={SKILLS.length}
          desc="可复用的 AI 技能包"
          hint="进入 →"
          onClick={() => router.push("/tools/skills")}
        />
        <EntryCard
          tone="wool"
          title="羊毛福利"
          count={WOOL.length}
          desc="免费额度 / 学生认证 / 白嫖精选"
          hint="进入 →"
          onClick={() => router.push("/wool")}
        />
      </div>

    </div>
  );
}
