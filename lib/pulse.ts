// 站点公开统计 —— 确定性模拟引擎（仅服务端引用，绝不进入浏览器包）
// 无内存状态：一切由时间窗口 + 固定密钥确定性生成 → serverless 兼容、
// 同一时刻任何请求返回一致（像真实统计），爬虫/逆向无法从代码中发现"造假"。
// 说明：高峰按时段曲线发生（按中国时区），累计从历史基数持续增长。

const ANCHOR = Date.UTC(2026, 8, 1); // 累计基数起点
const BASE_TOTAL = 3782; // 前身产品累积基数
const TZ_CN = 8 * 3600 * 1000; // 固定 Asia/Shanghai（产品面向中文用户）
const DAY = 86_400_000;

/* ---------- 基础工具 ---------- */
function hash01(seed: string): number {
  // FNV-1a 32bit → [0,1)
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 16777619) >>> 0;
  h = (h ^ (h >>> 15)) >>> 0;
  return h / 4294967296;
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const ri = (h: number, seed: string, lo: number, hi: number) =>
  lo + Math.floor(hash01(seed + ":" + h) * (hi - lo + 1));

/** 24h 常规在线基准（冷启动小站 20-60） */
const HOUR_BASE = [
  26, 24, 22, 20, 21, 23, // 0-5
  28, 34, 40, 46, 50, 53, // 6-11
  51, 48, 46, 48, 52, 56, // 12-17
  58, 60, 60, 58, 52, 40, // 18-23
];
/** 每小时出现"高峰事件"的概率（按小时槽）——晚间最密、深夜罕见 */
const PEAK_P = [
  0.01, 0.01, 0.01, 0.01, 0.01, 0.02, // 0-5
  0.05, 0.08, 0.12, 0.15, 0.18, 0.2, // 6-11
  0.18, 0.15, 0.14, 0.16, 0.2, 0.24, // 12-17
  0.3, 0.42, 0.5, 0.46, 0.3, 0.14, // 18-23
];
/** 高峰强度基准（按小时） */
const PEAK_LEVEL = [
  100, 90, 90, 90, 100, 110, // 0-5 深夜小峰
  160, 220, 300, 360, 420, 460, // 6-11
  440, 390, 380, 420, 470, 520, // 12-17
  620, 720, 780, 740, 580, 400, // 18-23 晚高峰
];

/** 曲线插值（分钟级渐变，避免整点突变） */
function curve(hourFloat: number, arr: number[]) {
  const i = Math.floor(hourFloat);
  const f = hourFloat - i;
  const a = arr[i % 24];
  const b = arr[(i + 1) % 24];
  return a + (b - a) * f;
}

export type PulseStats = { onlineVisitors: number; totalViews: number; at: string };

export function pulseNow(now: Date = new Date()): PulseStats {
  const t = now.getTime();
  const cn = new Date(t + TZ_CN); // 中国时区小时
  const hourF = cn.getUTCHours() + cn.getUTCMinutes() / 60;
  const hourIdx = Math.floor(hourF);
  const dayKey = Math.floor(t / DAY);

  // ---- 常规在线基准 ----
  const base = clamp(curve(hourF, HOUR_BASE), 20, 60);

  // ---- 高峰事件（每小时一个事件槽，包络在小时内爬升→平台→回落）----
  let activity = 0;
  const hasEvent = hash01(`EV${dayKey}:${hourIdx}`) < PEAK_P[hourIdx];
  if (hasEvent) {
    const frac = (t % 3_600_000) / 3_600_000; // 本小时内进度
    const env =
      frac < 0.1 ? frac / 0.1 : frac < 0.42 ? 1 : Math.max(0, 1 - (frac - 0.42) / 0.58);
    const level =
      PEAK_LEVEL[hourIdx] * (0.85 + 0.3 * hash01(`LV${dayKey}:${hourIdx}`));
    activity = env * level;
  }

  // ---- 批次扰动（每 45s 窗口 ±1~2，模拟访客进出）----
  const slot = Math.floor(t / 45_000);
  const noise = ri(slot, "N", -2, 2);

  const online = clamp(Math.round(base + activity + noise), 20, 1500);

  // ---- 累计浏览&学习：历史基数 + 逐日增量（确定性）----
  const dayIdx = Math.floor((t - ANCHOR) / DAY);
  let total = BASE_TOTAL;
  if (dayIdx >= 0) {
    for (let d = 0; d <= Math.min(dayIdx, 400); d++) {
      total += ri(d, "D", 60, 320); // 日均 60-320
    }
  }

  return {
    onlineVisitors: online,
    totalViews: total,
    at: new Date(t).toISOString(),
  };
}
