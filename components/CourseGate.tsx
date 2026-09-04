"use client";

import Link from "next/link";

/** 训练营入口确认弹窗：进入课程台前说明「这是什么 + 观看规则」 */
export default function CourseGate({
  onClose,
  onGo,
}: {
  onClose: () => void;
  onGo: () => void;
}) {
  return (
    <div className="navgate-mask" onClick={onClose} role="dialog" aria-modal="true">
      <div className="navgate" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="navgate-x" aria-label="关闭" onClick={onClose}>
          ✕
        </button>
        <div className="navgate-flask" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/flasks/green_1.png" alt="" width={40} height={40} />
        </div>
        <h2>训练营课程台 · 进门前请先看</h2>

        <p className="navgate-what">
          你即将进入的是<b>训练营的录播课底座</b>——不是营销介绍页，而是真的在浏览器里看课的地方。
        </p>

        <div className="navgate-block">
          <div className="navgate-block-title">📚 这个页面里有什么</div>
          <ul className="navgate-list">
            <li><span>🔰</span> Starter · 基础课 <b>3 节</b></li>
            <li><span>🚀</span> Builder · 进阶课 <b>6 节</b></li>
            <li><span>🎯</span> Hacker · 全套 + 创始人 1v1 带打</li>
            <li><span>🎁</span> AI 提效入门 · 小课 <b>2 节</b></li>
            <li><span>🧪</span> 提示词实战 · 小课 <b>4 节</b>（含 AI 提效入门）</li>
          </ul>
        </div>

        <div className="navgate-block">
          <div className="navgate-block-title">🔐 观看规则与限制</div>
          <ul className="navgate-list navgate-rules">
            <li><span>🆓</span> <b>不花钱也能看</b>：每个课包都开放了 1 节「体验课」可免费试看</li>
            <li><span>💰</span> <b>付费解锁</b>：报名后获得解锁码，输入后该课包永久观看</li>
            <li><span>🧪</span> <b>当前为轻量解锁</b>：解锁状态存于本浏览器，换设备/清缓存会丢；正式售卖将升级账号体系</li>
            <li><span>📞</span> 报名 / 价格 · <Link href="/join" onClick={onClose}>报名页 ↗</Link></li>
          </ul>
        </div>

        <div className="navgate-actions">
          <button type="button" className="navgate-btn navgate-btn--ghost" onClick={onClose}>
            先不去了
          </button>
          <button type="button" className="navgate-btn navgate-btn--main" onClick={onGo}>
            知道了，去看体验课 →
          </button>
        </div>
      </div>
    </div>
  );
}
