"use client";

import { usePathname, useRouter } from "next/navigation";
import Brand from "./Brand";

const LINKS = [
  { href: "/home", label: "首页" },
  { href: "/tools", label: "资源库" },
  { href: "/tutorials", label: "教程库" },
  { href: "/lab", label: "实验室" },
  { href: "/courses", label: "训练营" },
  { href: "/contact", label: "关于 & 联系" },
];

export default function SiteNav() {
  const path = usePathname();
  const router = useRouter();

  return (
    <header className="sitenav">
      <div className="sitenav-inner">
        <Brand />
        <nav className="sitenav-links" aria-label="主导航">
          {LINKS.map((l) => {
            const active =
              path === l.href || (l.href !== "/" && path.startsWith(l.href));
            return (
              <button
                key={l.href}
                type="button"
                onClick={() => router.push(l.href)}
                className={"sitenav-link sitenav-link--btn" + (active ? " is-active" : "")}
              >
                {l.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
