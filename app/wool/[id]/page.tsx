import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WOOL, freshnessOf, FRESHNESS_TEXT } from "@/data/wool";
import { TOOLS } from "@/data/tools";
import WoolTalk from "./WoolTalk";
import styles from "./detail.module.css";

/**
 * 详情页内容是静态的（数据来自 data/wool.ts 常量），走静态生成 + 每小时增量更新。
 * 之前这里写的是 force-dynamic —— 每点一次都要服务端现渲染一遍，白等一秒多。
 * 保留 revalidate 是为了让「新鲜度」随时间变化：构建后最多滞后一小时，
 * 但访问到的是静态 HTML，点击即开。
 */
export const revalidate = 3600;

/**
 * 关闭动态参数：羊毛条目是 data/wool.ts 里的固定常量，不存在运行时新增。
 * 不关的话，访问 /wool/不存在的id 会走动态渲染 —— notFound() 虽然渲染出 404 页面，
 * 但 HTTP 状态码返回 200，而且这个错误响应还会被 ISR 缓存下来。
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return WOOL.map((w) => ({ id: w.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = WOOL.find((w) => w.id === id);
  if (!item) return { title: "未找到 — Vibe Lab" };
  return {
    title: `${item.name} ${item.quota} — 羊毛福利专区 — Vibe Lab · 振动实验室`,
    description: item.how,
  };
}

const GATE_DESC: Record<string, string> = {
  零门槛: "注册就能拿，不用额外验证",
  需学生: "要完成学生 / 教师身份认证，毕业或认证过期即失效",
  需绑卡: "要绑信用卡或支付方式，留意到期自动扣款",
  需外网: "需要非大陆网络环境",
};

export default async function WoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = WOOL.find((w) => w.id === id);
  if (!item) notFound();

  const tool = item.toolId ? TOOLS.find((t) => t.id === item.toolId) : undefined;
  const isDead = item.validity === "已失效";
  const fresh = freshnessOf(item.checkedAt);

  return (
    <div className={styles.page}>
      <Link href="/wool" className={styles.back}>
        ← 返回羊毛福利专区
      </Link>

      <header className={styles.hero + (isDead ? " " + styles.heroDead : "")}>
        <div className={styles.heroTop}>
          <h1 className={styles.name}>{item.name}</h1>
          <div className={styles.tags}>
            <span className={styles.tagGate}>{item.gate}</span>
            <span className={styles.tag + (isDead ? " " + styles.tagDead : " " + styles.tagLive)}>
              {item.validity}
              {item.deadline ? ` · ${item.deadline}` : ""}
            </span>
          </div>
        </div>

        <p className={styles.quota}>{item.quota}</p>
        <p className={styles.gateDesc}>{GATE_DESC[item.gate] ?? ""}</p>
        <p className={`${styles.checked} ${styles[fresh]}`}>
          <i className={styles.dot} aria-hidden="true" />
          核实于 {item.checkedAt} · {FRESHNESS_TEXT[fresh]}
        </p>

        <a
          className={styles.cta}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {isDead ? "去看看现状" : "去领取"}
        </a>
      </header>

      <section className={styles.block}>
        <h2 className={styles.blockTitle}>怎么领</h2>
        <p className={styles.blockBody}>{item.how}</p>
      </section>

      {item.trap ? (
        <section className={styles.block + " " + styles.blockTrap}>
          <h2 className={styles.blockTitle}>坑点</h2>
          <p className={styles.blockBody}>{item.trap}</p>
        </section>
      ) : null}

      <section className={styles.block + (fresh === "old" ? " " + styles.blockDue : "")}>
        <h2 className={styles.blockTitle}>信息时效</h2>
        <p className={styles.blockBody}>
          {fresh === "fresh"
            ? `这条 ${item.checkedAt} 核实过。羊毛额度变动快，动手前还是扫一眼官网最稳。`
            : `这条上次核实是 ${item.checkedAt}，放了一阵了 —— 额度可能变了甚至没了，动手前务必先点上面的链接确认官网还挂着。`}
          {item.deadline ? ` 官方标注截止 ${item.deadline}。` : ""}
        </p>
        {item.source ? (
          <p className={styles.srcLine}>
            来源：
            <a
              className={styles.link}
              href={item.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.source}
            </a>
          </p>
        ) : null}
      </section>

      {tool ? (
        <section className={styles.block}>
          <h2 className={styles.blockTitle}>关于这个工具</h2>
          <p className={styles.blockBody}>{tool.desc}</p>
        </section>
      ) : null}

      <WoolTalk woolId={item.id} woolName={item.name} />
    </div>
  );
}
