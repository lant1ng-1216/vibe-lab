"use client";

/* Skill 二级页 —— 资源库点「Skill」入口卡跳转过来（2026-09-08，与 ai-tools 同构）。
   目前没有收录数据，展示悬浮方块空态；以后 SKILLS 有数据在这里铺卡片。 */

import Link from "next/link";
import { SKILLS, SKILL_PREVIEW_TAGS } from "@/data/skills";

const CUBE_PARTICLES = [
  { x: 16, y: -2, dx: -10, dy: -26, dur: 3.1, delay: 0, s: 5, c: "var(--accent)" },
  { x: 50, y: -2, dx: 4, dy: -30, dur: 3.7, delay: -1.2, s: 4, c: "#131313" },
  { x: 84, y: -2, dx: 14, dy: -24, dur: 2.8, delay: -2.1, s: 6, c: "#CFC7B4" },
  { x: 102, y: 22, dx: 30, dy: -8, dur: 3.4, delay: -0.6, s: 4, c: "var(--accent)" },
  { x: 102, y: 66, dx: 26, dy: 10, dur: 4.0, delay: -1.8, s: 5, c: "#131313" },
  { x: 86, y: 102, dx: 12, dy: 26, dur: 3.2, delay: -2.6, s: 5, c: "#CFC7B4" },
  { x: 52, y: 102, dx: -2, dy: 30, dur: 3.8, delay: -0.9, s: 4, c: "var(--accent)" },
  { x: 20, y: 102, dx: -14, dy: 24, dur: 2.9, delay: -1.5, s: 6, c: "#131313" },
  { x: -2, y: 78, dx: -28, dy: 8, dur: 3.5, delay: -2.2, s: 4, c: "#CFC7B4" },
  { x: -2, y: 34, dx: -26, dy: -10, dur: 3.0, delay: -0.3, s: 5, c: "var(--accent)" },
  { x: 34, y: -2, dx: -4, dy: -34, dur: 4.2, delay: -3.0, s: 3, c: "#131313" },
  { x: 68, y: -2, dx: 8, dy: -28, dur: 3.3, delay: -2.8, s: 4, c: "var(--accent)" },
];

export default function SkillsClient() {
  const count = SKILLS.length;
  return (
    <div className="tools-home-wrap">
      <div className="aitools-head">
        <div className="aitools-head-text">
          <div className="sec-num">02 / SKILLBOX</div>
          <h1>Skill</h1>
          <p className="lead">
            把「重复的 AI 用法」打包成可复用技能包 —— 一份提示词、一个工作流，装上就能用。
          </p>
        </div>
        <Link href="/tools" className="skill-empty-btn" style={{ textDecoration: "none" }}>
          ← 返回资源库
        </Link>
      </div>

      {count === 0 ? (
        <div className="skill-empty">
          <div className="skill-empty-icon" aria-hidden="true">
            <span className="skill-cube-shadow" />
            <span className="skill-cube">
              {CUBE_PARTICLES.map((p, i) => (
                <i
                  key={i}
                  className="skill-particle"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: p.s,
                    height: p.s,
                    background: p.c,
                    "--dx": `${p.dx}px`,
                    "--dy": `${p.dy}px`,
                    "--dur": `${p.dur}s`,
                    "--delay": `${p.delay}s`,
                  } as React.CSSProperties}
                />
              ))}
              <span className="skill-cube-dot" />
              <span className="skill-empty-flask">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/flasks/green_1.png" alt="" width={40} height={40} />
              </span>
            </span>
          </div>
          <h3>Skill 收录中</h3>
          <p>
            未来这里会聚合网上优秀的开源 Skill。有好推荐？告诉我，我来收录。
          </p>
          <div className="skill-empty-tags">
            {SKILL_PREVIEW_TAGS.map((t) => (
              <span key={t} className="tag tag--ac">
                {t}
              </span>
            ))}
          </div>
          <a href="/contact" className="skill-empty-btn" style={{ textDecoration: "none" }}>
            有好 Skill 推荐？告诉我
          </a>
        </div>
      ) : (
        <h3>共收录 {count} 个 Skill</h3>
      )}
    </div>
  );
}
