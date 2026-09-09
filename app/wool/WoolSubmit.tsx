"use client";

import { useState } from "react";
import { WOOL_GATES } from "@/data/wool";
import styles from "./wool.module.css";

const VALIDITIES = ["长期", "限时", "已失效"];

function empty() {
  return {
    name: "",
    quota: "",
    gate: WOOL_GATES[0],
    validity: "长期",
    deadline: "",
    how: "",
    trap: "",
    href: "",
    proof: "",
    from: "",
  };
}

export default function WoolSubmit() {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(empty());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");

  const set = (k: keyof ReturnType<typeof empty>, v: string) =>
    setF((p) => ({ ...p, [k]: v }));

  async function submit() {
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/wool/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const d = await r.json();
      if (!d?.ok) {
        setErr(d?.error || "提交失败");
        return;
      }
      setDone("投稿已提交，站长核实通过后会合入上线。");
      setF(empty());
    } catch {
      setErr("提交失败，检查下网络");
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setOpen(false);
    setErr("");
    setDone("");
  }

  return (
    <>
      <button type="button" className={styles.submit} onClick={() => setOpen(true)}>
        + 投稿羊毛
      </button>

      {open ? (
        <div className={styles.mask} onClick={close} role="presentation">
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="投稿羊毛"
          >
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>投稿羊毛</h2>
              <button type="button" className={styles.modalX} onClick={close}>
                ×
              </button>
            </div>

            <p className={styles.modalHint}>
              只收你<strong>亲自核实过</strong>的额度。抄来的、听说的一律不收 ——
              羊毛过期极快，一条错的信息会让所有人白跑。
            </p>

            {done ? (
              <div className={styles.modalDone}>
                <p>{done}</p>
                <button type="button" className={styles.send} onClick={close}>
                  好的
                </button>
              </div>
            ) : (
              <div className={styles.fields}>
                <label className={styles.field}>
                  <span>工具名（选填）</span>
                  <input value={f.name} maxLength={60} onChange={(e) => set("name", e.target.value)} placeholder="GitHub Copilot" />
                </label>

                <label className={styles.field}>
                  <span>白嫖额度（选填）</span>
                  <input value={f.quota} maxLength={80} onChange={(e) => set("quota", e.target.value)} placeholder="每月 2000 次补全" />
                </label>

                <div className={styles.row2}>
                  <label className={styles.field}>
                    <span>门槛 *</span>
                    <select value={f.gate} onChange={(e) => set("gate", e.target.value)}>
                      {WOOL_GATES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>有效期（选填）</span>
                    <select value={f.validity} onChange={(e) => set("validity", e.target.value)}>
                      {VALIDITIES.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {f.validity !== "长期" ? (
                  <label className={styles.field}>
                    <span>截止日期</span>
                    <input value={f.deadline} maxLength={10} onChange={(e) => set("deadline", e.target.value)} placeholder="2026-12-31" />
                  </label>
                ) : null}

                <label className={styles.field}>
                  <span>怎么领 *</span>
                  <textarea value={f.how} maxLength={300} onChange={(e) => set("how", e.target.value)} placeholder="登录账号即可开通，装插件直接用" />
                </label>

                <label className={styles.field}>
                  <span>坑点（选填）</span>
                  <textarea value={f.trap} maxLength={300} onChange={(e) => set("trap", e.target.value)} placeholder="到期自动续费？国内用不了？" />
                </label>

                <label className={styles.field}>
                  <span>领取链接 *</span>
                  <input value={f.href} maxLength={300} onChange={(e) => set("href", e.target.value)} placeholder="https://…（直接指向领取页）" />
                </label>

                <label className={styles.field}>
                  <span>你是怎么核实的（选填）</span>
                  <textarea
                    value={f.proof}
                    maxLength={500}
                    onChange={(e) => set("proof", e.target.value)}
                    placeholder="2026-09-06 在 xxx.com/pricing 看到 Free 档写着 2000 completions"
                  />
                </label>

                <label className={styles.field}>
                  <span>你的称呼（选填）</span>
                  <input value={f.from} maxLength={24} onChange={(e) => set("from", e.target.value)} placeholder="匿名也可以" />
                </label>

                {err ? <p className={styles.modalErr}>{err}</p> : null}

                <div className={styles.modalBar}>
                  <button type="button" className={styles.cancel} onClick={close}>
                    取消
                  </button>
                  <button type="button" className={styles.send} disabled={busy} onClick={submit}>
                    {busy ? "提交中…" : "提交投稿"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
