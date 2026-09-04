import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe Lab · 振动实验室 — 给野路子 AI 玩家的资源门户与实战训练空间",
  description:
    "Vibe Lab · 振动实验室：AI 工具库 × 精选教程库 × 实战训练营。不灌理论，直接上手，亲手做出能上线的 AI 作品。",
};

export const viewport: Viewport = {
  themeColor: "#efede8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}