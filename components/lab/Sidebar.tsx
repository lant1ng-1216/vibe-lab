import Link from "next/link";
import { loadLab } from "@/lib/lab";
import CreatorAvatar from "./CreatorAvatar";

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export default async function Sidebar() {
  const { creators, works } = await loadLab();
  const total = works.length;

  return (
    <aside className="lab4-side">
      <div className="lab4-side-inner">
        {/* Logo 品牌整体：带框烧杯（复刻工具库 Skill 收录中样式）+ 字标 */}
        <Link href="/lab" className="lab4-logo" aria-label="Lab 首页">
          <span className="lab4-logo-badge" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/flasks/green_1.png" alt="" width={34} height={34} />
          </span>
          <span className="lab4-logo-word">
            <span className="lab4-logo-text">Vibe Lab</span>
            <span className="lab4-logo-sub mono">LAB · 实验室</span>
          </span>
        </Link>

        {/* 实验台上 — 浏览 lab 内部 */}
        <section className="lab4-sec">
          <p className="lab4-sec-k mono">实验台上 · THE BENCH</p>
          <nav className="lab4-list" aria-label="实验台上">
            <Link className="lab4-list-item" href="/lab">
              <span>全部作品</span>
              <span className="lab4-count mono">{pad2(total)}</span>
            </Link>
          </nav>
          <div className="lab4-list lab4-list--inner">
            {creators.map((c) => {
              const n = works.filter((w) => w.handle === c.handle).length;
              return (
                <Link
                  className="lab4-list-item lab4-list-item--creator"
                  href={`/lab/${c.handle}`}
                  key={c.handle}
                >
                  <CreatorAvatar creator={c} className="lab4-creator-av" />
                  <span className="lab4-creator-name">{c.name}</span>
                  {n > 0 && <span className="lab4-count mono">{pad2(n)}</span>}
                </Link>
              );
            })}
            <Link className="lab4-list-item lab4-list-item--slot" href="/contact">
              <span className="lab4-slot-plus">＋</span>
              <span className="lab4-slot-text">你的位置</span>
              <span className="lab4-count mono">申请</span>
            </Link>
          </div>
        </section>

        {/* 入驻 CTA 卡 */}
        <Link href="/contact" className="lab4-join">
          <span className="lab4-join-k mono">LAB · 入驻</span>
          <p className="lab4-join-t">把你的作品摆上台</p>
          <p className="lab4-join-d">受邀制入驻 · 作品经审核后展出</p>
          <span className="lab4-join-go">申请入驻 ↗</span>
        </Link>

        <footer className="lab4-foot mono">
          <span>© 2026 Vibe Lab</span>
          <span>实验室</span>
        </footer>
      </div>
    </aside>
  );
}