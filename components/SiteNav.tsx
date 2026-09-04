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
  { href: "/courses", label: "训练营", gate: true }, // gate: 进入前弹收费提示
  { href: "/about", label: "关于" },
  { href: "/contact", label: "联系" },
];

export default function SiteNav() {
  const path = usePathname();
  const router = useRouter();
  const [gate, setGate] = useState<string | null>(null);

  function handleNav(l: (typeof LINKS)[number]) {
    if (l.gate) {
      setGate(l.href); // 弹确认
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
            return (
              <button
                key={l.href}
                type="button"
                onClick={() => handleNav(l)}
                className={"sitenav-link sitenav-link--btn" + (active ? " is-active" : "")}
              >
                {l.label}
              </button>
            );
          })}
          <Link href="/join" className="sitenav-cta">
            报名训练营
          </Link>
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
