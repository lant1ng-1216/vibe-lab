# vibe-lab · creators（创作者数据目录）

> 本文件是**给人看**的入驻指南。给 AI Agent 的操作手册在仓库根 [`AGENTS.md`](../AGENTS.md)。

创作者把自己的资料与作品放进 vibe-lab 仓库 `creators/` 目录，Vibe Lab 站点从这里实时拉取展示。
改动全部走 **PR**：站长（或维护 Agent）review 后合入，你的作品即出现在站点的「实验室 /lab」。

## 一、目录结构

```
creators/
├── index.json         花名册：谁入驻了（站长维护，一般不用你动）
├── README.md          本文件（人版指南）
├── <handle>/          每个创作者一个文件夹（handle = 你的英文昵称，如 yu7dan）
│   ├── profile.json   你的个人资料 + 收录范围设置（你自己维护）
│   ├── works.json     你的作品清单（展示什么、怎么排序，你自己维护）
│   └── assets/        (可选) 你的演示素材：截图/演示视频等
covers/                AI 封面产物（自动生成，一般不用你动）
schema/                JSON Schema：数据字段的机器约束（校验用）
scripts/               校验 / sync 工具脚本
```

**职责边界（很重要）**：
- `index.json` = 站务花名册，**站长维护**，你只需申请入驻时让站长把你加进去。
- `profile.json` = **你的地盘**：自我介绍、头像来源、社交链接、**收录作品的范围**，随时可改。
- `works.json` = **你的作品集**：放哪些作品、顺序、描述，随时可改。

## 二、五步入驻

1. **申请**：通过站点「＋你的位置」→ 联系页，把 handle 和 GitHub 用户名告诉站长。
2. **站长加你入花名册**：`creators/index.json` 出现你的条目 `{ dir, handle, joinedAt }`。
3. **建你的文件夹**（参考 `yu7dan/` 现成例子）：
   - `creators/<handle>/profile.json` —— 复制 yu7dan 的模板改掉。
   - `creators/<handle>/works.json` —— 先放空 `{ "works": [] }`，或用下面「收录作品」的方式让 sync 帮你填。
4. **设置收录范围**（profile.json 里的 `sync` 字段，三选一）：
   - `"mode": "all"` —— 我 GitHub 账号下**所有可见仓库**都当作候选作品（可配 `excludeRepos` 排除不想展示的，如平台自身）。
   - `"mode": "selected"` —— 只展示我在 `includeRepos` 里点名的仓库。
   - `"mode": "manual"` —— 完全手工，不自动 sync，我全部自己写。
5. **提交 PR**：标题写 `creators: 入驻 <handle>`。合并后去 /lab 检查展示效果。

> 想改个人介绍？直接改自己的 `profile.json` 提 PR 即可，**不必等站长**。
> 想增删作品？如果你开了 `all`/`selected`，跑一次 sync 工具会自动生成「建议清单 + PR」给你和站长 review（详见 AGENTS.md）；不开 sync 就手工改 `works.json`。

## 三、profile.json 字段

| 字段 | 说明 |
|---|---|
| `handle` | 你的英文昵称，与花名册一致 |
| `name` | 展示名（个人页大字） |
| `github` | GitHub 用户名；填了头像自动跟随你的 GitHub 头像 |
| `avatar` | (可选) 自带头像 URL，优先级最高 |
| `tagline` | 一句话签名（个人页副标） |
| `bio` | 自我介绍（个人页段落） |
| `tags` | 标签，如 ["Vibe Coding", "AI"] |
| `links` | 社交/个人站链接数组 |
| `sync` | 收录范围设置，见上文第 4 步 |

## 四、works.json 作品字段（速览）

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✅ | 唯一标识，小写连字符，如 `my-tool` |
| `type` | ✅ | 分类：Design / Website / App / Product / Tutorial / Agent / Skill / Article / Video / Audio / Model |
| `title` | ✅ | 作品标题 |
| `link` | ✅ | 体验地址（通常就是你的 GitHub 仓库） |
| `status` | ✅ | `实验进行中` / `已上线` / `已开源` |
| `desc` | | 一句话描述（卡片 meta 行） |
| `tags` | | 标签 |
| `date` | | `YYYY-MM` |
| `body` | | 长描述 |
| `demoVideo` / `gallery` | | 演示视频 / 截图集（你上传后**详情页优先展示**，比 README 更生动） |
| `thumb` / `cardSummary` | | AI 自动生成后回写，一般不用你填 |

> 你没传 demoVideo/gallery 时，详情页会自动把**仓库 README 渲染成站内文档**给访客读；卡片封面由 AI 按作品介绍自动生成。详见 [封面工作流](../docs/COVER-WORKFLOW.md)。

## 五、提交前自检

在仓库根目录跑一次（零依赖，装好 Node 即可）：

```bash
node scripts/validate.mjs
```

通过再发 PR。CI 也会在 PR 上自动跑同样的检查。
