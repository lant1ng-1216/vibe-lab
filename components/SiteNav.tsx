"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "./Brand";

const LINKS = [
  { href: "/home", label: "首页" },
  { href: "/tools", label: "资源库" },
  { href: "/tutorials", label: "教程库" },
  { href: "/lab", label: "实验室" },
  { href: "/courses", label: "训练营" },
  { href: "/contact", label: "支持我们" },
];

/**
 * 全站导航。
 * 注：用 <Link prefetch> 而非 button+router.push —— Next 会对视口内链接自动预取，
 * 首次点击几乎瞬时（对齐 hemppp/wool 的跳转优化体检结论）。
 */
export default function SiteNav() {
  const path = usePathname();

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
            return (
              <Link key={l.href} href={l.href} className={cls} prefetch>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
