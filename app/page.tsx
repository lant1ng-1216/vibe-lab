import type { Metadata } from "next";
import LandingExperience, { type PulseInit } from "@/components/LandingExperience";
import { pulseNow } from "@/lib/pulse";

export const metadata: Metadata = {
  title: "Vibe Lab · 振动实验室 — AI 工具 / 教程 / 训练营",
  description:
    "Vibe Lab：AI 资源门户 + 实战训练营。装齐 AI 工具的箱子、整本可读的开源教程、亲手做出作品的课程台。",
};

export default function Page() {
  // SSR 首屏即输出真实外观的数字（服务端计算），浏览器后续轮询 /api/pulse
  const pulse = pulseNow() as PulseInit;
  return <LandingExperience pulseInitial={pulse} />;
}
