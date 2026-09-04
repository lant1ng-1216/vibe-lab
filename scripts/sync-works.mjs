#!/usr/bin/env node
/**
 * sync-works.mjs — sync 收录作品：生成「建议清单」，绝不直推、绝不改数据文件。
 *
 * 用法（仓库根）：
 *   node scripts/sync-works.mjs <handle>            # 报告输出到 stdout
 *   node scripts/sync-works.mjs <handle> --out r.md # 同时写入报告文件
 *   node scripts/sync-works.mjs <handle> --repos repos.json   # 离线调试：从本地 JSON 读 repo 列表
 *
 * 依赖：gh CLI（已登录，网络走 git config http.proxy）；mode=manual 时不需要。
 *
 * 语义（与 AGENTS.md 一致）：
 *   - works.json 是最终展示集；本脚本只对比与建议。
 *   - mode=all     → 候选 = 该账号全部 public 非 fork 仓库（除 excludeRepos）
 *   - mode=selected→ 候选 = includeRepos ∩ 可见仓库（除 excludeRepos）
 *   - mode=manual  → 直接跳过，不 sync
 *   - 绝不删除/覆盖现有 works 条目；人工字段(title/type/desc/status/body)永不被自动建议覆盖。
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [, , handleArg, ...rest] = process.argv;
const outIdx = rest.indexOf("--out");
const outFile = outIdx >= 0 ? rest[outIdx + 1] : null;
const reposIdx = rest.indexOf("--repos");
const offlineFile = reposIdx >= 0 ? rest[reposIdx + 1] : null;

if (!handleArg) {
  console.error("用法: node scripts/sync-works.mjs <handle> [--out report.md] [--repos repos.json]");
  process.exit(1);
}

const readJ = (p) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
  catch { return null; }
};
const readT = (p) => {
  try { return fs.readFileSync(path.join(root, p), "utf8"); } catch { return null; }
};

const idx = readJ("creators/index.json");
const entry = idx && idx.creators.find((c) => c.dir === handleArg || c.handle === handleArg);
if (!entry) { console.error(`花名册没有该创作者: ${handleArg}`); process.exit(1); }
const handle = entry.handle;
const dir = entry.dir || handle;
const profile = readJ(`creators/${dir}/profile.json`);
const works = readJ(`creators/${dir}/works.json`);
if (!profile) { console.error(`缺 ${dir}/profile.json`); process.exit(1); }
const worksArr = (works && works.works) || [];

const mode = profile.sync?.mode || "manual";
const exc = profile.sync?.excludeRepos || [];
const inc = profile.sync?.includeRepos || [];
const lines = [];
const log = (s = "") => lines.push(s);

log(`# sync 建议清单 · @${handle}（${profile.github || handle}）\n`);
log(`- 模式：\`${mode}\`` + (exc.length ? `；exclude: ${exc.join(", ")}` : "") + (mode === "selected" ? `；include: ${inc.join(", ")}` : ""));

if (mode === "manual") {
  log("\n`manual` 模式：不自动 sync。作品全靠手工维护，无需处理。");
  finish();
}

// —— 拉取 repos ——
let repos = [];
if (offlineFile) {
  repos = readJ(offlineFile) || [];
  log(`- 数据源：离线 ${offlineFile}（${repos.length} 个）`);
} else {
  const proxy = readProxy();
  log(`- 数据源：GitHub（gh api /users/${profile.github}/repos）`);
  try {
    const out = execFileSync("gh", [
      "api", `/users/${profile.github}/repos?per_page=100&sort=updated&direction=desc`, "--paginate",
      "--jq", ".[] | {name, description, language, fork, private, created_at, updated_at, pushed_at, stargazers_count, topics}",
    ], { env: { ...process.env, ...(proxy ? { HTTPS_PROXY: proxy, HTTP_PROXY: proxy } : {}) }, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    repos = out.trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch (e) {
    console.error("gh api 拉取失败：请确认 gh 已登录、网络可用。\n" + (e.stderr ? String(e.stderr).slice(0, 500) : e.message));
    process.exit(1);
  }
}
if (!repos.length) { log("\n未拉到任何仓库。"); finish(); }

// —— 候选集 ——
const visibles = repos.filter((r) => !r.fork && !r.private);
const excluded = new Set(exc);
let candidates = visibles.filter((r) => !excluded.has(r.name));
let excludedHits = visibles.filter((r) => excluded.has(r.name));
if (mode === "selected") {
  const incSet = new Set(inc);
  const notOnGh = inc.filter((n) => !visibles.some((r) => r.name === n));
  candidates = candidates.filter((r) => incSet.has(r.name));
  if (notOnGh.length) log(`\n⚠ includeRepos 里 ${notOnGh.join(", ")} 在 GitHub 上未见（可能私有/已删/拼写错）`);
}

// —— 与 works 比对 ——
const byRepo = (r) => worksArr.find((w) => w.id === r.name || (typeof w.link === "string" && w.link.endsWith("/" + r.name)));
const fresh = candidates.filter((r) => byRepo(r));
const adds = candidates.filter((r) => !byRepo(r));
const inWorksButNotCandidate = worksArr.filter((w) => {
  const name = String(w.link || "").split("/").pop() || w.id;
  return !candidates.some((r) => r.name === name);
});

log(`- 候选仓库：${candidates.length}（public 非 fork${excludedHits.length ? `；exclude 命中 ${excludedHits.map((r) => r.name).join(", ")}` : ""}）；已有 ${fresh.length}、新增建议 ${adds.length}`);

if (adds.length) {
  log(`\n## 🆕 新增候选（${adds.length}）—— 是否收录、type 填什么，请 review`);
  log("\n| repo | 建议 type | 语言 | ⭐ | 描述 | 最近更新 |");
  log("|---|---|---|---|---|---|");
  for (const r of adds) log(`| \`${r.name}\` | ${suggestType(r)} | ${r.language || "-"} | ${r.stargazers_count || 0} | ${(r.description || "-").slice(0, 60)} | ${(r.updated_at || "").slice(0, 10)} |`);
} else {
  log("\n## 🆕 新增候选\n无。");
}

if (fresh.length) {
  log(`\n## 🔄 已收录（${fresh.length}）—— repo 元数据可参考（人工字段不自动覆盖）`);
  for (const r of fresh) {
    const w = byRepo(r);
    log(`- \`${r.name}\`（id=${w.id}）：${(r.description || "-").slice(0, 80)} ｜ 语言 ${r.language || "-"} ｜ ⭐${r.stargazers_count || 0} ｜ 最近提交 ${(r.pushed_at || "").slice(0, 10)}`);
  }
} else {
  log("\n## 🔄 已收录\n无。");
}

if (inWorksButNotCandidate.length) {
  log(`\n## ⚠ 展示中但不在候选集（${inWorksButNotCandidate.length}）—— 确认是否保留`);
  for (const w of inWorksButNotCandidate) {
    const reason = excluded.has(w.id) ? "在 excludeRepos" : mode === "selected" && !inc.includes(w.id) ? "不在 includeRepos" : "仓库可能已删除/转私有";
    log(`- \`${w.id}\`（${w.title}）：${reason}`);
  }
}

log(`\n---\n*由 scripts/sync-works.mjs 生成 · 本清单只读，未改动任何数据文件。采纳后请人工编辑 works.json 并开 PR。*`);

function finish() {
  const out = lines.join("\n");
  console.log(out);
  if (outFile) { fs.writeFileSync(path.join(root, outFile), out); console.log(`\n报告已写入 ${outFile}`); }
  process.exit(0);
}
finish();

function suggestType(r) {
  const hay = [r.name, r.description || "", ...(r.topics || [])].join(" ").toLowerCase();
  if (/agent|assistant|llm|bot/.test(hay)) return "Agent";
  if (/skill/.test(hay)) return "Skill";
  if (/website|site|landing|page|web app|homepage/.test(hay)) return "Website";
  if (/design|ui|icon/.test(hay)) return "Design";
  if (/tutorial|guide|course|learn/.test(hay)) return "Tutorial";
  return "App";
}

function readProxy() {
  try { return execFileSync("git", ["config", "--get", "http.proxy"], { encoding: "utf8" }).trim() || null; }
  catch { return null; }
}
