"use client";

import { useMemo, useState } from "react";
import type { WoolGate, WoolItem } from "@/data/wool";
import { WOOL_GATES } from "@/data/wool";
import styles from "./wool.module.css";

/** 服务端已把 tools.ts 的 logo 解析好塞进来，客户端不必打包整个资源库 */
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

  const list = useMemo(() => {
    return items
      .filter((i) => (showDead ? true : i.validity !== "已失效"))
      .filter((i) => (gate === "全部" ? true : i.gate === gate))
      .sort((a, b) => b.weight - a.weight);
  }, [items, gate, showDead]);

  const live = items.filter((i) => i.validity !== "已失效").length;
  const dead = items.length - live;
  const easy = items.filter((i) => i.gate === "零门槛" && i.validity !== "已失效").length;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Free quota · 白嫖专区</p>
        <h1 className={styles.title}>羊毛专区</h1>
        <p className={styles.lede}>
          资源库只告诉你「这个能用」，这里只回答一件事：<strong>能白嫖多少、门槛多高、什么时候过期</strong>。
          每条都标了核实日期，薅之前先看一眼，别白跑。
        </p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{live}</span>
            <span className={styles.statLabel}>当前可薅</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{easy}</span>
            <span className={styles.statLabel}>零门槛</span>
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
          </button>
        ))}
        <button
          type="button"
          className={styles.filter + (showDead ? " " + styles.filterOn : "")}
          onClick={() => setShowDead((v) => !v)}
          style={{ marginLeft: "auto" }}
        >
          {showDead ? "隐藏已失效" : "显示已失效"}
        </button>
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
              <article
                key={item.id}
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

                <a
                  className={styles.cta}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  去领取
                  <ArrowIcon />
                </a>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
