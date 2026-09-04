#!/usr/bin/env node
/**
 * validate.mjs — vibe-lab creators/ 数据校验（零依赖，Node >= 18）
 *
 * 用法：在仓库根执行  node scripts/validate.mjs
 * 规则来自 schema/*.json（单一事实源），脚本只做一致性/存在性补充检查。
 * 退出码：0=通过（可含 WARN），1=存在 FAIL。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let fails = 0;
let warns = 0;

const fail = (m) => { fails++; console.log("  FAIL " + m); };
const warn = (m) => { warns++; console.log("  WARN " + m); };
const okm = (m) => console.log("  ok   " + m);

function read(p) {
  try { return fs.readFileSync(path.join(root, p), "utf8"); } catch { return null; }
}
function parse(p) {
  const t = read(p);
  if (t === null) return { missing: p };
  try { return { v: JSON.parse(t) }; } catch (e) { return { bad: p + ": " + e.message }; }
}

/** 极简 JSON-Schema 子集校验器：required / enum / pattern / type / properties / items */
function validateNode(instance, schema, where) {
  if (schema && Array.isArray(schema.enum)) {
    if (!schema.enum.includes(instance)) throw new Error(`${where}: 值不在枚举 [${schema.enum.join(" | ")}]`);
  }
  if (schema && schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const real = instance === null ? "null" : Array.isArray(instance) ? "array" : typeof instance;
    const matched = types.includes(real) || (types.includes("integer") && real === "number" && Number.isInteger(instance));
    if (!matched) throw new Error(`${where}: 应为 ${types.join("/")}，实为 ${real}`);
  }
  if (instance !== null && typeof instance === "object" && !Array.isArray(instance)) {
    for (const req of schema.required || []) {
      if (instance[req] === undefined) throw new Error(`${where}: 缺必填字段 "${req}"`);
    }
    for (const [k, sub] of Object.entries(schema.properties || {})) {
      if (instance[k] !== undefined) validateNode(instance[k], sub, `${where}.${k}`);
    }
  }
  if (Array.isArray(instance)) {
    for (let i = 0; i < instance.length; i++) validateNode(instance[i], (schema && schema.items) || {}, `${where}[${i}]`);
  }
  if (typeof instance === "string" && schema && schema.pattern && !new RegExp(schema.pattern).test(instance)) {
    throw new Error(`${where}: 不符合 pattern ${schema.pattern}`);
  }
}
function validateFile(p, schema, label) {
  const r = parse(p);
  if (r.missing) { fail(`${label} 缺失: ${r.missing}`); return null; }
  if (r.bad) { fail(`${label} 不是合法 JSON: ${r.bad}`); return null; }
  try { validateNode(r.v, schema, label); okm(`${label} 通过 schema 校验`); return r.v; }
  catch (e) { fail(e.message); return null; }
}

const schema = (n) => {
  const r = parse(`schema/${n}`);
  if (r.bad || r.missing) { fail(`schema/${n} 不可读`); return {}; }
  return r.v;
};

console.log("== vibe-lab creators/ 数据校验 ==");
const idxSchema = schema("index.schema.json");
const proSchema = schema("profile.schema.json");
const wkSchema = schema("works.schema.json");

// 1. 花名册
const idx = validateFile("creators/index.json", idxSchema, "creators/index.json");
if (idx && Array.isArray(idx.creators)) {
  const seen = new Set();
  idx.creators.forEach((c) => {
    if (seen.has(c.handle)) fail(`花名册 handle 重复: ${c.handle}`);
    seen.add(c.handle);
  });
  okm(`花名册 ${idx.creators.length} 位创作者`);
}

// 2. 目录级检查（含 fs 全扫：孤儿目录 / 缺失文件）
const creatorsDir = path.join(root, "creators");
const realDirs = fs.existsSync(creatorsDir)
  ? fs.readdirSync(creatorsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).filter((n) => n !== "assets")
  : [];
const indexed = new Set((idx && idx.creators || []).map((c) => c.dir));
for (const d of realDirs) if (!indexed.has(d)) warn(`目录 creators/${d}/ 不在花名册（孤儿目录）`);

for (const c of (idx && idx.creators) || []) {
  const label = `creators/${c.dir}`;
  const prof = validateFile(`${label}/profile.json`, proSchema, `${label}/profile.json`);
  const works = validateFile(`${label}/works.json`, wkSchema, `${label}/works.json`);
  if (prof && prof.handle !== c.handle) fail(`${label}: profile.handle(${prof.handle}) 与花名册 handle(${c.handle}) 不一致`);
  if (!prof && !read(`${label}/profile.json`)) fail(`${label}: 缺 profile.json`);
  if (!read(`${label}/works.json`)) fail(`${label}: 缺 works.json`);
  if (works && Array.isArray(works.works)) {
    const ids = new Set();
    works.works.forEach((w) => {
      if (ids.has(w.id)) fail(`${label}: 作品 id 重复: ${w.id}`);
      ids.add(w.id);
      if (w.thumb !== null && w.thumb !== undefined) {
        if (typeof w.thumb !== "string") { fail(`${label}/${w.id}: thumb 应为字符串或 null`); return; }
        const t = w.thumb.replace(/^\/+/, "");
        if (t.startsWith("covers/")) {
          if (!read(t)) fail(`${label}/${w.id}: thumb 引用文件不存在: ${w.thumb}`);
        } else if (t.startsWith("assets/")) {
          if (!read(`public/${t}`)) fail(`${label}/${w.id}: thumb 引用静态资产不存在: ${w.thumb}`);
        } else if (!/^https?:\/\//.test(t)) {
          warn(`${label}/${w.id}: thumb 路径无法识别（将按外链处理）: ${w.thumb}`);
        }
      }
    });
    okm(`${label}: ${works.works.length} 件作品`);
  }
}

// 3. 孤儿封面（生成中的正常，提醒清理）
const coversDir = path.join(root, "covers");
if (fs.existsSync(coversDir)) {
  const refs = new Set();
  for (const c of (idx && idx.creators) || []) {
    const wf = parse(`creators/${c.dir}/works.json`);
    if (wf && wf.v && wf.v.works) for (const w of wf.v.works) if (w.thumb) refs.add(w.thumb.replace(/^\/+/, ""));
  }
  for (const f of fs.readdirSync(coversDir)) {
    if (!refs.has(`covers/${f}`)) warn(`covers/${f} 未被任何作品引用（孤儿封面，可清理）`);
  }
}

console.log(`\n结果: ${fails} FAIL / ${warns} WARN`);
if (fails > 0) process.exit(1);
console.log("通过 ✅");
