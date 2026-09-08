"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { WoolGate, WoolItem } from "@/data/wool";
import { WOOL_GATES, freshnessOf, FRESHNESS_TEXT } from "@/data/wool";
import WoolSubmit from "./WoolSubmit";
import styles from "./wool.module.css";

/** 服务端已把 tools.ts 的 logo 解析好塞进来，客户端不必打包整个工具库 */
export type WoolCard = WoolItem & { logo: string | null };

function ArrowIcon() {
  return (
    <svg
      className={styles.ctaArrow}
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 3h8v8M13 3L3 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function WoolClient({ items }: { items: WoolCard[] }) {
  const [gate, setGate] = useState<WoolGate | "全部">("全部");
  const [showDead, setShowDead] = useState(false);
  const [sort, setSort] = useState<"weight" | "fresh">("weight");
  /** 点阵列数按容器实际宽度动态算（每列 5.5px = 4 点 + 1.5 间隔），
      3 行 × N 列连续大网格，无缝贴边铺满 */
  const loaderRef = useRef<HTMLSpanElement>(null);
  const [cols, setCols] = useState(24);

  /** 服务端渲染与客户端 hydration 用同一个「今天」，避免水合不一致 */
  const today = useMemo(() => new Date(), []);

  const list = useMemo(() => {
    return items
      .filter((i) => (showDead ? true : i.validity !== "已失效"))
      .filter((i) => (gate === "全部" ? true : i.gate === gate))
      .sort((a, b) =>
        sort === "fresh"
          ? Date.parse(b.checkedAt) - Date.parse(a.checkedAt)
          : b.weight - a.weight,
      );
  }, [items, gate, showDead, sort]);

  /** 当前池子 = 筛选前的候选集，用于算每个门槛下有几条（含/不含失效随开关走） */
  const pool = useMemo(
    () => items.filter((i) => (showDead ? true : i.validity !== "已失效")),
    [items, showDead],
  );
  const countOf = (g: WoolGate | "全部") =>
    g === "全部" ? pool.length : pool.filter((i) => i.gate === g).length;

  const easy = items.filter((i) => i.gate === "零门槛" && i.validity !== "已失效").length;
  const live = pool.length;
  const dead = items.length - live;
  /** 该复核的条数 —— 超过 30 天没核实过就催一下，别让人拿着过期信息白跑 */
  const due = pool.filter((i) => freshnessOf(i.checkedAt, today) !== "fresh").length;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        {/* 返回按钮挂右上角，与 ai-tools / skills 二级页同款位置 */}
        <Link
          href="/tools"
          className="skill-empty-btn"
          style={{ textDecoration: "none", position: "absolute", top: 18, right: 18 }}
        >
          ← 返回资源库
        </Link>
        <div className={styles.heroLeft}>
          <p className={styles.eyebrow}>FREE QUOTA</p>
          <h1 className={styles.title}>羊毛福利专区</h1>
          <p className={styles.titleEn}>WOOL ZONE</p>
          <p className={styles.lede}>
            工具库只告诉你「这个能用」，这里只回答一件事：<strong>能白嫖多少、门槛多高、什么时候过期</strong>。
            每条都标了核实日期，薅之前先看一眼，别白跑。
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{live}</span>
            <span className={styles.statLabel}>当前可薅</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{easy}</span>
            <span className={styles.statLabel}>零门槛</span>
          </div>
          <div className={styles.stat + (due > 0 ? " " + styles.statDue : "")}>
            <span className={styles.statNum}>{due}</span>
            <span className={styles.statLabel}>待复核</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{dead}</span>
            <span className={styles.statLabel}>已失效（留档）</span>
          </div>
        </div>
      </header>

      <div className={styles.filters}>
        {(["全部", ...WOOL_GATES] as const).map((g) => (
          <button
            key={g}
            type="button"
            className={styles.filter + (gate === g ? " " + styles.filterOn : "")}
            onClick={() => setGate(g as WoolGate | "全部")}
          >
            {g}
            <span className={styles.filterNum}>{countOf(g)}</span>
          </button>
        ))}
        <div className={styles.tools}>
          <button
            type="button"
            className={styles.filter + (sort === "fresh" ? " " + styles.filterOn : "")}
            onClick={() => setSort((s) => (s === "weight" ? "fresh" : "weight"))}
          >
            {sort === "fresh" ? "按核实时间排" : "按价值排"}
          </button>
          <button
            type="button"
            className={styles.filter + (showDead ? " " + styles.filterOn : "")}
            onClick={() => setShowDead((v) => !v)}
          >
            {showDead ? "隐藏已失效" : "显示已失效"}
          </button>
          <WoolSubmit />
        </div>
      </div>

      {list.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>这个筛选下暂时没有羊毛</p>
          <p className={styles.emptyDesc}>换个门槛看看，或者把「显示已失效」打开。</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {list.map((item) => {
            const isDead = item.validity === "已失效";
            return (
              <Link
                key={item.id}
                href={`/wool/${item.id}`}
                className={styles.card + (isDead ? " " + styles.cardDead : "")}
              >
                <div className={styles.cardTop}>
                  {item.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.logo}
                      src={`/assets/tool-logos/${item.logo}`}
                      alt={`${item.name} logo`}
                      width={34}
                      height={34}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className={styles.logoFallback} aria-hidden="true">
                      {item.name.charAt(0)}
                    </span>
                  )}
                  <span className={styles.name}>{item.name}</span>
                </div>

                <p className={styles.quota}>{item.quota}</p>

                <div className={styles.tags}>
                  <span className={styles.tag}>{item.gate}</span>
                  <span className={styles.tag + (isDead ? " " + styles.tagDead : " " + styles.tagLive)}>
                    {item.validity}
                    {item.deadline ? ` · ${item.deadline}` : ""}
                  </span>
                </div>

                <p className={styles.body}>{item.how}</p>

                {item.trap ? <p className={styles.trap}>坑点：{item.trap}</p> : null}

                <span
                  className={`${styles.checked} ${
                    styles[freshnessOf(item.checkedAt, today)]
                  }`}
                  title={`${FRESHNESS_TEXT[freshnessOf(item.checkedAt, today)]} · 最后核实 ${item.checkedAt}`}
                >
                  <i className={styles.dot} aria-hidden="true" />
                  核实于 {item.checkedAt.slice(5).replace("-", "/")}
                </span>

                <span className={styles.cta}>
                  <span className={styles.ctaLoader} aria-hidden="true" ref={loaderRef}>
                    {/* 随机律动：每颗点独立的随机时长/延迟（确定性哈希，SSR 一致），
                        缩放 + 透明度随机起伏；3 行 × N 列铺满整个长框 */}
                    {Array.from({ length: cols * 3 }, (_, i) => {
                      // 确定性伪随机（i 的哈希），不用 Math.random 防 hydration 不一致
                      const h1 = ((i * 2654435761) % 4294967296) / 4294967296;
                      const h2 = ((i * 2246822519) % 4294967296) / 4294967296;
                      const dur = 480 + h1 * 920;   // 480~1400ms 随机节奏
                      const delay = h2 * 760;       // 0~760ms 随机起相
                      return (
                        <i
                          key={i}
                          className={styles.ctaDot}
                          style={{
                            animationDuration: `${dur}ms`,
                            animationDelay: `${delay}ms`,
                          }}
                        />
                      );
                    })}
                  </span>
                  <span className={styles.ctaText}>查看详情</span>
                  <ArrowIcon />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
