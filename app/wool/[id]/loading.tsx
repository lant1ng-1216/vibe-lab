import styles from "./detail.module.css";

/**
 * 详情页加载骨架
 * 点击卡片后立刻给出页面形状，别让用户盯着白屏等服务端。
 * 静态化之后大多数情况一闪而过，但在冷启动 / 慢网下这一步很值。
 */
export default function Loading() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="加载中">
      <span className={styles.skBack} />

      <div className={styles.skHero}>
        <span className={styles.skLine} style={{ width: "42%", height: "1.6rem" }} />
        <span className={styles.skLine} style={{ width: "62%", height: "2.4rem" }} />
        <span className={styles.skLine} style={{ width: "34%" }} />
      </div>

      <div className={styles.skBlock}>
        <span className={styles.skLine} style={{ width: "22%" }} />
        <span className={styles.skLine} style={{ width: "100%" }} />
        <span className={styles.skLine} style={{ width: "78%" }} />
      </div>

      <div className={styles.skBlock}>
        <span className={styles.skLine} style={{ width: "22%" }} />
        <span className={styles.skLine} style={{ width: "90%" }} />
      </div>
    </div>
  );
}
