# Vibe Lab · 振动实验室

> AI 时代的野路子训练场 —— 工具在手、作品说话。
> 面向想用 AI 真正做出东西的人:从 0 上手 AI 工具,到独立做出自己的作品,再到把作品摆上台、被更多人看见。

**在线站点 → https://www.labagent.online**

## 这个仓库

Vibe Lab 官网源码 + **创作者数据中枢**。站点的「实验室 /lab」——创作者与他们的作品——都从本仓库 [`creators/`](creators/) 实时拉取展示:任何人提交的作品,过审后即可上线。

## 我们做什么

| 板块 | 做什么 | 代码/数据 |
|---|---|---|
| **工具库** | 70+ 精选 AI 工具,逐个上手讲明白 | `data/tools.ts` |
| **教程库** | 站内精读的 AI 学习路线,能落地、不灌水 | `data/tutorials/` |
| **实战训练营** | Starter / Builder / Hacker 三档:从上手工具,一路做到作品打磨上线、个人网站收官 | `app/courses` |
| **实验室 Lab** | 创作者作品展示场:做出来 → 摆上台 → 被看见 | `creators/` + `app/lab` |

## 技术栈

- **Next.js 15**(App Router)+ **TypeScript** + GSAP
- 服务端从本仓库**实时拉取**创作者数据(token → GitHub API / 无 token → CDN,60s 缓存)
- 代码:`app/` `components/` `lib/`;内容与数据:`data/` `creators/`
- 部署:海外 Vercel(免备案) · 线上 https://www.labagent.online

## 共建与创作者

Lab 欢迎每一个把作品摆上台的人。当前在台上的创作者:

- **yu7dan** — 站长 · *喜欢把想到的东西做出来*([GitHub](https://github.com/lant1ng-1216))

> 完整创作者墙见站点 `/lab`。

- 想 **入驻 / 提交作品**(人读教程)→ [`creators/README.md`](creators/README.md)
- 想让 **AI Agent 代你操作** → [`AGENTS.md`](AGENTS.md)
- 改动流程:提交 PR → 自动校验 → 站长 review → 合入即上线

## 贡献者

![GitHub Contributors](https://img.shields.io/github/contributors/lant1ng-1216/vibe-lab)

- lant1ng-1216 — 站长 · 维护者

感谢每一位把作品摆上台、把想法做成东西的人。
