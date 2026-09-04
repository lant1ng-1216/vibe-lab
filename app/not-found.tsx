"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.4rem",
        textAlign: "center",
        background: "#efede8",
        color: "#131313",
        fontFamily:
          '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
        padding: "2rem",
      }}
    >
      <p
        style={{
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: "0.78rem",
          letterSpacing: "0.3em",
          color: "#5b4be6",
        }}
      >
        VIBE LAB
      </p>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
        这一页还在搭建中
      </h1>
      <p style={{ color: "rgba(19,19,19,.6)", fontSize: "0.95rem", margin: 0 }}>
        我们正在一个页面一个页面地打磨，敬请期待。
      </p>
      <Link
        href="/"
        style={{
          marginTop: "0.6rem",
          padding: "0.7em 1.6em",
          background: "#131313",
          color: "#efede8",
          borderRadius: "2em",
          fontSize: "0.9rem",
          textDecoration: "none",
        }}
      >
        返回首页
      </Link>
    </main>
  );
}
