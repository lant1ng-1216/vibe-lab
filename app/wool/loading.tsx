import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import styles from "./wool.module.css";

/**
 * 列表页跳转骨架 —— 从主站其他页点进羊毛专区时的过渡画面。
 * 结构完全模拟 page.tsx（SiteNav + main + SiteFooter），导航栏不闪。
 * 骨架类追加在 wool.module.css 的「跳转加载骨架」区块。
 */
export default function Loading() {
  return (
    <>
      <SiteNav />
      <main>
        <div className={styles.page}>
          {/* Hero：标题 + 统计格 */}
          <div className={styles.skHero} aria-hidden="true">
            <div>
              <span className={styles.skTitle} style={{ display: "block" }} />
              <span
                className={styles.skTitleSub}
                style={{ display: "block" }}
              />
            </div>
            <div className={styles.skStats}>
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className={styles.skStat} />
              ))}
            </div>
          </div>

          {/* 筛选条 */}
          <div className={styles.skFilters} aria-hidden="true" />

          {/* 卡片网格 */}
          <div className={styles.skGrid} aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skCard}>
                <span className={styles.skLine} style={{ width: "38%" }} />
                <span
                  className={styles.skLine}
                  style={{ width: "62%", height: "1.3rem" }}
                />
                <span className={styles.skLine} style={{ width: "30%" }} />
                <span className={styles.skLine} style={{ width: "90%" }} />
                <span className={styles.skLine} style={{ width: "55%" }} />
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
