# vibe-lab · creators（创作者数据目录）

创作者把自己的资料与作品放进**自己的文件夹**，Vibe Lab 站点从这里实时拉取展示。

## 目录规范

```
creators/
├── <handle>/            ← 一个创作者一个文件夹（如 yu7dan/）
│   ├── profile.json     ← 创作者资料
│   └── works.json       ← 作品列表
└── README.md            ← 本文件
```

## profile.json

```json
{
  "handle": "yu7dan",
  "name": "Yu7dan",
  "github": "lant1ng-1216",
  "tagline": "喜欢把想到的东西做出来",
  "bio": "先做出来，再谈别的。",
  "tags": ["Vibe Coding", "Solana", "AI"],
  "links": [{ "label": "GitHub", "href": "https://github.com/lant1ng-1216" }],
  "joinedAt": "2026-09"
}
```

- `github`：填 GitHub 用户名后，头像自动跟随你的 GitHub 头像（换头像站点同步），不填则回退本地生成。
- `links`：个人站/社交链接，可空数组。

## works.json

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
      "meta": { "role": "Creator", "tech": ["X", "Y"] },
      "body": "长描述（详情视图左侧展示）"
    }
  ]
}
```

- `type` 可选：`Design | Website | App | Product | Tutorial | Agent | Skill | Article | Video | Audio | Model`
- `status` 可选：`实验进行中 | 已上线 | 已开源`
- `thumb`：预览图 URL（16:10 或 3:2 横图优先）；不填则显示克制封面。
- `link`：作品体验地址（跳原作者处）。

## 加入流程

1. Fork 本仓库 → 复制 `creators/yu7dan/` 为 `creators/<你的 handle>/`
2. 填好 `profile.json` 与 `works.json`
3. 提交 Pull Request → 站长 review 后 merge，作品即出现在 /lab
