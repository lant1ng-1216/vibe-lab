"use client";

import { useState } from "react";

/** 邀请码存储 key（课程台第一道锁的通行凭据，浏览器本地记住） */
export const INVITE_KEY = "vlab.invite";

export function hasInvite(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem(INVITE_KEY);
  } catch {
    return false;
  }
}

/** 邀请码输入表单（弹窗 / 课程台锁态页共用） */
export default function InviteForm({
  onDone,
  placeholder = "输入邀请码",
  submitLabel = "进入课程台",
  hint = "还没有邀请码？联系管理员免费获取（微信 / 邮件）。",
}: {
  onDone: () => void;
  placeholder?: string;
  submitLabel?: string;
  hint?: string;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    const c = code.trim();
    if (!c || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/verify-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        try {
          localStorage.setItem(INVITE_KEY, String(Date.now()));
        } catch {
          /* ignore */
        }
        onDone();
      } else {
        setErr(data.error || "邀请码不正确，请核对后重试。");
      }
    } catch {
      setErr("网络异常，请稍后再试。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="invite">
      <div className="invite-row">
        <input
          className="invite-input"
          value={code}
          placeholder={placeholder}
          onChange={(e) => {
            setCode(e.target.value);
            setErr(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoComplete="off"
          aria-label="邀请码"
        />
        <button type="button" className="invite-btn" onClick={submit} disabled={busy}>
          {busy ? "验证中…" : submitLabel}
        </button>
      </div>
      {err && <p className="invite-err" role="alert">{err}</p>}
      <p className="invite-hint mono">{hint}</p>
    </div>
  );
}
