"use client";

import { useEffect, useRef, useState } from "react";

/** Landing 社交证明条（客户端展示层）
 *  数据全部来自服务端统计：SSR 首屏值 + 轮询 GET /api/pulse
 *  本组件不含任何模拟逻辑 —— 只负责把接口返回的数字平滑滚动展示。 */
const SEEDS = ["Aiden", "Brooklyn", "Cassidy", "Destiny", "Eden", "Finley"];

type Stats = { onlineVisitors: number; totalViews: number };

export default function SocialPulse({ initial }: { initial?: Partial<Stats> }) {
  const [online, setOnline] = useState(initial?.onlineVisitors ?? 0);
  const [total, setTotal] = useState(initial?.totalViews ?? 0);

  const target = useRef({ o: online, t: total });
  const rafRef = useRef(0);

  useEffect(() => {
    target.current = { o: online, t: total };
  }, [online, total]);

  // —— 轮询统计接口（每 8s），数字向新值平滑滚动 ——
  useEffect(() => {
    let alive = true;
    const fetchPulse = async () => {
      try {
        const res = await fetch("/api/pulse", { cache: "no-store" });
        if (!res.ok) return;
        const d = (await res.json()) as Stats;
        if (!alive) return;
        if (typeof d.onlineVisitors === "number") target.current.o = d.onlineVisitors;
        if (typeof d.totalViews === "number") target.current.t = d.totalViews;
      } catch {
        /* 网络失败静默，保留当前值 */
      }
    };

    // 先立刻同步一次，再进入周期轮询
    fetchPulse();
    const id = setInterval(fetchPulse, 8000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // —— 平滑逼近（0.5s ~ 1.2s 过渡，绝不瞬跳）——
  useEffect(() => {
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.4);
      last = now;
      setOnline((cur) => {
        const d = target.current.o - cur;
        return Math.abs(d) < 0.05 ? target.current.o : cur + d * Math.min(1, dt * 2.4);
      });
      setTotal((cur) => {
        const d = target.current.t - cur;
        return Math.abs(d) < 0.05 ? target.current.t : cur + d * Math.min(1, dt * 1.6);
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="pulse" aria-label="站点动态">
      <div className="pulse-block">
        <div className="pulse-avatars">
          {SEEDS.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s}
              className="pulse-av pulse-av--art"
              style={{ animationDelay: `${i * 0.42}s` }}
              src={`/assets/avatars/voxel-art/${s}.svg`}
              alt=""
              width={38}
              height={38}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="pulse-meta">
          <span className="pulse-live" aria-hidden="true" />
          <span className="pulse-num">{Math.round(online).toLocaleString("en-US")}</span>
          <span className="pulse-label">当前在线</span>
        </div>
      </div>

      <span className="pulse-divider" aria-hidden="true" />

      <div className="pulse-block">
        <div className="pulse-avatars">
          {SEEDS.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s}
              className="pulse-av pulse-av--bot"
              style={{ animationDelay: `${i * 0.5}s` }}
              src={`/assets/avatars/voxel-bot/${s}.svg`}
              alt=""
              width={38}
              height={38}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="pulse-meta">
          <span className="pulse-num">{Math.round(total).toLocaleString("en-US")}+</span>
          <span className="pulse-label">累计浏览 & 学习</span>
        </div>
      </div>
    </div>
  );
}
