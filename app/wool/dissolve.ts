import styles from "./dissolve.module.css";

/** 消散动画总时长（ms）——粒子飘完调用方才真正发删除请求 */
export const DISSOLVE_MS = 1600;

/**
 * 鸿蒙式粒子消散（2026-09-07）
 * 原理：把元素内所有文本节点逐字拆成 span 粒子（textContent 赋值，无 XSS），
 * 每个粒子带随机方向/旋转/延迟的 CSS 动画向上飘散淡出；再沿元素随机
 * 撒一撮三色小方块碎片（墨黑/毛灰/品牌紫）。
 * 详情页交流区与管理员后台 /wool/admin 共用。
 */
export function dissolveElement(el: HTMLElement): Promise<void> {
  // 粒子和碎片的定位锚点
  if (getComputedStyle(el).position === "static") {
    el.style.position = "relative";
  }
  el.classList.add(styles.dissolving);

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);

  let i = 0;
  texts.forEach((t) => {
    const content = t.textContent || "";
    if (!content.trim()) return;
    const frag = document.createDocumentFragment();
    for (const ch of content) {
      const s = document.createElement("span");
      s.textContent = ch;
      s.className = styles.chip;
      s.style.setProperty("--dx", `${(Math.random() * 2 - 1) * 90}px`);
      s.style.setProperty("--dy", `${-(24 + Math.random() * 120)}px`);
      s.style.setProperty("--rot", `${(Math.random() * 2 - 1) * 260}deg`);
      // 从左往右扫 + 随机抖动，cap 在 600ms，别让长文本拖太久
      s.style.setProperty("--d", `${Math.min(i * 3, 600) + Math.random() * 220}ms`);
      frag.appendChild(s);
      i++;
    }
    t.parentNode?.replaceChild(frag, t);
  });

  // 沿元素随机撒方块碎片
  const rect = el.getBoundingClientRect();
  const palette = ["#131313", "#CFC7B4", "#5b4be6"];
  for (let k = 0; k < 16; k++) {
    const shard = document.createElement("i");
    shard.className = styles.shard;
    const size = 3 + Math.random() * 7;
    shard.style.cssText =
      `width:${size}px;height:${size}px;` +
      `left:${Math.random() * rect.width}px;top:${Math.random() * rect.height}px;` +
      `background:${palette[k % 3]};` +
      `--dx:${(Math.random() * 2 - 1) * 90}px;` +
      `--dy:${-(20 + Math.random() * 100)}px;` +
      `--rot:${(Math.random() * 2 - 1) * 320}deg;` +
      `--d:${Math.random() * 380}ms;`;
    el.appendChild(shard);
  }

  return new Promise((resolve) => setTimeout(resolve, DISSOLVE_MS));
}
