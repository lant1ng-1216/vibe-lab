# vibe-lab · Vibe Lab 站点与创作者数据仓库

这里是 **Vibe Lab** 站点的源码 + 创作者数据中枢。站点「实验室 /lab」页的所有创作者与作品，都从本仓库 `creators/` 实时拉取展示。

## 快速导航（按你的身份选）

| 你是谁 | 看哪个 |
|---|---|
| **想入驻的创作者**（人） | [creators/README.md](creators/README.md) —— 入驻教程与日常操作 |
| **想让 AI Agent 代办的创作者 / 维护者** | [AGENTS.md](AGENTS.md) —— AI 操作手册（可直接丢给 AI 执行） |
| **维护者（生成封面等）** | [docs/COVER-WORKFLOW.md](docs/COVER-WORKFLOW.md) |
| **校验数据 / 自动收录作品** | [scripts/validate.mjs](scripts/validate.mjs) / [scripts/sync-works.mjs](scripts/sync-works.mjs) |

## 目录速览

```
creators/index.json           花名册（站长维护：谁入驻了）
creators/<handle>/profile.json 创作者个人资料 + 收录范围 sync（本人可编辑）
creators/<handle>/works.json   作品展示集（本人 + 审核后合入）
covers/<id>.jpg                AI 封面产物
schema/*.json                  JSON Schema：数据字段约束（机器单一事实源）
docs/COVER-WORKFLOW.md         封面生成 SOP（先读说明再生成）
```

## 审核与上线（所有写操作都遵守）

**任何改动（创作者 / 维护者 / AI）都走 PR，审核通过合入后才上线：**

1. 提交 PR（数据改动标题带 `creators:` 前缀）。
2. 自动闸：CI 跑 `scripts/validate.mjs`，格式不对直接红。
3. 人工闸：站长按 checklist 审核（资料真实、type/status 合理、无敏感信息、收录范围符合本人 `sync` 配置）。
4. 合并 = 上线（站点最长 60s 缓存后可见）。

唯一豁免：`/api/lab-cover` 运行时封面回写（AI 机器产物、幂等、带 coverVersion 可追溯）。

## 协议版本

v2（2026-09）：`index.json` 只存花名册；个人资料与 `sync{all|selected|manual}` 移入 `<handle>/profile.json`。字段约束见 `schema/*.json`，改协议必须同步 schema + 两份文档，不许打架。
