"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import CourseGate from "@/components/CourseGate";
import SocialPulse from "@/components/SocialPulse";
import FlaskBadge from "@/components/FlaskBadge";

gsap.registerPlugin(CustomEase);
CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");

const MENU_LINKS = [
  { href: "/home", label: "首页", no: "01" },
  { href: "/tools", label: "工具库", no: "02" },
  { href: "/tutorials", label: "教程库", no: "03" },
  { href: "/lab", label: "实验室", no: "04" },
  { href: "/courses", label: "训练营", no: "05" },
  { href: "/about", label: "关于", no: "06" },
  { href: "/contact", label: "联系", no: "07" },
];

type Social =
  | { kind: "popup"; label: string; cardImg: string }
  | { kind: "link"; label: string; href: string };

// 菜单底部「Follow / 关注」：popup = 点击/悬停附近浮出名片；link = 普通跳转
const SOCIALS: Social[] = [
  { kind: "popup", label: "微信", cardImg: "/assets/card/wechat-card.png" },
  { kind: "popup", label: "抖音", cardImg: "/assets/socials/douyin-card.png" },
  { kind: "link", label: "GitHub", href: "#" }, // 链接待补（后续新增页面时一并确定）
];

function BrandFlask() {
  return <FlaskBadge size={36} />;
}

/* 8 flask colors — click cycles through them */
const FLASK_COLORS = [
  "green",
  "red",
  "orange",
  "yellow",
  "green-dark",
  "blue",
  "purple",
  "white",
];

/* Animated beaker as the letter L — click to cycle color (original interaction + size) */
function LabFlaskL() {
  const seq = [0, 1, 2, 1];
  const [colorIdx, setColorIdx] = useState(0);
  const [fIdx, setFIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFIdx((n) => (n + 1) % seq.length), 240);
    return () => clearInterval(id);
  }, []);

  const nextColor = () => {
    setColorIdx((n) => (n + 1) % FLASK_COLORS.length);
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="hero-flask-l"
      src={`/assets/flasks/${FLASK_COLORS[colorIdx]}_${seq[fIdx]}.png`}
      alt=""
      aria-hidden="true"
      onClick={nextColor}
      title="点击切换颜色"
    />
  );
}

/* vue-bits RotatingText — 简化版 DOM：无多层嵌套，字符直接进 chip 背景 */
function RotatingText({
  words,
  rotationInterval = 2000,
  staggerDuration = 0.025,
  auto = true,
}: {
  words: string[];
  rotationInterval?: number;
  staggerDuration?: number;
  auto?: boolean;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setIdx((n) => (n + 1) % words.length), rotationInterval);
    return () => clearInterval(id);
  }, [auto, rotationInterval, words.length]);

  const currentText = words[idx];
  const ws = currentText.split(" ");

  return (
    <span className="rot">
      <span className="sr-only">{currentText}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={currentText}
          className="rot-wrap"
          layout
          aria-hidden="true"
        >
          {ws.map((w, wi) => {
            const chars = w.split("");
            return (
              <span key={wi} className="rot-word-inline">
                {chars.map((c, ci) => {
                  const delay = ci * staggerDuration;
                  return (
                    <motion.span
                      key={ci}
                      className="rot-ch"
                      layout
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "-120%", opacity: 0 }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                        delay,
                      }}
                    >
                      {c}
                    </motion.span>
                  );
                })}
                {wi < ws.length - 1 && <span className="rot-space"> </span>}
              </span>
            );
          })}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export type PulseInit = { onlineVisitors: number; totalViews: number };
export default function LandingExperience({ pulseInitial }: { pulseInitial?: PulseInit }) {
  const [gate, setGate] = useState(false);
  const [openSocial, setOpenSocial] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const btnTxtRef = useRef<HTMLDivElement>(null);
  const btnIconRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const overlay = overlayRef.current;
    const menu = menuRef.current;
    if (!nav || !overlay || !menu) return;

    gsap.set(nav, { display: "none" });

    const panels = Array.from(nav.querySelectorAll<HTMLElement>(".bg-panel"));
    const links = Array.from(nav.querySelectorAll<HTMLElement>(".menu-link"));
    const fadeTargets = Array.from(nav.querySelectorAll<HTMLElement>("[data-menu-fade]"));
    const btnTexts = btnTxtRef.current ? Array.from(btnTxtRef.current.querySelectorAll("p")) : [];
    const icon = btnIconRef.current;
    // 方案 B：每次开关新建 timeline（不复用旧对象），播放头天然从 0 开始，
    // 杜绝“复用已播完 timeline → play() 从末尾启动 → 动画被静默跳过”的陷阱。
    // 动画序列/参数与原始版完全一致。
    let tl = gsap.timeline({ paused: true, defaults: { ease: "main", duration: 0.7 } });
    const isAnimating = { v: false };

    const openNav = () => {
      if (isAnimating.v) return;
      isAnimating.v = true;
      nav.setAttribute("data-nav", "open");
      // hard reset of every element's previous inline tween state
      gsap.set(nav, { display: "block" });
      gsap.set(menu, { xPercent: 0 }); // 打开前把菜单归位到屏幕内（close 曾将其 wipe 至 x=100%）
      gsap.set(panels, { xPercent: 101 });
      gsap.set(links, { yPercent: 140, autoAlpha: 0, rotate: 6 });
      gsap.set(fadeTargets, { autoAlpha: 0, yPercent: 40 });
      gsap.set(overlay, { autoAlpha: 0 });
      gsap.set(btnTexts, { yPercent: 0 });
      gsap.set(icon, { rotate: 0 });

      tl.kill();
      tl = gsap.timeline({ paused: true, defaults: { ease: "main", duration: 0.7 } });
      tl.fromTo(btnTexts, { yPercent: 0 }, { yPercent: -100, stagger: 0.2 }, 0)
        .fromTo(icon, { rotate: 0 }, { rotate: 315 }, "<")
        .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
        .fromTo(panels, { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, "<")
        .fromTo(links, { yPercent: 140, autoAlpha: 0, rotate: 6 }, { yPercent: 0, autoAlpha: 1, rotate: 0, stagger: 0.06 }, "<+=0.3")
        .fromTo(fadeTargets, { autoAlpha: 0, yPercent: 40 }, { autoAlpha: 1, yPercent: 0, stagger: 0.04 }, "<+=0.15")
        .eventCallback("onComplete", () => { isAnimating.v = false; })
        .play();
    };

    const closeNav = () => {
      if (isAnimating.v) return;
      isAnimating.v = true;
      nav.setAttribute("data-nav", "closed");
      tl.kill();
      tl = gsap.timeline({ paused: true, defaults: { ease: "main", duration: 0.7 } });
      tl.to(overlay, { autoAlpha: 0 })
        .to(menu, { xPercent: 100 }, "<")
        .to(btnTexts, { yPercent: 0 }, "<")
        .to(icon, { rotate: 0 }, "<")
        .set(nav, { display: "none" })
        // hard reset of inline state so next open starts from clean base
        .set(panels, { xPercent: 101, clearProps: "xPercent" })
        .set(links, { yPercent: 0, autoAlpha: 1, rotate: 0, clearProps: "yPercent,autoAlpha,rotate" })
        .set(fadeTargets, { autoAlpha: 1, yPercent: 0, clearProps: "yPercent,autoAlpha" })
        .eventCallback("onComplete", () => { isAnimating.v = false; })
        .play();
    };

    const onToggle = () => {
      if (isAnimating.v) return;
      if (nav.getAttribute("data-nav") === "open") closeNav();
      else openNav();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && nav.getAttribute("data-nav") === "open") closeNav();
    };

    const toggles = document.querySelectorAll<HTMLElement>("[data-menu-toggle]");
    toggles.forEach((t) => t.addEventListener("click", onToggle));
    document.addEventListener("keydown", onKey);

    return () => {
      toggles.forEach((t) => t.removeEventListener("click", onToggle));
      document.removeEventListener("keydown", onKey);
      tl.kill();
    };
  }, []);

  return (
    <>
      <main className="land">
      {/* header — single static green beaker */}
      <header className="hdr">
        <div className="hdr-inner">
          <a className="brand" href="/" aria-label="Vibe Lab 首页">
            <BrandFlask />
            <span className="brand-word">
              Vibe <em>Lab</em>
            </span>
          </a>
          <button
            className="menu-btn"
            data-menu-toggle
            aria-label="打开菜单"
            aria-expanded="false"
          >
            <span className="menu-btn-txt" ref={btnTxtRef}>
              <p>Menu</p>
              <p>Close</p>
            </span>
            <span className="menu-btn-icon" ref={btnIconRef}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M7.33 16V0h1.34v16H7.33z" fill="currentColor" />
                <path d="M16 8.67H0V7.33h16v1.34z" fill="currentColor" />
                <path d="M6 7.33h1.33V6C7.33 6.74 6.74 7.33 6 7.33z" fill="currentColor" />
                <path d="M10 7.33H8.67V6C8.67 6.74 9.26 7.33 10 7.33z" fill="currentColor" />
                <path d="M6 8.67h1.33V10c0-.74-.59-1.33-1.33-1.33z" fill="currentColor" />
                <path d="M10 8.67H8.67V10c0-.74.59-1.33 1.33-1.33z" fill="currentColor" />
              </svg>
            </span>
          </button>
        </div>
      </header>

      {/* center stage */}
      <section className="hero">
        <SocialPulse initial={pulseInitial} />
        <h1 className="hero-title">
          {/* 纯文本流：VIBE / [烧杯=L] / AB 同一 line box，天然同基线 */}
          <span className="hero-vibe">Vibe</span>
          <LabFlaskL />
          <span className="hero-ab">AB</span>
        </h1>
        <p className="hero-slogan">
          <span className="hero-slogan-en">
            <span className="s-txt">Build</span>
            <RotatingText words={["Tools", "Tutorials", "Skills", "Agents", "Labs"]} />
            <span className="s-txt">with Vibe Lab</span>
          </span>
          <span className="hero-slogan-cn">
            给野路子 AI 玩家的资源门户与实战训练营 · 先上车，再上轨道
          </span>
        </p>
        <span className="hero-hint">点击 Menu 进入</span>
      </section>

      {/* fullscreen wipe menu */}
      <div className="mnav" ref={navRef} data-nav="closed">
        <div className="mnav-overlay" data-menu-toggle ref={overlayRef} />
        <nav className="menu" ref={menuRef} aria-label="主导航">
          <div className="menu-bg" aria-hidden="true">
            <div className="bg-panel bg-panel--ink" />
            <div className="bg-panel bg-panel--paper" />
            <div className="bg-panel bg-panel--base" />
          </div>
          <div className="menu-inner">
            <ul className="menu-list">
              {MENU_LINKS.map((l) => (
                <li className="menu-item" key={l.href}>
                  <a
                    className="menu-link"
                    href={l.href}
                    onClick={(e) => {
                      if (l.href === "/courses") {
                        e.preventDefault();
                        setGate(true);
                      }
                    }}
                  >
                    <span className="menu-link-title">{l.label}</span>
                    <span className="menu-link-no">{l.no}</span>
                    <span className="menu-link-wipe" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="menu-foot" data-menu-fade>
              <p className="menu-foot-label">Follow / 关注</p>
              <div className="menu-foot-row">
                {SOCIALS.map((s) =>
                  s.kind === "popup" ? (
                    <span
                      className={"socpop" + (openSocial === s.label ? " is-open" : "")}
                      key={s.label}
                      onMouseEnter={() => setOpenSocial(s.label)}
                      onMouseLeave={() => setOpenSocial((cur) => (cur === s.label ? null : cur))}
                    >
                      <button
                        type="button"
                        className="text-link text-link--btn"
                        onClick={() => setOpenSocial(s.label)}
                        aria-expanded={openSocial === s.label}
                      >
                        {s.label}
                      </button>
                      {openSocial === s.label && (
                        <span
                          className={"socpop-card" + (s.label === "抖音" ? " socpop-card--dy" : "")}
                          role="tooltip"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.cardImg} alt={`${s.label} 名片`} />
                        </span>
                      )}
                    </span>
                  ) : (
                    <a className="text-link" href={s.href} key={s.label}>
                      {s.label}
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>

      <p className="corner-note">
        © 2026 VIBE LAB · <a href="/contact">联系与合作</a>
      </p>
      </main>

      {gate && (
        <CourseGate
          onClose={() => setGate(false)}
          onGo={() => {
            setGate(false);
            window.location.href = "/courses";
          }}
        />
      )}
    </>
  );
}