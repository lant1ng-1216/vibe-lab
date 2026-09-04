"use client";

import { useState } from "react";
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
            return (
              <button
                key={l.href}
                type="button"
                onClick={() => handleNav(l)}
                className={"sitenav-link sitenav-link--btn" + (active ? " is-active" : "")}
              >
                {l.locked && <span className="sitenav-lock" aria-hidden="true">🔒</span>}
                {l.label}
              </button>
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
