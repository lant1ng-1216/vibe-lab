"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Brand from "./Brand";
import CourseGate from "./CourseGate";

const LINKS = [
  { href: "/home", label: "首页" },
  { href: "/tools", label: "工具库" },
  { href: "/tutorials", label: "教程库" },
  { href: "/lab", label: "实验室" },
  { href: "/courses", label: "训练营", locked: true, gate: true }, // gate: 付费专区，进入前弹邀请码
  { href: "/contact", label: "关于 & 联系" },
];

export default function SiteNav() {
  const path = usePathname();
  const router = useRouter();
  const [gate, setGate] = useState<string | null>(null);

  /**
   * 跳转优化（2026-09-08 体检）：
   * 原先导航是 <button onClick={router.push}>，Next 的自动预取只对 <Link> 生效，
   * 所以每个栏目首次点击都要现拉页面。改成 Link 后视口内链接自动预取，
   * 全站跳转几乎瞬时；训练营那条要弹邀请码，仍保留 button。
   */
  function handleNav(l: (typeof LINKS)[number]) {
    if (l.gate) {
      setGate(l.href); // 弹邀请码窗
    } else {
      router.push(l.href);
    }
  }

  return (
    <header className="sitenav">
      <div className="sitenav-inner">
        <Brand />
        <nav className="sitenav-links" aria-label="主导航">
          {LINKS.map((l) => {
            const active =
              path === l.href || (l.href !== "/" && path.startsWith(l.href));
            const cls =
              "sitenav-link sitenav-link--btn" + (active ? " is-active" : "");
            const inner = (
              <>
                {l.locked && <span className="sitenav-lock" aria-hidden="true">🔒</span>}
                {l.label}
              </>
            );
            // 需要邀请码的走 button（弹窗），其余用 Link 拿自动预取
            return l.gate ? (
              <button
                key={l.href}
                type="button"
                onClick={() => handleNav(l)}
                className={cls}
              >
                {inner}
              </button>
            ) : (
              <Link key={l.href} href={l.href} className={cls} prefetch>
                {inner}
              </Link>
            );
          })}
        </nav>
      </div>

      {gate && (
        <CourseGate
          onClose={() => setGate(null)}
          onGo={() => {
            const href = gate;
            setGate(null);
            router.push(href);
          }}
        />
      )}
    </header>
  );
}
