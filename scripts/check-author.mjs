#!/usr/bin/env node
/**
 * check-author.mjs — 创作者提交白名单检查（CI 用）
 *
 * 规则：若 PR 改动涉及 creators/ 或 covers/（创作者数据/封面），
 * 则 PR 作者（或 push 者）的 GitHub 账号必须已入驻花名册（creators/index.json 的 github 字段），
 * 否则检查失败——没先邮件申请、站长没放行的提交，根本到不了人工审核。
 *
 * 环境变量（workflow 注入）：
 *   ACTOR   PR 作者 / push 者的 GitHub login
 *   BASE    PR base 分支 sha（用于 diff）
 * 在仓库根执行。
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const actor = process.env.ACTOR || "";
const base = process.env.BASE || "";

// 1. 本次改动的文件
let changed = [];
if (base) {
  try {
    const out = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { encoding: "utf8", cwd: root });
    changed = out.split("\n").filter(Boolean);
  } catch (e) {
    console.error("无法计算改动文件（git diff 失败）:", e.message);
    process.exit(1);
  }
} else {
  // 无 base（如本地自检）：只校验当前工作区是否合法，跳过作者闸
  console.log("check-author: 未提供 BASE，跳过改动范围判断");
  process.exit(0);
}

const touchesCreators = changed.some((f) => f.startsWith("creators/") || f.startsWith("covers/"));
console.log(`check-author: actor=${actor || "(空)"} 改动 ${changed.length} 个文件` + (touchesCreators ? "（涉及 creators/covers）" : "（不涉及，放行）"));
if (!touchesCreators) process.exit(0);

// 2. 白名单 = 花名册 github 字段 ∪ 维护者账号
let roster = [];
try {
  const idx = JSON.parse(fs.readFileSync(path.join(root, "creators/index.json"), "utf8"));
  // 花名册条目没有 github；github 在 profile.json —— 遍历 profile 收集
  for (const c of idx.creators || []) {
    const prof = JSON.parse(fs.readFileSync(path.join(root, `creators/${c.dir}/profile.json`), "utf8"));
    if (prof.github) roster.push(String(prof.github).toLowerCase());
  }
} catch (e) {
  console.error("读取花名册失败:", e.message);
  process.exit(1);
}
const ADMINS = ["lant1ng-1216", "lant1ng"]; // 站点维护者（站长账号别名），始终放行
const allow = new Set([...roster, ...ADMINS.map((a) => a.toLowerCase())]);

if (allow.has(String(actor).toLowerCase())) {
  console.log(`check-author: ✅ ${actor} 已在白名单，允许提交创作者数据`);
  process.exit(0);
}
console.error(`check-author: ❌ ${actor || "(未知)"} 不在创作者白名单。`);
console.error("规则：改动创作者数据前需先邮件申请（zfu9751@gmail.com，附 GitHub 账号），站长审核后加入花名册 creators/index.json（及其 profile.json），此后提交才会被受理。");
process.exit(1);
