import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WOOL } from "@/data/wool";
import { TOOLS } from "@/data/tools";
import WoolTalk from "./WoolTalk";
import styles from "./detail.module.css";

export const dynamic = "force-dynamic";

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
  需验证: "要完成学生 / 教师 / 身份认证",
  需外网: "需要非大陆网络环境",
  需订阅: "要先有付费订阅才送",
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

      <section className={styles.block}>
        <h2 className={styles.blockTitle}>信息时效</h2>
        <p className={styles.blockBody}>
          本条信息最后核实于 <strong>{item.checkedAt}</strong>
          {item.deadline ? `，截止时间 ${item.deadline}` : ""}。
          羊毛信息过期极快，动手前建议先点上面的链接确认官网还挂着这个额度。
        </p>
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
