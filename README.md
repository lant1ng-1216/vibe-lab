<div align="center">

# 🧪 VIBE LAB · 振动实验室

**AI 时代的野路子训练场 —— 工具在手、作品说话**

> 面向想用 AI 真正做出东西的人：从 0 上手 AI 工具，到独立做出自己的作品，再到把作品摆上台、被更多人看见。
> 我们正在做 **Lab Agent** —— 你想成为 Vibe Coding 时代开发者身边的「监工」的那一半野心，也在这里。

[🌐 在线站点](https://www.labagent.online) · [🤖 Lab Agent](https://www.labagent.online/agent) · [🔧 资源库](https://www.labagent.online/tools) · [📚 教程库](https://www.labagent.online/tutorials) · [🧪 实验室](https://www.labagent.online/lab) · [📮 支持我们](https://www.labagent.online/contact)

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square)
![License](https://img.shields.io/badge/License-Apache--2.0-D22128?style=flat-square)
![AI](https://img.shields.io/badge/AI-MiniMax_%2B_DeepSeek-8B5CF6?style=flat-square)
![Contributors](https://img.shields.io/github/contributors/lant1ng-1216/vibe-lab?style=flat-square&color=green)

</div>

---

![Vibe Lab 首页](docs/assets/hero.png)

---

## 📑 目录

- [这是个什么产品](#这是个什么产品)
- [Lab Agent 站点的另一半](#lab-agent-站点的另一半)
- [四大板块](#四大板块)
- [技术栈](#技术栈)
- [共建与创作者](#共建与创作者)
- [Roadmap](#roadmap)
- [License](#license)
- [支持与致谢](#支持与致谢)

---

## 这是个什么产品

Vibe Lab 不是又一个工具合集站，也不是纯教程站——它是把「学会用 AI」和「**做出作品**」焊在一起的训练场，并且正在长出它真正的野心：

- **工具怎么用** → 把好用的 AI 工具一次装齐，按用途分类、逐个上手讲明白；
- **教程怎么读** → 高质量开源教程整本搬进站内，从入门通识到 Agent 实战，跟着顺序读完就真的会了；
- **作品怎么做完** → 训练营与 Lab Agent，正在把「从想法到完成」这条路替你盯牢；
- **做出来之后** → 创作者把作品摆上「实验室」，被更多人看见——这是平台的里子。

> **野路子也值得被认真对待。** 这里不背理论、第一节就动手，把好用的「邪修」打法系统化，一样能做出正经作品。

## Lab Agent 站点的另一半

`labagent.online` 这个域名说明了一切：站点不仅是资源门户，**Lab Agent 是我们正在长成的产品**。

**它是什么**：一个**不写代码**的 Agent。做代码的是 Coding Agent（Claude Code / Codex / Cursor…任你切换）；Lab Agent 负责整条产品生命周期的**意图与质量层**——开工前帮你把想法问清楚写成 PRD，执行中盯着 Coding Agent 别跑偏，交差时把技术汇报翻成人话、对照 PRD 验收。

**现在有什么**（产品本体还在打磨，以下形态已经上线）：
- **概念页** `/`（[首页](https://www.labagent.online/home)）—— Lab Agent 完整愿景：对齐「感受」而非任务、讨论与执行隔离、三层结构、六大能力、画布/SDK 双形态；
- **交互演示页** `/agent` —— 把未来产品的样子演给访客看：一张画布上两个终端节点（Lab Agent ⇄ Coding Agent）用一条连线连着，coding engine 可随时切换；两种使用场景（先聊再做 / 边做边盯）都能走一遍。演示对话由 DeepSeek 实时生成，失败自动回落内置剧本。

**下一步**：从「演示」到真正的产品——以 Lab Agent 作为「外部真源」（意图 + 决策记录存在项目里）+ 执行 Agent 的 hooks 起步，等主流 Coding Agent 开放监管协议后再接「调度」。愿景细节见团队概念稿（本机，不入仓）。

## 四大板块

| 板块 | 做什么 | 免费？ |
|---|---|---|
| **🔧 资源库** | AI 工具 + Skill 即学即用；另设**羊毛专区** `/wool` 独立整理免费额度与白嫖渠道 | ✅ 永久免费 |
| **📚 教程库** | 开源 AI 教程站内精读，整本读完不跳来跳去 | ✅ 永久免费 |
| **🎓 实战训练营** | 定位调整中 · 敬请期待（过往为三档录播 + 作业点评体系，重新打磨后会回来） | 💰 未来付费 |
| **🧪 实验室 Lab** | 创作者作品展示场：作品摆上台，被更多人看见 | ✅ 免费入驻（白名单制） |

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | **Next.js 15**（App Router）· **TypeScript** · GSAP |
| 数据 | **GitHub 即数据仓**（`creators/` 创作者中枢）+ jsdelivr CDN 兜底 |
| 质量 | JSON Schema + `validate` 校验 · CI 白名单闸（作者须已入驻）· main 分支保护 |
| AI | **MiniMax**（作品 AI 封面 / 摘要）· **DeepSeek**（Lab Agent 演示与站内 Agent） |

## 共建与创作者

Lab 欢迎每一个把作品摆上台的人——**白名单制，先邮件申请**：

1. 发邮件至 `zfu9751@gmail.com`，写明 GitHub 用户名、想要的花名、简介、（可选）代表作；
2. 站长审核通过后把你加入花名册 `creators/index.json`（入册即放行）；
3. 之后你改 `creators/<handle>/profile.json` / `works.json` 提交 PR，自动校验通过、站长 review 后合入即上线。

**给创作者/贡献者的文档**（按阅读方式二选一，内容互补）：
- 🧑‍🎓 人读教程：[`creators/README.md`](creators/README.md) —— 入驻与日常操作
- 🤖 AI Agent 操作手册：[`AGENTS.md`](AGENTS.md) —— 白名单 / sync / 封面 SOP

**协议**：资源库 / 教程库 / 实验室内容永久免费；训练营课程（重新上线后）与创始人亲自指导为付费内容。

## Roadmap

- ✅ **v1** 资源库 · 教程库 · 实验室（创作者数据中枢 v1）
- ✅ **v2** 仓库转公开 · main 分支保护 · 创作者白名单 CI · 数据协议 schema 化（profile/works/sync）· 封面 AI 链路（MiniMax）
- ✅ **v3** 正式上线 `labagent.online` · Lab Agent 概念页与首页 · **画布形态交互演示页**（两终端节点 + engine 切换 + 两种场景）· 体验打磨
- 🚧 **进行中** Lab Agent：从演示走向真实产品（外部真源 + hooks 起步）· 实战训练营重新定位
- 🔮 **规划** 付费账号体系 · 课程与录播内容私有托管 · 多 coding engine 真实集成 · 站内搜索 · 创作者素材上传

## License

本仓库代码采用 **[Apache License 2.0](LICENSE)** —— 可自由使用、修改、分发（含商业用途），保留版权声明即可。

内容版权边界（与代码许可相互独立）：
- **资源库 / 教程库**：收录链接指向官方来源；教程内容来自 GitHub 开源项目，版权归原作者，站内阅读页标注作者与开源协议；
- **创作者作品**（`creators/`）：版权归创作者本人；
- **训练营课程与创始人指导**：付费内容（重新上线后），观看授权随课程购买发放，不得转售/再分发。

## 支持与致谢

本站能跑起来，靠一路把作品摆上台的创作者，和每一位愿意给它 ⭐ 的野路子同路人：

- **站长**：lant1ng-1216
- **已入驻创作者**：yu7dan（更多名单见站点 [实验室](https://www.labagent.online/lab)）

如果你愿意支持我们把 Lab Agent 从演示做成真产品，[写封邮件](https://www.labagent.online/contact) 或到站点看一眼，都是我们继续的动力。

---

<div align="center">

如果这个项目对你有一点点帮助——**去站点逛逛、把作品摆上台、或给个 ⭐**，都是我们继续做下去的动力。

**做出来，摆上台，被看见。**

</div>
