"use client";

import Link from "next/link";
import InviteForm from "./InviteForm";

/**
 * 课程台锁态页：直接访问 /courses 且没有有效邀请码 / 解锁时显示。
 * 内容不裸奔——课程数据不在此界面渲染。
 */
export default function CourseLock({ onOk }: { onOk: () => void }) {
  return (
    <div className="course-lock">
      <div className="course-wrap course-wrap--narrow">
        <div className="course-lock-card">
          <span className="lk course-lock-icon" aria-hidden="true">
            🔐
          </span>
          <h1 className="course-lock-title">
            训练营课程台
            <br />
            <span className="hl">需要邀请码</span>
          </h1>
          <p className="course-lock-lead">
            训练营课程为付费内容。想先体验，联系管理员免费获取邀请码，
            进入后可以试看每个课包的「体验课」；确定要学，付款后解锁全部课程。
          </p>

          <div className="course-lock-box">
            <InviteForm onDone={onOk} />
          </div>

          <p className="course-lock-foot mono">
            管理员发放时会同时提供「邀请码」与课包「解锁码」——先输邀请码进门，进门后再用解锁码解锁课程。
            <br />
            还没有邀请码？
            <Link href="/contact">
              联系管理员（微信 / 邮件）↗
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
