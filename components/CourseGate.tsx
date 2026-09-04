"use client";

import Link from "next/link";
import InviteForm from "./InviteForm";

/**
 * 训练营课程台 · 第一道锁弹窗（导航点「🔒 训练营」时弹出）
 * 输对邀请码 → onGo 进入课程台；未输对无法直接进入。
 * 说明：训练营为付费课程台；想先了解/体验 → 联系管理员拿邀请码试看体验课；或直接付费。
 */
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
          <span className="lk" style={{ fontSize: 26 }}>
            🔐
          </span>
        </div>
        <h2>训练营 · 付费课程台</h2>

        <p className="navgate-what">
          这里不是营销介绍页，是<b>真的看课的地方</b>。训练营课程为付费内容，进入课程台需要邀请码。
        </p>

        <div className="navgate-block">
          <div className="navgate-block-title">🔑 两种进来方式</div>
          <ul className="navgate-list navgate-rules">
            <li>
              <span>🎟</span> <b>先体验</b>：联系管理员免费获取「邀请码」→ 进入后可试看每个课包的体验课
            </li>
            <li>
              <span>💰</span> <b>直接报名</b>：确定要学 → 联系管理员按档位付费，付款后发放「邀请码 + 解锁码」，解锁全部课程（永久回看）
            </li>
          </ul>
        </div>

        <InviteForm onDone={onGo} />

        <div className="navgate-foot">
          想报名 / 拿邀请码？
          <Link href="/contact" onClick={onClose}>
            联系管理员（微信 / 邮件）↗
          </Link>
        </div>

        <div className="navgate-actions">
          <button type="button" className="navgate-btn navgate-btn--ghost" onClick={onClose}>
            先不去了
          </button>
        </div>
      </div>
    </div>
  );
}
