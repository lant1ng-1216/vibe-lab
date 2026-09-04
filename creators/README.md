# vibe-lab · creators（创作者数据目录）

创作者把自己的资料与作品放进 vibe-lab 仓库 `creators/` 目录，Vibe Lab 站点从这里实时拉取展示。

## 目录规范

```
creators/
├── index.json             ← 花名册：全部创作者资料（站长 PR 时同步维护）
├── <handle>/              ← 每个创作者一个文件夹（如 yu7dan/）
│   └── works.json         ← 该创作者的作品列表
└── README.md              ← 本文件
```

## index.json — 创作者资料（花名册）

```json
{
  "creators": [
    {
      "dir": "yu7dan",
      "handle": "yu7dan",
      "name": "Yu7dan",
      "github": "lant1ng-1216",
      "tagline": "喜欢把想到的东西做出来",
      "bio": "先做出来，再谈别的。",
      "tags": ["Vibe Coding", "AI", "Solana"],
      "links": [{ "label": "GitHub", "href": "https://github.com/lant1ng-1216" }],
      "joinedAt": "2026-09"
    }
  ]
}
```

- `dir`：对应该创作者的文件夹名（读取其 works.json 用）
- `github`：填 GitHub 用户名后，头像自动跟随你的 GitHub 头像（换头像站点同步），不填则回退本地生成
- `links`：个人站/社交链接，可空数组

## works.json — 创作者作品

```json
{
  "works": [
    {
      "id": "my-project",
      "type": "Product",
      "title": "作品标题",
      "desc": "一句话描述（feed 卡片展示）",
      "thumb": null,
      "link": "https://github.com/you/repo",
      "status": "已开源",
      "tags": ["A", "B"],
      "date": "2026-09",
      "meta": { "role": "作者", "tech": ["X", "Y"] },
      "body": "长描述（详情视图左侧展示）"
    }
  ]
}
```

- `type` 可选：`Design | Website | App | Product | Tutorial | Agent | Skill | Article | Video | Audio | Model`
- `status` 可选：`实验进行中 | 已上线 | 已开源`
- `thumb`：预览图 URL（16:10 或 3:2 横图优先）；不填则显示克制封面
- `link`：作品体验地址（跳原作者处）

## 加入流程

1. 把资料与作品按上面格式整理好
2. Fork 本仓库 → 改 `index.json` 加入自己 + 新建 `creators/<你的 handle>/works.json`
3. 提交 Pull Request → 站长 review 后 merge，作品即出现在 /lab

## 作品预览图（thumb）来源

`works.json` 的 `thumb` 字段支持三档来源，**按这个优先级自动降级**：

1. **作者上传图**：你提供的截图 URL（CDN/你自己的图床均可）
2. **维护员 AI 自动截图**：站长 PR 合并前/后跑 `scripts/capture-previews.py` 自动去 `link` 拉真实产品页截图（Playwright + Chromium，1440 viewport × 2x = 2880 高清 PNG）
3. **仓库 README 兜底**：如果链接无法访问，自动截 GitHub repo 的 README 区域

脚本走完整链路：跑一遍你的 `link` → 命中真实产品页就截产品，命中 GitHub repo 就截 README，失败继续降级到 README 截图。

```bash
# 一次性截图当前所有作品预览（需 GitHub token）
GITHUB_TOKEN=$(gh auth token) python3 scripts/capture-previews.py
```
