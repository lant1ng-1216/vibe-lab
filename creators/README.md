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

## 六、入驻后，日常就这三件事

你不需要记住整套协议——入驻完成后，你日常只会做下面三件事，每件都是一样的套路：**改自己的文件 → 发 PR → 站长审核通过 → 上线**。

### ① 加一件新作品
- 如果你开了 `all`/`selected`（自动收录）：把作品代码 push 到你自己的 GitHub 就行，然后跑一次 sync 生成「建议清单」→ 你勾选要收录的 → 变成 PR。也可以直接让 AI Agent 帮你做（见下）。
- 想手写（`manual` 或想精细控制）：编辑你自己的 `creators/<handle>/works.json`，照现有条目加一条（id/type/title/link/status 必填），发 PR。

### ② 改自己的介绍（随时、不用等任何人）
编辑 `creators/<handle>/profile.json`（名字、签名、bio、标签、社交链接、甚至收录范围 sync），发 PR 即可。这是**你的文件**，改它不需要经过任何人同意，只过审核。

### ③ 让 AI Agent 代办（推荐给用 AI 干活的人）
直接把大白话发给 AI，它会替你完成 PR：
- 「帮我入驻 vibe-lab，我的 GitHub 是 xxx」
- 「把我 GitHub 上的作品整理成清单给我挑」
- 「把我的仓库 my-tool 加进 Lab，类型 App，描述用这句：…」
- 「给我 my-tool 生成封面和一句话简介」（生成前 AI 会先读仓库 README 再画）
- 「把我的介绍改成：…」

AI 执行时读 [AGENTS.md](../AGENTS.md)（它的操作手册）。**任何写操作它都会开 PR 等你/站长审核，不会偷偷直推。**

## 七、审核与上线（你提交的东西会经历什么）

1. 你发 PR（数据改动建议标题带 `creators:`）。
2. **自动闸**：机器人跑格式校验（`validate`），不合法直接标红，合不进去。
3. **人工闸**：站长 review——看资料是否真实、分类是否正确、有没有敏感信息、收录范围是否符合你 profile 里设的 `sync`。
4. **合并 = 上线**：站点「实验室」最长 60 秒内就能看到你的新内容。
5. 如果被驳回，站长会留言原因，你改完再发一次即可——**内容的管理权始终在你手里**，审核只是质量把关，不是审批流程。

> 想快速看效果？合并后打开站点 /lab（或你的个人页 /lab/<handle>）检查卡片与详情。

