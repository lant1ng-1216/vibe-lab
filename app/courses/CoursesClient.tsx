"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CoursePack, Lesson, PackKey, Unlocks } from "@/data/courses";
import {
  COURSE_PACKS,
  MAIN_PACKS,
  MINI_PACKS,
  MAIN_ORDER,
  PACK_LABEL,
  UNLOCK_CODES,
  hasPack,
} from "@/data/courses";
import CourseLock from "@/components/CourseLock";
import { hasInvite } from "@/components/InviteForm";

const STORE_KEY = "vlab.unlocks";

function readUnlocks(): Partial<Unlocks> | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (u && typeof u === "object") return u;
    return null;
  } catch {
    return null;
  }
}

/* ---------- 播放器/内容占位底座 ---------- */
function LessonContent({ lesson }: { lesson: Lesson }) {
  if (lesson.kind === "embed" && lesson.src) {
    return (
      <div className="player-frame">
        <iframe src={lesson.src} className="player-iframe" allowFullScreen title={lesson.title} loading="lazy" />
      </div>
    );
  }
  if (lesson.kind === "video" && lesson.src) {
    return (
      <div className="player-frame">
        <video src={lesson.src} controls preload="metadata" style={{ width: "100%", display: "block" }} />
      </div>
    );
  }
  return (
    <div className="player-frame">
      <div className="player-placeholder">
        <div className="p-icon" aria-hidden="true">
          {lesson.kind === "doc" ? "📄" : "🎬"}
        </div>
        <div className="p-title">{lesson.title}</div>
        <div className="p-note">
          本节为 {lesson.kind === "doc" ? "图文课程" : "视频课程"} · 正式内容整理中
          <br />
          Demo 底座已就绪：视频 / 外链 / 图文均支持，上传后自动替换
        </div>
      </div>
    </div>
  );
}

/* ---------- 课程 Modal ---------- */
function LessonModal({
  lesson,
  pack,
  unlocked,
  onClose,
}: {
  lesson: Lesson;
  pack: CoursePack;
  unlocked: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const canWatch = unlocked || !!lesson.preview;

  return (
    <div className="modal-mask" onClick={onClose} role="dialog" aria-modal="true" aria-label={lesson.title}>
      <div className="modal modal--lesson" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-x" onClick={onClose} aria-label="关闭">
          ✕
        </button>

        <div className="modal-head">
          <span className="modal-logo" aria-hidden="true">
            {canWatch ? (lesson.preview && !unlocked ? "🆓" : "▶") : "🔒"}
          </span>
          <div className="modal-head-text">
            <h2>{lesson.title}</h2>
            <div className="modal-badges">
              <span className="tag tag--ac">
                {pack.emoji} {pack.title} · {lesson.no}
              </span>
              {lesson.preview && <span className="tag tag--preview">体验课</span>}
              {lesson.dur && <span className="tag mono">{lesson.dur}</span>}
            </div>
          </div>
        </div>

        <p className="modal-desc">{lesson.desc}</p>

        {canWatch ? (
          <>
            <LessonContent lesson={lesson} />
            <p className="modal-note mono">
              {unlocked ? "已解锁 · 正式内容播放底座" : "体验课试看 · 解锁后可观看该课包全部课程"}
            </p>
          </>
        ) : (
          <div className="lesson-lockview">
            <div className="lk" aria-hidden="true">
              🔒
            </div>
            <h3>本节属于「{pack.title}」</h3>
            <p>
              报名解锁该课包全部课程，或输入你已收到的解锁码。
              价格与档位见联系页。
            </p>
            <div className="lesson-lock-actions">
              <Link className="btn-main" href="/contact">
                联系报名
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 单模块 ---------- */
function PackModule({
  pack,
  unlocked,
  onOpen,
}: {
  pack: CoursePack;
  unlocked: boolean;
  onOpen: (p: CoursePack, l: Lesson) => void;
}) {
  const lockedCount = pack.lessons.filter((l) => !l.preview).length;
  const previewCount = pack.lessons.filter((l) => l.preview).length;
  return (
    <section className="mod">
      <div className="mod-head">
        <div>
          <div className="mod-title">
            <span aria-hidden="true">{pack.emoji}</span>
            {pack.title}
          </div>
          <div className="mod-sub">{pack.subtitle}</div>
        </div>
        <div className="mod-right">
          {unlocked ? (
            <div className="mod-unlock-tag">✓ 已解锁</div>
          ) : (
            <div className="mod-lockline mono">
              🔒 {lockedCount} 节待解锁{previewCount > 0 ? ` · ${previewCount} 节可试看` : ""}
            </div>
          )}
        </div>
      </div>

      <div className="lessons">
        {pack.lessons.map((l) => {
          const canWatch = unlocked || !!l.preview;
          return (
            <button
              key={l.id}
              type="button"
              className={"lesson" + (canWatch ? "" : " is-locked")}
              onClick={() => onOpen(pack, l)}
            >
              <span className="lesson-state" aria-hidden="true">
                {!canWatch ? "🔒" : l.preview && !unlocked ? "🆓" : "▶"}
              </span>
              <span className="lesson-no mono">{l.no}</span>
              <span className="lesson-info">
                <span className="lesson-title">{l.title}</span>
                <span className="lesson-desc">{l.desc}</span>
              </span>
              <span className="lesson-meta">
                {l.preview && !unlocked ? (
                  <span className="tag tag--preview">体验课 · 可试看</span>
                ) : (
                  <span className="tag mono">{canWatch ? "可观看" : "未解锁"}</span>
                )}
                {l.dur && <span className="mono">{l.dur}</span>}
              </span>
            </button>
          );
        })}
      </div>
      {!unlocked && (
        <div className="mod-openline mono">
          {pack.emoji} 解锁后可见该课包全部 {pack.lessons.length} 节
          <Link href="/contact" style={{ marginLeft: 8 }}>
            联系报名 ↗
          </Link>
        </div>
      )}
    </section>
  );
}

/* ---------- 主组件 ---------- */
export default function CoursesClient({ packs }: { packs: CoursePack[] }) {
  const [unlocks, setUnlocks] = useState<Partial<Unlocks> | null>(null);
  const [gate, setGate] = useState<"loading" | "locked" | "open">("loading");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [open, setOpen] = useState<{ p: CoursePack; l: Lesson } | null>(null);
  const [miniOpen, setMiniOpen] = useState<string | null>(null);

  useEffect(() => {
    const un = readUnlocks();
    setUnlocks(un);
    // 第一道锁：有邀请码 或 已解锁任一课包 → 放行；否则锁态页（内容不裸奔）
    const anyUnlock = !!un && Object.values(un).some(Boolean);
    setGate(hasInvite() || anyUnlock ? "open" : "locked");
  }, []);

  const mainPacks = packs.filter((p) => p.kind === "main");
  const miniPacks = packs.filter((p) => p.kind === "mini");

  function tryUnlock() {
    const c = code.trim().toUpperCase();
    const hit = (Object.keys(UNLOCK_CODES) as PackKey[]).find((k) => UNLOCK_CODES[k] === c);
    if (!hit) {
      setMsg({ ok: false, text: "解锁码不正确，请核对后重试（或联系报名微信）。" });
      return;
    }
    const next = { ...(unlocks || {}), [hit]: Date.now() };
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setUnlocks(next);
    setMsg({ ok: true, text: `已解锁「${PACK_LABEL[hit]}」· 欢迎回来！` });
    setCode("");
  }

  function logout() {
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
    setUnlocks(null);
    setMsg(null);
  }

  const unlockedKeys = useMemo(() => {
    if (!unlocks) return [];
    const ks: PackKey[] = [];
    // 主档：取最高已解锁档名
    for (let i = MAIN_ORDER.length - 1; i >= 0; i--) {
      const k = MAIN_ORDER[i];
      if (unlocks[k]) {
        ks.push(k);
        break;
      }
    }
    for (const p of MINI_PACKS) if (unlocks[p.key]) ks.push(p.key);
    return ks;
  }, [unlocks]);

  const guest = !unlocks || unlockedKeys.length === 0;
  const stateLabel = guest
    ? "访客 · 浏览课纲"
    : `已解锁 ${unlockedKeys.map((k) => PACK_LABEL[k]).join(" + ")}`;

  // 第一道锁：loading / 锁态 / 进入
  if (gate === "loading") {
    return (
      <div className="course-lock">
        <div className="course-wrap course-wrap--narrow">
          <div className="course-lock-card">
            <p className="mono">检查邀请状态…</p>
          </div>
        </div>
      </div>
    );
  }
  if (gate === "locked") {
    return <CourseLock onOk={() => setGate("open")} />;
  }

  return (
    <>
      <div className="course-player-head">
        <div className="sec-num">03 / COURSE DESK</div>
        <h1>训练营课程台</h1>
        <p className="lead">
          按课包解锁观看 · 未报名也能看到完整课纲、试看体验课。付费后输入解锁码即可看课，永久回看。
        </p>
      </div>

      <div className="player-body">
        <div className="state-bar">
          <div className="state-id">
            {guest ? (
              <span className="state-tag state-tag--guest">访客 · 浏览课纲</span>
            ) : (
              <>
                <span className="state-tag state-tag--unlocked">{stateLabel}</span>
                <button type="button" className="unlock-logout mono" onClick={logout}>
                  退出
                </button>
              </>
            )}
            <span className="state-hint">
              {guest
                ? "以下为课纲预览：可试看「体验课」，报名后输入解锁码开课。"
                : `你已开通：${stateLabel.replace("已解锁 ", "")}，点开任意一节开始学习。`}
            </span>
          </div>
        </div>

        {/* 低价尝鲜课（顶部 · 2 列紧凑卡） */}
        {miniPacks.length > 0 && (
          <section className="mini-zone">
            <div className="mini-zone-head">
              <span className="mono tsec-no">MINI</span>
              <h2>低价尝鲜课</h2>
              <span className="mini-zone-note mono">花一顿饭钱先体验 · 点卡片展开课程</span>
            </div>
            <div className="mini-grid">
              {miniPacks.map((p) => {
                const unlocked = hasPack(unlocks, p);
                const isOpen = miniOpen === p.key;
                const includes = p.includes ? COURSE_PACKS.find((x) => x.key === p.includes) : null;
                return (
                  <div
                    key={p.key}
                    className={"mini-card" + (isOpen ? " is-open" : "")}
                    onClick={() => setMiniOpen(isOpen ? null : p.key)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setMiniOpen(isOpen ? null : p.key)}
                  >
                    <div className="mini-card-top">
                      <span className="mini-card-name">
                        <span aria-hidden="true">{p.emoji}</span>
                        {p.title}
                      </span>
                      {unlocked && <span className="mod-unlock-tag">✓ 已解锁</span>}
                    </div>
                    <div className="mini-card-sub">{p.subtitle}</div>
                    <div className="mini-card-meta">
                      <span className="tag mono">{p.lessons.length} 节</span>
                      {includes && (
                        <span className="tag mini-includes">
                          含「{includes.title}」全部 {includes.lessons.length} 节
                        </span>
                      )}
                      {p.lessons.some((l) => l.preview) && <span className="tag tag--preview">含体验课</span>}
                    </div>
                    <div className="mini-card-foot">
                      <span className="mini-openline mono">
                        {unlocked ? "已解锁，点击查看课程" : "点开看课纲 / 体验课"}
                        <svg className="mini-chev" width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {!unlocked && (
                        <Link href="/contact" onClick={(e) => e.stopPropagation()}>
                          联系报名 ↗
                        </Link>
                      )}
                    </div>
                    {isOpen && (
                      <div className="mini-lessons">
                        {p.lessons.map((l) => {
                          const canWatch = unlocked || !!l.preview;
                          return (
                            <button
                              key={l.id}
                              type="button"
                              className={"lesson" + (canWatch ? "" : " is-locked")}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpen({ p, l });
                              }}
                            >
                              <span className="lesson-state" aria-hidden="true">
                                {!canWatch ? "🔒" : l.preview && !unlocked ? "🆓" : "▶"}
                              </span>
                              <span className="lesson-no mono">{l.no}</span>
                              <span className="lesson-info">
                                <span className="lesson-title">{l.title}</span>
                              </span>
                              <span className="lesson-meta">
                                {l.preview && !unlocked ? (
                                  <span className="tag tag--preview">体验课</span>
                                ) : (
                                  <span className="tag mono">{canWatch ? "可看" : "未解锁"}</span>
                                )}
                                {l.dur && <span className="mono">{l.dur}</span>}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 正式系统三档（主体） */}
        {mainPacks.map((p) => (
          <PackModule key={p.key} pack={p} unlocked={hasPack(unlocks, p)} onOpen={(p, l) => setOpen({ p, l })} />
        ))}

        {/* 解锁面板 */}
        {guest && (
          <div className="unlock-panel">
            <h3>
              🔑 输入你的解锁码
              <span className="mono" style={{ fontSize: 11, fontWeight: 400, color: "var(--ink-faint)" }}>
                报名后由创始人发放 · 每门课包一个码
              </span>
            </h3>
            <p>
              输入报名后收到的课包解锁码，本设备即开通对应内容；多课包可叠加。解锁码请勿外传。
            </p>
            <div className="unlock-row">
              <input
                className="unlock-input"
                placeholder="如 VLAB-BUILDER"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setMsg(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
                autoComplete="off"
              />
              <button type="button" className="unlock-btn" onClick={tryUnlock}>
                解锁
              </button>
              <Link className="btn-ghost" href="/contact" style={{ height: 42 }}>
                还没有解锁码？联系报名
              </Link>
            </div>
            {msg && (
              <div className={"unlock-msg " + (msg.ok ? "unlock-msg--ok" : "unlock-msg--err")}>{msg.text}</div>
            )}
          </div>
        )}

        {!guest && (
          <p className="mod-openline mono" style={{ textAlign: "center" }}>
            已解锁：{stateLabel.replace("已解锁 ", "")} · 报名信息与档位升级：
            <Link href="/contact">联系报名 ↗</Link>
          </p>
        )}
      </div>

      {open && (
        <LessonModal
          lesson={open.l}
          pack={open.p}
          unlocked={hasPack(unlocks, open.p)}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}