# AGENTS.md — vibe-lab 数据仓库操作手册

> 本文件面向 **AI Agent 与自动化工具**。人类指南见 [creators/README.md](creators/README.md)。
> 任何读取本仓库的 Agent（Copilot / Cursor / 各类 coding agent）请先通读此文件，再动手。

## 1. 仓库是什么

vibe-lab 是 Vibe Lab 站点的代码 + 内容仓库，本文件关心的核心是 **`creators/` 创作者数据中枢**：站点 /lab 页从这里实时拉取创作者与作品。数据链路：

```
creators/ 数据文件  →  站点 lib/lab.ts（token→GitHub API / 无 token→jsdelivr，60s 缓存）  →  /lab 页面
```

**稳定守则（不可违反）**：
1. `works.json` 是**最终展示集**——sync / 封面回写**只建议、只补充字段，永不删除**人写的手工条目。
2. 人工写过的字段（title/type/desc/body/status）**永不被自动流程覆盖**；自动流程只补 `thumb / cardSummary / coverVersion / stats` 等机器字段。
3. 任何写仓库动作走 **PR**（例外：`/api/lab-cover` 回写封面与摘要走维护 token 直推，属既定运维）。
4. 数据协议变更必须同步三处：`schema/*.json`、`AGENTS.md`、`creators/README.md`，三者不许打架。

## 2. 数据结构速查

| 文件 | 内容 | 谁维护 |
|---|---|---|
| `creators/index.json` | 花名册：`{dir, handle, joinedAt}[]` | 站长（入驻登记） |
| `creators/<handle>/profile.json` | 个人资料 + `sync` 收录配置 | 创作者本人 |
| `creators/<handle>/works.json` | 作品清单（展示集） | 创作者 + 自动流程建议 |
| `creators/<handle>/assets/` | (可选) 演示素材 | 创作者 |
| `covers/<workId>.jpg` | AI 封面产物 | 自动生成 |

### profile.json
```jsonc
{
  "handle": "yu7dan",            // 与花名册 handle 一致
  "name": "Yu7dan",
  "github": "lant1ng-1216",      // GitHub 用户名 → 头像跟随
  "avatar": null,                // 可选，URL 或 null
  "tagline": "…", "bio": "…", "tags": ["…"], "links": [{label,href}],
  "sync": {                       // 收录范围（影响 sync 任务）
    "mode": "all" | "selected" | "manual",
    "includeRepos": ["repo-a"],   // mode=selected 时使用
    "excludeRepos": ["vibe-lab"]  // 任何模式都排除（如平台自身）
  }
}
```

### works.json（条目字段）
`id / type / title / desc / coverHint / cardSummary / thumb / link / status / tags / date / meta / stats / body / demoVideo / gallery / coverVersion`

- `type` 枚举 = Design/Website/App/Product/Tutorial/Agent/Skill/Article/Video/Audio/Model（与站点 `data/creators.ts` 的 `WORK_TYPES` 同源）
- `status` 枚举 = 实验进行中/已上线/已开源
- `thumb` 语义：`/assets/…`=站点静态资产；`covers/<id>.jpg`=仓库封面（站点走代理）；http(s)=外链
- `coverVersion`：封面版本号，每次重生成 +1，防旧图覆盖新图

字段机器约束见 `schema/*.json`；本地校验入口：`node scripts/validate.mjs`（零依赖）。

## 3. 可执行任务 SOP

### 任务 A：新增创作者入驻
1. 确认已在站点侧完成申请沟通（联系页），拿到 `handle` 与 `github`。
2. `creators/index.json` 追加花名册条目（`dir`=handle，`joinedAt`=`YYYY-MM`）。
3. 新建 `creators/<handle>/profile.json`（复制 yu7dan 改）；`sync.mode` 按创作者意愿设（默认 `selected` 更稳妥，避免没筛选的作品一拥而上）。
4. 新建 `creators/<handle>/works.json`：空数组，或首批人工条目。
5. 跑 `node scripts/validate.mjs` 全绿 → 开 PR：`creators: 入驻 <handle>`。

### 任务 B：sync 收录作品（核心：生成「建议清单 + PR」，绝不直推）
**触发**：创作者开通 `all`/`selected` 后首次入驻、或定期维护（建议每月）、或创作者要求。
**执行**（本仓库根目录，需可访问 GitHub，如 `HTTPS_PROXY=http://127.0.0.1:7897` + gh 已登录）：
```bash
node scripts/sync-works.mjs <handle>            # 读 profile.sync + works.json → 出建议清单报告
```
脚本行为：
- 拉取该 GitHub 账号全部 **public、非 fork** 仓库（gh api）。
- 过滤 `excludeRepos`；按 `mode` 决定候选集（all=全部；selected=`includeRepos`∩可见）。
- 与现有 `works.json` 比对，产出三部分建议：
  - **新增候选**：候选集里未收录的仓库 → 每条含 repo 元数据与拟生成条目（type 需人工判定）
  - **字段刷新**：已收录条目可由 repo 元数据刷新的机器字段（desc/tags/date 等——**只列建议，不自动覆盖人工字段**）
  - **警示**：已展示但不在候选集（如 selected 未点名/被 exclude）→ 请人确认是否保留
- 脚本**不写任何文件**，只输出报告（stdout + `--out report.md`）。
**合入流程**：拿着报告 → 人类/站长 review（决定新增哪些、type 填什么）→ 改 `works.json` → validate → **开 PR**（标题 `creators: sync <handle> 作品`）→ merge。

### 任务 C：AI 封面 + 一句话摘要（完整流程见 docs/COVER-WORKFLOW.md）
**触发**：`works.json` 有条目 `thumb` 为空/为 null；或站长要求重生成。
**流程**：① 先**读作品说明源**（README > body > desc + repo topics），提炼"是什么/给谁用/解决什么/画面要素"；② 按 COVER-WORKFLOW 构造 prompt 与摘要；③ 生成 → 传 `covers/<id>.jpg` → 回写 `works.json`（thumb/cardSummary/coverVersion+1）。
**执行方式**：站点 dev 环境跑 `GET /api/lab-cover?workId=<id>[&force=1]`（幂等；带 MINIMAX_API_KEY + VLAB_GH_TOKEN），或按 COVER-WORKFLOW 手工链路。
**红线**：封面画面必须贴合产品介绍（读了说明再画）；禁文字/LOGO/中文入画；`force=1` 只在画面不贴产品时用。

## 4. 站点侧对应实现（改数据协议时要同步看这里）

- `lib/lab.ts`：加载引擎。index=花名册；creator 资料来自 `profile.json`；works 来自 `works.json`。
- `app/api/lab-cover/route.ts`：封面/摘要回写（幂等 + inflight 防并发）。
- `data/creators.ts`：`WORK_TYPES` / `WorkStatus` / 类型定义（枚举单一事实源）。
- 详情预览素材优先级：`demoVideo` > `gallery[0]` > AI 封面；无素材时 README 站内文档兜底。

## 5. 变更协议时的 checklist
- [ ] schema/*.json 更新
- [ ] 本文件 + creators/README.md 同步
- [ ] 站点 lib/lab.ts / data/creators.ts 若涉及字段透传同步更新
- [ ] 跑 validate；给旧数据写迁移（如 index→profile 拆分）
