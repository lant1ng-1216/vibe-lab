export type ToolBadge = { text: string; type: string };

export type ToolLink = {
  label: string; // 如 "访问官网" / "GitHub 仓库"
  url: string;
  /** 可选：按钮下方的小注记（如蓝奏云访问密码） */
  note?: string;
};

export type Tool = {
  id: string;
  name: string;
  cat: string;
  /** 卡片上的短介绍（2 行内） */
  desc: string;
  /** 详情 Modal 里的完整介绍（可以更长） */
  longDesc: string;
  /** 详情 Modal 里的跳转按钮组 */
  links: ToolLink[];
  badges: ToolBadge[];
  /** 官方 logo 文件名（public/assets/tool-logos/ 下），缺省为 null 则回退首字母块 */
  logo?: string | null;
};

export const TOOL_CATEGORIES: string[] = [
  "文本生成",
  "AI 搜索",
  "图像生成",
  "3D 生成",
  "视频生成",
  "音乐语音",
  "Vibe Coding",
  "Agent 与自动化",
  "办公效率",
  "效率与浏览器",
  "模型与 API",
  "网络环境",
];

export const TOOLS: Tool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    cat: "文本生成",
    desc: "OpenAI 旗舰对话模型，通用问答、写作、编程、分析一把抓，是多数人的 AI 第一站。",
    longDesc:
      "OpenAI 的旗舰对话模型，也是全球用户量最大的 AI 助手。文本生成、写作润色、代码、数据分析、图像理解都在行，内置联网搜索与文件上传，配合 GPTs / Projects 可以做轻量工作流。适合完全没接触过 AI 的新手起步，也是多数人日常问问题的默认选择。",
    links: [{ label: "访问官网", url: "https://chatgpt.com" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "chatgpt",
  },
  {
    id: "claude",
    name: "Claude",
    cat: "文本生成",
    desc: "Anthropic 出品，长文本理解与代码能力出色，vibe coding 与 Agent 开发的主力选手。",
    longDesc:
      "Anthropic 出品的对话模型。以长上下文、深度推理与高质量写作见长，代码与工程任务尤其出色，Artifacts 可直接生成可运行的前端作品。Vibe Coding 和 Agent 开发的首选模型之一——Claude Code 是终端里能自己改文件跑命令的 agent。适合想把 AI 从“聊天”推进到“干活”的人。",
    links: [{ label: "访问官网", url: "https://claude.ai" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "claude",
  },
  {
    id: "deepseek-harness",
    name: "DeepSeek Harness",
    cat: "Agent 与自动化",
    desc: "DeepSeek 开源的 Agent 智能体框架：模型 + 工具 + Skill 插件化组装，让 AI 真正动手干活。",
    longDesc:
      "DeepSeek 官方开源的 Agent 智能体框架（Agent Harness），核心哲学是“Agent = Model + Harness”。它不只聊天——把 Shell 执行、代码 diff、文件读写、Skill 技能、子 Agent 调度等能力插件化组装，给大模型一双能干活的手。支持 Web UI / 桌面端 / 无头命令行多形态，可接 DeepSeek、OpenAI、Anthropic 等模型。进阶课 Agent 实战环节的重要参考对象。",
    links: [
      { label: "GitHub 仓库", url: "https://github.com/deepseek-ai/deepseek-harness" },
      { label: "官方文档", url: "https://deepseekharness.dev/tutorials/quickstart" },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "需 API Key", type: "warn" }],
    logo: "deepseek",
  },
  {
    id: "kimi",
    name: "Kimi",
    cat: "文本生成",
    desc: "月之暗面出品，超长上下文读取，擅长处理长文档、网页与资料梳理。",
    longDesc:
      "月之暗面（Moonshot AI）出品的国产大模型。以超长上下文（一次读几百页 PDF / 超长网页）闻名，资料整理、论文解读、文档问答非常顺手，浏览器插件可一键读整个网页。国内直连免费可用，中文体验好，适合学生党与资料工作者。",
    links: [{ label: "访问官网", url: "https://kimi.moonshot.cn" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "有免费档", type: "ok" }],
    logo: "kimi",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    cat: "图像生成",
    desc: "目前审美上限最高的文生图工具，出图质感强，适合做海报、概念图与视觉探索。",
    longDesc:
      "目前文生图领域审美上限最高的工具之一。无需提示词技巧就能出好看图的“默认质感”，在风格化、海报、概念视觉上表现强。Discord 内使用，版本迭代快（V7+）。缺点是需外网且纯付费（无免费档），适合对图的质量有要求、愿意付费的创作者。",
    links: [{ label: "访问官网", url: "https://www.midjourney.com" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "付费", type: "warn" }],
    logo: "midjourney",
  },
  {
    id: "comfyui",
    name: "ComfyUI",
    cat: "图像生成",
    desc: "开源节点式生图工作流，Stable Diffusion / FLUX 高级玩法必备，可本地跑，可玩性极高。",
    longDesc:
      "开源的节点式（node-based）图像生成工作流。把 Stable Diffusion / FLUX / Wan 等模型的生成过程拆成可拖拽连接的节点，能做精准控制、批量处理、复杂管线。可本地部署（有显卡更爽）也可云端跑。学习曲线比一键工具陡，但可玩性与上限极高——Lab 的“邪修”气质工具代表。",
    links: [
      { label: "GitHub 仓库", url: "https://github.com/comfyanonymous/ComfyUI" },
      { label: "官网", url: "https://www.comfy.org" },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "本地部署", type: "cy" }],
    logo: "comfyui",
  },
  {
    id: "jimeng",
    name: "即梦",
    cat: "图像生成",
    desc: "字节跳动出品，文生图/文生视频一站式，国产直连、上手简单，做内容素材很顺手。",
    longDesc:
      "字节跳动出品的 AI 创作平台，文生图 + 文生视频 + 数字人一站式。国产直连、免费额度友好、中文提示词理解好，出图/出视频都是国产第一梯队。做自媒体素材、短视频分镜、电商图最顺手，是新手做视觉内容的最佳起点。",
    links: [{ label: "访问官网", url: "https://jimeng.jianying.com" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "有免费档", type: "ok" }],
    logo: "jimeng",
  },
  {
    id: "cursor",
    name: "Cursor",
    cat: "Vibe Coding",
    desc: "AI 原生编辑器，代码补全与多文件改造极强，非科班也能用它把想法变成能跑的产品。",
    longDesc:
      "AI 原生的代码编辑器（基于 VS Code）。Tab 补全、Cmd+K 改选中代码、Chat 多文件改造、Composer 一次生成整个功能——非科班的人也能用它把想法变成能跑的产品。进阶课“Vibe Coding 搭产品”的主战场工具。有免费档，Pro 档更强。",
    links: [{ label: "访问官网", url: "https://www.cursor.com" }],
    badges: [{ text: "有免费档", type: "ok" }],
    logo: "cursor",
  },
  {
    id: "opencode",
    name: "OpenCode",
    cat: "Vibe Coding",
    desc: "开源的 AI 编程智能体，终端里的 coding agent，GitHub 19.5 万星，模型任意接。",
    longDesc:
      "开源（MIT）的 AI coding agent，运行在终端 / IDE / 桌面，作者是 terminal.shop 创始人。不绑定模型——Claude、GPT、Gemini、本地模型任选，内置 LSP、双 Agent 模式（build / plan）、多会话并行。GitHub 19.5 万星，16M 开发者月活。想摆脱付费编辑器、自己掌控工具链的人首选。",
    links: [
      { label: "访问官网", url: "https://opencode.ai" },
      { label: "GitHub 仓库", url: "https://github.com/anomalyco/opencode" },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "需外网", type: "warn" }],
    logo: "opencode",
  },
  {
    id: "zcode",
    name: "Z Code",
    cat: "Vibe Coding",
    desc: "智谱出品 AI 编码 IDE：文件树 + Agent 对话流 + 终端 + 内置预览，一体化干活。",
    longDesc:
      "智谱（Zhipu）出品的 AI 编码 IDE，专为“让 AI 干活”设计的桌面环境：左侧文件树、中央 Agent 对话流（markdown + 代码高亮）、底部终端、右侧内置浏览器预览，一个窗口走完“写→跑→看”全流程。内置 Claude Code / Codex / Gemini 等 Agent 可视化外壳，也深度适配 GLM 模型。Alpha 阶段但迭代飞快，适合 Vibe Coding 新手图形化入门。",
    links: [{ label: "访问官网", url: "https://zcode.z.ai" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "免费下载", type: "ok" }],
    logo: "zcode",
  },
  {
    id: "vercel",
    name: "Vercel",
    cat: "Vibe Coding",
    desc: "前端托管与部署平台，写好的作品一键部署上线，进阶课作品上线环节的主力工具。",
    longDesc:
      "前端托管与部署平台（也是 Next.js 的开发商）。git push 或点击导入即可把作品部署上线，自动 HTTPS、全球 CDN，免费档对个人作品足够。进阶课“作品打磨与上线”和 Lab 学员个人网站的主部署平台。我们 Vibe Lab 站点自己也跑在 Vercel 上。",
    links: [{ label: "访问官网", url: "https://vercel.com" }],
    badges: [{ text: "有免费档", type: "ok" }],
    logo: "vercel",
  },
  {
    id: "workbuddy",
    name: "WorkBuddy",
    cat: "Agent 与自动化",
    desc: "腾讯官方 AI 智能体工作台：自然语言下任务，直接操作本地文件、跑脚本、驱动工具。",
    longDesc:
      "腾讯官方出品的 AI 智能体桌面工作台（腾讯 CodeBuddy 团队）。不是“你问我答”的聊天 AI，而是能直接读写本地文件、跑脚本、操作软件的“AI 同事”：一句话描述需求，它自己拆任务、规划、执行，交付 PPT / Excel / 分析报告等成果。内置 MCP 与 Skill 扩展、多 Agent 协作、文件夹级授权与高危操作拦截。三档模式 Craft（直接干）/ Plan（先计划）/ Ask（只聊）。Lab Agent 的桌面参照对象——你现在用的 WorkBuddy 就是它。",
    links: [
      { label: "访问官网", url: "https://www.workbuddy.cn" },
      { label: "开放平台", url: "https://open.workbuddy.cn" },
    ],
    badges: [{ text: "腾讯官方", type: "ok" }, { text: "有免费档", type: "ok" }],
    logo: "workbuddy.svg",
  },
  {
    id: "n8n",
    name: "n8n",
    cat: "Agent 与自动化",
    desc: "开源工作流自动化平台，可自托管，把 AI Agent 与几百个应用串成自动化流水线。",
    longDesc:
      "开源（fair-code）的工作流自动化平台。用可视化节点把几百个应用（含 AI / LLM 节点）串成自动化流水线：定时任务、webhook、数据搬运、AI Agent 编排都能做。可云托管也可完全自托管，是“让 AI 自动干活”的基础设施级工具。想把自己的重复工作自动化的人值得研究。",
    links: [
      { label: "访问官网", url: "https://n8n.io" },
      { label: "GitHub 仓库", url: "https://github.com/n8n-io/n8n" },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "可自托管", type: "cy" }],
    logo: "n8n",
  },
  {
    id: "clash-verge",
    name: "Clash Verge Rev",
    cat: "网络环境",
    desc: "开源网络代理客户端，访问 ChatGPT / Claude 等海外服务时的环境准备工具。",
    longDesc:
      "开源的网络代理客户端（Clash Meta 内核的 GUI 实现），支持多订阅、规则分流、TUN 模式。国内用户访问 ChatGPT / Claude / 多数海外 AI 服务前的“环境准备”工具。开源免费，跨 Windows / macOS / Linux。收录用于学习与科研场景的网络环境配置。",
    links: [
      {
        label: "蓝奏云整合包 · 国内直下",
        url: "https://wwaoy.lanzoue.com/irlYd46ucyeb",
        note: "访问密码：45b4",
      },
      {
        label: "GitHub 仓库",
        url: "https://github.com/clash-verge-rev/clash-verge-rev",
      },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "代理工具", type: "warn" }],
    logo: "clash",
  },
  {
    id: "github",
    name: "GitHub",
    cat: "Vibe Coding",
    desc: "全球最大的代码托管与开源协作平台，AI 时代几乎所有开源工具、Skill、项目的家。",
    longDesc:
      "全球最大的代码托管与开源协作平台。找开源项目、读源码、发布自己的作品、给大佬提 issue，都在这里。进阶课「打造个人网站」和作品展示的天然舞台，也是找 AI 学习资源（awesome 列表、官方仓库）的第一站。程序员与非程序员都该有个账号。",
    links: [{ label: "访问官网", url: "https://github.com" }],
    badges: [{ text: "免费", type: "ok" }],
    logo: "github",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    cat: "Vibe Coding",
    desc: "AI 编程助手鼻祖，嵌入 VS Code / JetBrains 的补全与对话，背后是 OpenAI/Claude 模型。",
    longDesc:
      "AI 编程助手的开创者。在 VS Code / JetBrains 里给你行级补全、选中代码解释、整个文件生成的对话。底层可切换 GPT 与 Claude 模型。虽然现在 Cursor 等更卷，Copilot 依然是订阅 OpenAI/Copilot Pro 用户零成本起步的选项，免费档也够新手用。",
    links: [{ label: "访问官网", url: "https://github.com/features/copilot" }],
    badges: [{ text: "有免费档", type: "ok" }, { text: "需外网", type: "warn" }],
    logo: "github-copilot",
  },
  {
    id: "gemini",
    name: "Gemini",
    cat: "文本生成",
    desc: "Google 旗舰多模态模型，超长上下文 + 深度整合 Google 全家桶与搜索。",
    longDesc:
      "Google 的旗舰 AI 模型（Gemini 2.x 系列）。多模态能力强——文本、图像、音视频一起理解；超长上下文让读超大文档很轻松；和 Google 搜索、Workspace（Docs/Gmail）深度打通。免费额度大，Deep Research 做资料调研很猛。需外网。",
    links: [{ label: "访问官网", url: "https://gemini.google.com" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "gemini",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    cat: "AI 搜索",
    desc: "AI 搜索引擎代表：问题 → 实时联网搜索 → 带引用来源的回答，比传统搜索更好用。",
    longDesc:
      "AI 搜索引擎的开创者。你提问，它实时联网搜索并整理成带「引用来源」的回答——每条结论都能点开看原始出处，调研效率远高于传统搜索+自己啃链接。适合查资料、验证信息、快速了解一个陌生领域。免费版够用，Pro 可切换更强模型。需外网。",
    links: [{ label: "访问官网", url: "https://www.perplexity.ai" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "perplexity",
  },
  {
    id: "flux",
    name: "Flux",
    cat: "图像生成",
    desc: "Black Forest Labs 出品，当前开源生图质量天花板，ComfyUI 里的大热门。",
    longDesc:
      "Black Forest Labs（Stable Diffusion 原团队）出品的开源图像模型。FLUX.1 系列是目前开源生图的质量天花板，真实感、文字渲染、提示词理解都极强。可以在 ComfyUI 里本地跑（对显卡有要求）或走各家 API。开源可商用（需看具体 license），想玩「本地全流程生图」的人首选。",
    links: [
      { label: "GitHub 仓库", url: "https://github.com/black-forest-labs/flux" },
      { label: "官网", url: "https://blackforestlabs.ai" },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "本地/API", type: "cy" }],
    logo: "flux.svg",
  },
  {
    id: "recraft",
    name: "Recraft",
    cat: "图像生成",
    desc: "专精矢量图、图标、品牌设计的 AI 生图工具，还能生成 SVG 源文件。",
    longDesc:
      "偏设计场景的 AI 生图工具：强项是矢量图（可直接导出 SVG）、图标、Logo、品牌视觉与 UI 元素。对非科班想快速出「能商用、可编辑」设计素材的人很友好。免费档够体验，做自媒体视觉、PPT 配图、图标需求时值得用。",
    links: [{ label: "访问官网", url: "https://www.recraft.ai" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "recraft",
  },
  {
    id: "windsurf",
    name: "Windsurf",
    cat: "Vibe Coding",
    desc: "Agent 化 AI IDE（前 Codeium），跨文件级理解 + 自动执行的「Cascade」模式。",
    longDesc:
      "前身 Codeium 的 AI IDE，率先做「Agent 化编辑器」：不只补全，而是整文件、跨文件的自动修改（Cascade 模式能自己规划并执行多步任务）。和 Cursor 直接对标，界面清爽、免费档额度大。想试试 Cursor 之外的 agent IDE 的人的好选择。需外网。",
    links: [{ label: "访问官网", url: "https://windsurf.com" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "windsurf",
  },
  {
    id: "ideogram",
    name: "Ideogram",
    cat: "图像生成",
    desc: "以「图中文字渲染准确」闻名的生图工具，做海报/带字视觉图很强。",
    longDesc:
      "以文字渲染能力闻名的文生图工具——让图里出现正确拼写的文字（海报、Logo、带标题的视觉图）是它的招牌。也有自家图像模型。适合做宣传海报、封面图、需要「图上带字」的场景。需外网，免费档每天有额度。",
    links: [{ label: "访问官网", url: "https://ideogram.ai" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "ideogram",
  },
  {
    id: "trae",
    name: "Trae",
    cat: "Vibe Coding",
    desc: "字节跳动 AI IDE，国内直连可用，内置 Builder/Agent 模式，中文友好。",
    longDesc:
      "字节跳动出品的 AI IDE（国际版 + 国内版）。内置 Builder（一次生成整个功能）与 Agent（自主多步执行）模式，中文界面和提示词友好，国内直连可用是它对比 Cursor 的最大优势。国产 vibe coding 起步的首选，免费。",
    links: [{ label: "访问官网", url: "https://www.trae.ai" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "免费", type: "ok" }],
    logo: "trae",
  },
  {
    id: "codex",
    name: "Codex",
    cat: "Vibe Coding",
    desc: "OpenAI 的编程 agent，终端里跑，能自己读代码、改文件、跑命令完成任务。",
    longDesc:
      "OpenAI 的编程智能体（CLI 版，团队前身是 Codex/CLI）。在终端里用自然语言派活：它自己读代码、改文件、跑测试、迭代直到完成，像有个 junior 工程师在帮你干活。配合 ChatGPT 订阅使用。和 Claude Code / OpenCode 同属「coding agent」路线，适合想体验让 AI 全程干活的玩家。",
    links: [{ label: "访问官网", url: "https://openai.com/codex" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "需订阅", type: "warn" }],
    logo: "codex",
  },
  {
    id: "kling",
    name: "可灵 Kling",
    cat: "视频生成",
    desc: "快手出品，国产文生视频第一梯队，画质与动态质感接近国际顶尖水平。",
    longDesc:
      "快手推出的 AI 视频生成工具。文生视频、图生视频都能做，动态自然度、镜头感在国产工具里领先，甚至对标 Sora。中文提示词友好、国内直连。做短视频、动态分镜、产品演示动效很合适。有免费额度，会员档更强。",
    links: [{ label: "访问官网", url: "https://klingai.com" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "有免费档", type: "ok" }],
    logo: "kling",
  },
  {
    id: "hailuo",
    name: "海螺 Hailuo",
    cat: "视频生成",
    desc: "MiniMax 出品的视频生成模型，动态质量高，图生视频表现抢眼。",
    longDesc:
      "MiniMax（稀宇科技）出品的 AI 视频生成工具（Hailuo 模型）。运动一致性与画面质量出色，尤其图生视频可以「让一张图动起来」。国内直连、免费额度体验友好。做动态素材、让照片活起来、短视频灵感试验都顺手。",
    links: [{ label: "访问官网", url: "https://hailuoai.com" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "有免费档", type: "ok" }],
    logo: "hailuo",
  },
  {
    id: "metaso",
    name: "秘塔 AI 搜索",
    cat: "AI 搜索",
    desc: "国产 AI 搜索：无广告、结果清爽，自动生成大纲与脑图，中文研究利器。",
    longDesc:
      "国产 AI 搜索引擎。无广告、界面极简，搜索后自动整理成结构化回答 + 引用来源，还能一键生成大纲和思维导图。中文场景的资料搜集、写文章前调研非常好用。有免费档（慢速），会员更快更强。无需外网。",
    links: [{ label: "访问官网", url: "https://metaso.cn" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "有免费档", type: "ok" }],
    logo: "metaso",
  },
  {
    id: "suno",
    name: "Suno",
    cat: "音乐语音",
    desc: "AI 音乐生成天花板：输入一句描述（或歌词）就能生成完整带人声歌曲。",
    longDesc:
      "AI 音乐生成的开创者。给它一段描述（「电子的、节奏明快的广告歌」）甚至直接写歌词，它能生成带人声和编曲的完整歌曲，还能续写、扩展。做视频 BGM、节目主题曲、玩票都惊艳。免费版每天有额度。需外网。",
    links: [{ label: "访问官网", url: "https://suno.com" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "suno",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    cat: "音乐语音",
    desc: "AI 语音合成与克隆的天花板，配音、多语言、情绪表达都极其自然。",
    longDesc:
      "AI 语音领域的头部玩家。文字转语音的自然度、情绪表现、多语言能力都很强，还能做声音克隆。做视频配音、播客、有声内容、角色语音都合适。免费版每月有字数额度，需外网。",
    links: [{ label: "访问官网", url: "https://elevenlabs.io" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "elevenlabs",
  },
  {
    id: "udio",
    name: "Udio",
    cat: "音乐语音",
    desc: "AI 音乐生成，音质细腻、擅长真实乐器质感，Suno 的主要竞品。",
    longDesc:
      "AI 音乐生成工具，前 Google DeepMind 成员创办。在音质与「真实感」上口碑好，尤其擅长让生成的歌听起来不像「AI 味」。可生成整曲、remix、扩展。适合对音乐质感要求更高的创作者。免费版有额度，需外网。",
    links: [{ label: "访问官网", url: "https://www.udio.com" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "udio",
  },
  {
    id: "deepseek-platform",
    name: "DeepSeek 开放平台",
    cat: "模型与 API",
    desc: "DeepSeek 官方 API 平台：调用 V3/R1 模型，价格低，国内开发者首选。",
    longDesc:
      "DeepSeek 的开发者 API 平台。在这里申请 API Key、充值、调用 DeepSeek-V3 / R1 等模型（OpenAI 兼容接口）。以极低价格提供强推理能力，是国产 AI 应用与 Agent 后端的性价比之王——Vibe Lab 的 Lab Agent 大脑也跑在它上面。",
    links: [{ label: "开放平台", url: "https://platform.deepseek.com" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "按量付费", type: "warn" }],
    logo: "deepseek",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    cat: "模型与 API",
    desc: "一个 Key 调用几百个模型（含 Claude/GPT/Gemini/国产），按量计费、自由切换。",
    longDesc:
      "模型 API 聚合平台：注册一个 Key，就能通过统一接口调用几百个模型——OpenAI、Claude、Gemini、DeepSeek、Llama 等全在一个地方，按 token 计费，随时切换对比。做应用想「不被单一模型绑死」或想低成本试各种模型的开发者必备。需外网。",
    links: [{ label: "访问官网", url: "https://openrouter.ai" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "按量付费", type: "warn" }],
    logo: "openrouter",
  },
  {
    id: "lovable",
    name: "Lovable",
    cat: "Vibe Coding",
    desc: "对话直接生成完整全栈产品（前端+数据库+登录），非科班做产品的神器。",
    longDesc:
      "「把想法变成能用的产品」最快的工具之一：用对话描述需求，它直接生成带前端、数据库、认证登录的完整 Web 应用，还能连接外部数据、迭代修改。给非科班的人做 MVP、接单、作品集都极合适——你只管描述想要什么，它把能跑的东西给你。有免费额度，需外网。",
    links: [{ label: "访问官网", url: "https://lovable.dev" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "lovable",
  },
  {
    id: "bolt",
    name: "Bolt.new",
    cat: "Vibe Coding",
    desc: "StackBlitz 出品：浏览器里对话生成并实时运行完整 Web 应用。",
    longDesc:
      "在浏览器里「边聊边跑」的 AI 应用生成器（StackBlitz 出品）。描述需求 → 生成前端代码并在右侧浏览器实时预览可交互 → 继续对话修改 → 一键部署。零环境配置，非科班也能快速做出能演示的 Web 应用原型。需外网。",
    links: [{ label: "访问官网", url: "https://bolt.new" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "bolt.svg",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    cat: "模型与 API",
    desc: "全球最大开源 AI 模型社区：找模型、数据集、在线试玩、免费推理 API。",
    longDesc:
      "AI 界的 GitHub。找开源模型（Llama、Qwen、FLUX 等）、数据集、Demo 都在这里；Space 让你在线试玩别人部署的应用，还有免费推理 API。想跟上开源 AI 生态、找现成模型资源的人必逛。国内访问偶有不稳，但值得克服。",
    links: [{ label: "访问官网", url: "https://huggingface.co" }],
    badges: [{ text: "开源社区", type: "ok" }, { text: "需外网", type: "warn" }],
    logo: "huggingface",
  },
  {
    id: "dify",
    name: "Dify",
    cat: "Agent 与自动化",
    desc: "开源 LLM 应用开发平台：可视化编排 Agent / 工作流 / RAG，可自托管。",
    longDesc:
      "开源（Apache-2.0）的 LLM 应用开发平台。可视化地编排 Agent、多步工作流、知识库（RAG）、对话应用，然后发布成 API 或网页。支持接入任意模型，可云端用也可完全自托管。进阶课做「Agent 实战」时的国产优秀底座，国内可直接部署。",
    links: [
      { label: "访问官网", url: "https://dify.ai" },
      { label: "GitHub 仓库", url: "https://github.com/langgenius/dify" },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "可自托管", type: "cy" }],
    logo: "dify",
  },
  {
    id: "notion-ai",
    name: "Notion AI",
    cat: "办公效率",
    desc: "笔记/知识库 + AI 全家桶：写作、总结、问答、自动填充，All-in-one 工作台。",
    longDesc:
      "Notion 内置的 AI 能力。在笔记、文档、数据库里直接调用 AI：起草写作、总结长文、根据表格问答、翻译润色。把「知识管理」和「AI 助手」揉进一个工作流，做笔记型学习与个人知识库的人很受用。需外网，有免费 AI 试用额度。",
    links: [{ label: "访问官网", url: "https://www.notion.so" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "notion",
  },
  {
    id: "runway",
    name: "Runway",
    cat: "视频生成",
    desc: "好莱坞级 AI 视频工具（Gen-4），专业创作者常用的视频生成与编辑套件。",
    longDesc:
      "AI 视频生成的老牌玩家（Gen-3/Gen-4 系列），被好莱坞影视行业采用。文生视频、图生视频、视频局部重绘、绿幕抠像、运动笔刷等专业工具一应俱全。对画面质感和控制力要求高的创作者首选。需外网，付费为主。",
    links: [{ label: "访问官网", url: "https://runwayml.com" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "付费", type: "warn" }],
    logo: "runway",
  },
  {
    id: "tongyi-qianwen",
    name: "通义千问",
    cat: "文本生成",
    desc: "阿里出品，国产开源大模型主力，Qwen 系列也是开发者最爱的开源底座。",
    longDesc:
      "阿里云出品的国产大模型。对话 App（通义千问/通义 App）免费好用，还整合了读文档、做 PPT、画画等多功能；更关键的是 Qwen 开源系列是全球开发者最常选的开源模型之一。国内直连免费，对话、办公、开发都覆盖。",
    links: [{ label: "访问官网", url: "https://tongyi.aliyun.com" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "有免费档", type: "ok" }],
    logo: "tongyi",
  },
  {
    id: "grok",
    name: "Grok",
    cat: "文本生成",
    desc: "xAI 出品，接入 X（推特）实时信息，风格犀利，推理用 Grok 3 很强。",
    longDesc:
      "马斯克 xAI 推出的模型。深度整合 X（推特）实时信息流，风格直接不装。Grok 3 / Grok 4 系列的推理与编码能力已进入第一梯队。X Premium 订阅可免费用；想追踪「网上正在热议什么」+ AI 分析的话很有特色。需外网。",
    links: [{ label: "访问官网", url: "https://grok.com" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "订阅含", type: "warn" }],
    logo: "grok",
  },
  {
    id: "replit",
    name: "Replit",
    cat: "Vibe Coding",
    desc: "浏览器里的在线 IDE + Agent（Replit Agent），零配置写代码、一键部署。",
    longDesc:
      "在线开发平台：浏览器里直接写代码、跑起来、部署，无需本地环境。Replit Agent 让你用对话生成整个应用。适合零基础体验「写一个能跑的东西」、快速原型验证、以及不想配环境的人。需外网。",
    links: [{ label: "访问官网", url: "https://replit.com" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "replit",
  },
  {
    id: "v0",
    name: "v0",
    cat: "Vibe Coding",
    desc: "Vercel 出品的 AI UI 生成器：对话描述界面 → 生成 React/Tailwind 前端代码。",
    longDesc:
      "Vercel 出品的 AI 前端生成器。用自然语言描述想要的界面，它生成高质量 React + Tailwind 代码，可直接在 Vercel 部署。做网页/产品 UI 原型、落地页、组件很快，前端非科班也能「要什么界面出什么界面」。有免费档，需外网。",
    links: [{ label: "访问官网", url: "https://v0.dev" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "v0.svg",
  },
  {
    id: "claude-code",
    name: "Claude Code",
    cat: "Vibe Coding",
    desc: "Anthropic 官方终端 agent：在终端里让 Claude 自己读代码、改文件、跑命令。",
    longDesc:
      "Anthropic 官方的 agentic 编程工具，跑在终端里。你用自然语言派任务，Claude Code 自己读代码库、跨文件修改、执行命令、跑测试迭代。Claude 编程能力 + Agent 自主执行的组合，是目前 coding agent 里口碑最强的之一。需外网、需 Claude 订阅或 API。",
    links: [{ label: "访问官网", url: "https://docs.anthropic.com/en/docs/claude-code" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "需订阅", type: "warn" }],
    logo: "claude-code",
  },
  {
    id: "crewai",
    name: "CrewAI",
    cat: "Agent 与自动化",
    desc: "开源多 Agent 协作框架：定义角色分工，让多个 AI 像团队一样协作完成任务。",
    longDesc:
      "开源的多 Agent 框架。核心概念是「角色分工」：定义一群各司其职的 Agent（研究员、写手、审稿人…）和一个任务流程，它们像团队一样接力协作完成复杂工作。想理解或搭建「多 Agent 协作」的进阶玩家值得学。Python 生态。",
    links: [{ label: "GitHub 仓库", url: "https://github.com/crewAIInc/crewAI" }],
    badges: [{ text: "开源", type: "ok" }, { text: "需外网", type: "warn" }],
    logo: "crewai",
  },
  {
    id: "langchain",
    name: "LangChain",
    cat: "Agent 与自动化",
    desc: "最流行的 LLM 应用开发框架：链、Agent、记忆、工具调用一整套生态。",
    longDesc:
      "最流行的 LLM 应用开发框架（Python/JS）。提供连接模型、管理上下文记忆、调用外部工具、编排多步 Agent 的整套抽象，是学习「AI 应用工程」绕不开的起点。生态庞大（LangGraph 做复杂状态流）。适合想从「用 AI」进阶到「开发 AI 应用」的人。",
    links: [{ label: "GitHub 仓库", url: "https://github.com/langchain-ai/langchain" }],
    badges: [{ text: "开源", type: "ok" }, { text: "需外网", type: "warn" }],
    logo: "langchain",
  },
  {
    id: "canva",
    name: "Canva",
    cat: "办公效率",
    desc: "在线设计平台 + AI（Magic Studio）：非设计师快速做图、做 PPT、做海报。",
    longDesc:
      "人人可用的在线设计工具。海量模板 + AI 能力（Magic Write 文案、Magic Design 一键生成、图生图、去背景、扩图）让你不用会设计软件也能做海报、PPT、社媒图、视频封面。免费版就非常能打。自媒体与课程视觉素材常备。",
    links: [{ label: "访问官网", url: "https://www.canva.com" }],
    badges: [{ text: "有免费档", type: "ok" }],
    logo: "canva",
  },
  {
    id: "figma-ai",
    name: "Figma AI",
    cat: "办公效率",
    desc: "设计协作工具 Figma 的 AI：自然语言生成 UI、切图、一键换风格。",
    longDesc:
      "Figma 内置的 AI 能力（First Draft、Make Design 等）：用自然语言描述就能生成可编辑的 UI 设计稿，还能一键替换风格、生成内容、整理图层。做网页/产品原型（尤其配合 v0 / vibe coding）时前后端衔接顺畅。有免费档，需外网。",
    links: [{ label: "访问官网", url: "https://www.figma.com" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "figma",
  },
  {
    id: "modelscope",
    name: "魔搭 ModelScope",
    cat: "模型与 API",
    desc: "阿里开源模型社区：国内下模型、在线试玩、免费调用，Hugging Face 的国产平替。",
    longDesc:
      "阿里出品的开源模型社区（Hugging Face 的国内版）。找国产/开源模型、数据集、在线 Demo，下载速度快；还提供免费/低价模型 API（含 Qwen）。国内开发者与学习者用起来没网络障碍，非常适合作为开源模型的第一站。",
    links: [{ label: "访问官网", url: "https://modelscope.cn" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "免费", type: "ok" }],
    logo: "modelscope",
  },
  {
    id: "glideo",
    name: "Glideo",
    cat: "视频生成",
    desc: "macOS 录屏自动剪辑工具：记录点击自动生成镜头运镜，做教程演示神器。",
    longDesc:
      "免费的 macOS 录屏 + 自动剪辑工具：录制时记录你的鼠标点击，结束后自动为每次点击生成「放大-停留-移出」的镜头运动，还能自动平滑光标、加圆角阴影背景、一键输出 16:9 / 9:16 竖屏（最高 4K 无水印）。做产品演示、软件教程、功能讲解视频效率极高——课程录屏利器。",
    links: [{ label: "访问官网", url: "https://glideo.app" }],
    badges: [{ text: "macOS", type: "cy" }, { text: "免费", type: "ok" }],
    logo: "glideo.svg",
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    cat: "Agent 与自动化",
    desc: "开源个人 AI 助手（前 Clawdbot/Moltbot）：接入微信/Telegram，替你办事。",
    longDesc:
      "开源的个人 AI 助手/智能体平台（GitHub 增长最快的项目之一，MIT）。通过一个 Gateway 连接模型与工具，接入 WhatsApp/Telegram/Discord/飞书/企业微信等日常聊天渠道——你在聊天里就能让它整理收件箱、管理日历、查航班、跑自动化。可本地/自托管运行。想拥有「住在聊天软件里的私人助理」的玩家必玩。",
    links: [
      { label: "GitHub 仓库", url: "https://github.com/openclaw/openclaw" },
      { label: "访问官网", url: "https://openclaw.ai" },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "可自托管", type: "cy" }],
    logo: "openclaw",
  },
  {
    id: "hermes",
    name: "Hermes",
    cat: "Agent 与自动化",
    desc: "Nous Research 的开源 Agent 框架与桌面端：模型 / 工具 / 记忆全自托管。",
    longDesc:
      "Nous Research 推出的开源 Agent 生态：Hermes 系列模型 + Hermes Agent（桌面 App + headless 服务）。强调数据自主——模型、工具、记忆都在你自己的机器上跑，前端是 Electron 桌面应用。想体验「完全自托管的 coding/通用 agent」的进阶玩家参考。",
    links: [
      { label: "GitHub 仓库", url: "https://github.com/NousResearch/hermes" },
      { label: "官网", url: "https://nousresearch.com" },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "可自托管", type: "cy" }],
    logo: "hermes",
  },
  {
    id: "pi-agent",
    name: "pi agent",
    cat: "Agent 与自动化",
    desc: "开源 Agent 工具包（pi.dev）：统一 30+ 模型 + 可嵌入的 agent 运行时。",
    longDesc:
      "开源 AI agent 工具包（MIT，GitHub ~9 万星），作者是 libGDX 之父 Mario Zechner。四个积木：pi-ai（统一 30+ 模型 API）、pi-agent-core（轻量 Agent 运行时）、pi-coding-agent（终端 agent）、pi-tui（终端 UI）。模块化极好，被大量项目作底层。Vibe Lab 的 Lab Agent 后端大脑用的就是它的同源协议。",
    links: [
      { label: "访问官网", url: "https://pi.dev" },
      { label: "GitHub 仓库", url: "https://github.com/earendil-works/pi" },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "Agent 内核", type: "cy" }],
    logo: "pi-agent",
  },
  {
    id: "siliconflow",
    name: "硅基流动 SiliconFlow",
    cat: "模型与 API",
    desc: "国内开源模型聚合 API：DeepSeek / Qwen / GLM 低价直调，新用户送额度。",
    longDesc:
      "国内最常用的开源模型 API 平台，聚合 DeepSeek / Qwen / GLM / Llama 等主流开源模型，按量计费且价格低（部分模型有免费档）。新用户注册通常送额度，是国内开发者接模型 API 的第一站。Vibe Lab 教程里「写 Skill / 调 API」常用它做示例。",
    links: [{ label: "访问官网", url: "https://siliconflow.cn" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "有免费档", type: "ok" }],
    logo: "siliconflow",
  },
  {
    id: "immersive-translate",
    name: "沉浸式翻译",
    cat: "效率与浏览器",
    desc: "浏览器双语对照翻译插件：看英文网页/论文/文档，AI 逐段对照翻译。",
    longDesc:
      "装了它，任何英文网页、PDF、电子书都能变成中英对照双语。支持 DeepL / OpenAI / Gemini / 国产各家翻译引擎，免费额度日常够用。对非英文母语用户学习海外 AI 工具教程帮助巨大——Vibe Lab 教学里处理英文文档的默认推荐。",
    links: [{ label: "访问官网", url: "https://immersivetranslate.com" }],
    badges: [{ text: "浏览器插件", type: "cy" }, { text: "有免费档", type: "ok" }],
    logo: "immersive-translate",
  },
  {
    id: "fish-audio",
    name: "Fish Audio",
    cat: "音乐语音",
    desc: "开源中文 TTS 语音合成：声音克隆、超低延迟，社区模型丰富。",
    longDesc:
      "开源文字转语音（TTS）方案，中文效果顶级、支持声音克隆与实时合成，超低延迟。既有托管平台（fish.audio 在线用），也有开源仓库可自部署。给视频配中文配音、做有声内容的实用工具，国内可直接访问。",
    links: [
      { label: "访问官网", url: "https://fish.audio" },
      { label: "GitHub 仓库", url: "https://github.com/fishaudio/fish-speech" },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "中文语音", type: "cy" }],
    logo: "fish-audio",
  },
  {
    id: "haimian-music",
    name: "海绵音乐",
    cat: "音乐语音",
    desc: "字节旗下 AI 音乐生成：一句话做歌，中文填词作曲效果不错。",
    longDesc:
      "字节跳动的 AI 音乐产品（海绵音乐），输入想法就能生成带人声的完整歌曲，中文演唱效果在国产工具里属第一梯队。免费额度每天可生成若干首，适合内容创作者做 BGM / 整活。",
    links: [{ label: "访问官网", url: "https://haimian.com" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "有免费档", type: "ok" }],
    logo: "haimian-music",
  },
  {
    id: "napkin",
    name: "Napkin AI",
    cat: "办公效率",
    desc: "文字一键转信息图：把大纲/要点变成可视化图表，做 PPT 素材神器。",
    longDesc:
      "把一段文字或大纲变成漂亮的视觉化图表（流程图 / 时间轴 / 关系图），可自定义样式后导出图片或嵌入 PPT。对做演示、写文章配图的人非常省时间，免费版够个人用。",
    links: [{ label: "访问官网", url: "https://www.napkin.ai" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "napkin",
  },
  {
    id: "ollama",
    name: "Ollama",
    cat: "模型与 API",
    desc: "本地跑开源模型：一行命令下载运行 Llama / Qwen / DeepSeek，隐私拉满。",
    longDesc:
      "最流行的本地大模型运行工具：`ollama run qwen2.5` 一条命令就能在电脑上跑开源模型。免费、离线、数据不出机器，配合 Open WebUI / AnythingLLM 可搭自己的 AI 助理。想体验「不花 API 钱的 AI」从它入门最合适。",
    links: [
      { label: "访问官网", url: "https://ollama.com" },
      { label: "GitHub 仓库", url: "https://github.com/ollama/ollama" },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "本地运行", type: "cy" }],
    logo: "ollama",
  },
  {
    id: "supabase",
    name: "Supabase",
    cat: "Vibe Coding",
    desc: "开源后端 BaaS：数据库 / 登录 / 存储一键接好，Vibe Coding 产品标配。",
    longDesc:
      "开源的 Firebase 替代品：Postgres 数据库、用户登录、文件存储、实时订阅，按几个按钮就部署好，给 AI 生成的前端产品配上真正的后端。有免费档，是「Vibe Coding 做出能上线的产品」路径里的标准后端选择。",
    links: [
      { label: "访问官网", url: "https://supabase.com" },
      { label: "GitHub 仓库", url: "https://github.com/supabase/supabase" },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "有免费档", type: "ok" }],
    logo: "supabase",
  },
  {
    id: "opusclip",
    name: "Opus Clip",
    cat: "视频生成",
    desc: "长视频一键切爆款短片：AI 找高光时刻、自动加字幕字幕重排。",
    longDesc:
      "把 1 小时直播 / 长视频自动切成十几条带字幕的短视频，AI 挑选「高光片段」并排版字幕。做自媒体矩阵、课程切片的人气工具。需要外网访问，有免费额度。",
    links: [{ label: "访问官网", url: "https://www.opus.pro" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "opusclip",
  },
  {
    id: "meshy",
    name: "Meshy",
    cat: "3D 生成",
    desc: "AI 生成 3D 模型：文生 3D / 图生 3D，游戏建模素材一键出。",
    longDesc:
      "主流 AI 3D 生成工具：输入文字或图片即可生成可直接用的 3D 模型（支持贴图、四边面），导出 FBX / OBJ 用于游戏、渲染、3D 打印。有免费额度，国内可访问，是 3D 类目入门首选。",
    links: [{ label: "访问官网", url: "https://www.meshy.ai" }],
    badges: [{ text: "3D 生成", type: "cy" }, { text: "有免费档", type: "ok" }],
    logo: "meshy",
  },
  {
    id: "aippt",
    name: "AiPPT",
    cat: "办公效率",
    desc: "一句话生成 PPT：输入主题自动出大纲+成品，国内直连。",
    longDesc:
      "国内最常用的 AI 生成 PPT 工具之一：输入主题 / 文档，自动生成大纲并渲染成可直接编辑的 PPT，模板库丰富。写汇报、课程、创业 BP 都能快速出初稿，国内直连无门槛。",
    links: [{ label: "访问官网", url: "https://www.aippt.cn" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "有免费档", type: "ok" }],
    logo: "aippt",
  },
  {
    id: "d-id",
    name: "D-ID",
    cat: "视频生成",
    desc: "AI 数字人视频：一张照片让真人开口说话，多语言口播。",
    longDesc:
      "给静态照片（人像）添加表情与口型，生成「真人说话」的数字人视频，支持几十种语言。用于课程口播、产品介绍、多语言本地化。免费额度少，正式用需订阅。",
    links: [{ label: "访问官网", url: "https://www.d-id.com" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "数字人", type: "cy" }],
    logo: "d-id",
  },
  {
    id: "flowise",
    name: "Flowise",
    cat: "Agent 与自动化",
    desc: "开源拖拽式 AI 工作流：可视化编排 RAG / Agent / 多模型流水线。",
    longDesc:
      "开源的可视化 Agent / LLM 应用编排平台：拖拽节点就能搭出 RAG 问答、多 Agent 协作、工具调用等流程，一键导出 API 接入自己的产品。比 LangChain 写代码门槛低得多，适合课程学员快速做出可演示的 AI 应用。",
    links: [
      { label: "访问官网", url: "https://flowiseai.com" },
      { label: "GitHub 仓库", url: "https://github.com/FlowiseAI/Flowise" },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "可自托管", type: "cy" }],
    logo: "flowise",
  },
  {
    id: "xmind-ai",
    name: "Xmind AI",
    cat: "办公效率",
    desc: "思维导图 AI 助手：输入主题一键生成大纲，接着手动梳理。",
    longDesc:
      "Xmind 内置的 AI 功能：输入一句话自动生成思维导图大纲与分支，也可以对已有导图提问、扩写。做学习笔记、写文章结构、头脑风暴很顺手。有免费额度，国内可用。",
    links: [{ label: "访问官网", url: "https://xmind.ai" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "有免费档", type: "ok" }],
    logo: "xmind-ai",
  },
  {
    id: "remini",
    name: "Remini",
    cat: "图像生成",
    desc: "老照片修复与增强：模糊图变清晰、老照片上色、人像精修。",
    longDesc:
      "现象级照片修复 App：把模糊 / 低清的老照片、视频变成高清，还能上色、增强人像细节。对做怀旧内容、资料修复很实用。有移动 App 与网页版，免费额度有限。",
    links: [{ label: "访问官网", url: "https://remini.ai" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "照片修复", type: "cy" }],
    logo: "remini",
  },
  {
    id: "flowgpt",
    name: "FlowGPT",
    cat: "文本生成",
    desc: "全球最大提示词社区：几十万现成 Prompt 直接复制使用。",
    longDesc:
      "全球最大 AI 提示词分享社区：搜索别人写好的 Prompt（角色扮演、写作、编程、图像提示词），一键复制到 ChatGPT / Claude 用。学「提示词怎么写」的最佳参考素材库，也支持发布自己的作品。",
    links: [{ label: "访问官网", url: "https://flowgpt.com" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "提示词库", type: "cy" }],
    logo: "flowgpt",
  },
  {
    id: "langgraph",
    name: "LangGraph",
    cat: "Agent 与自动化",
    desc: "LangChain 官方的 Agent 编排框架：用图结构控制复杂多步任务。",
    longDesc:
      "LangChain 团队推出的 Agent 框架：把工作流建模成图（节点=步骤，边=跳转），支持循环、分支、人机交互，是构建生产级 Agent 的主流方案。偏程序员向，适合进阶学员在学完基础后深入。",
    links: [
      { label: "访问官网", url: "https://langchain-ai.github.io/langgraph/" },
      { label: "GitHub 仓库", url: "https://github.com/langchain-ai/langgraph" },
    ],
    badges: [{ text: "开源", type: "ok" }, { text: "程序员向", type: "warn" }],
    logo: "langgraph",
  },
  {
    id: "zapier",
    name: "Zapier AI",
    cat: "Agent 与自动化",
    desc: "跨应用自动化 + AI 步骤：让几千个 App 之间自动流转干活。",
    longDesc:
      "老牌无代码自动化平台：把 Gmail / Notion / 表格 / Slack 等几千个应用连起来自动流转，新加入的 AI 步骤可做内容生成、总结、分类。做「个人自动化小助手」的低门槛入口，有免费档。",
    links: [{ label: "访问官网", url: "https://zapier.com" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "自动化", type: "cy" }],
    logo: "zapier",
  },
  {
    id: "genspark",
    name: "Genspark",
    cat: "AI 搜索",
    desc: "生成式 AI 搜索：问题直接产出整理好的答案页与引用来源。",
    longDesc:
      "新一代 AI 搜索引擎：不是给一堆链接，而是直接生成带信息结构的答案页（含多角度小结与来源标注），还能一键转 PPT / 思维导图。适合做调研、写报告前收集资料。",
    links: [{ label: "访问官网", url: "https://www.genspark.ai" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "有免费档", type: "ok" }],
    logo: "genspark",
  },
  {
    id: "voiceflow",
    name: "Voiceflow",
    cat: "Agent 与自动化",
    desc: "无代码搭建对话式 Agent：可视化设计聊天机器人/语音助手流程。",
    longDesc:
      "面向产品经理的无代码对话 Agent 设计平台：拖拽画出对话流程，接入 ChatGPT / Claude 等模型做智能客服、语音助手，支持测试与发布。做「客服机器人」类作品可用它。",
    links: [{ label: "访问官网", url: "https://www.voiceflow.com" }],
    badges: [{ text: "需外网", type: "warn" }, { text: "无代码", type: "cy" }],
    logo: "voiceflow",
  },
  {
    id: "libtv",
    name: "LibTV",
    cat: "视频生成",
    desc: "专业视频创作工具：面向内容创作者的剪辑/后期一站式平台。",
    longDesc:
      "LibTV（liblib.tv）是面向内容创作者的专业视频创作工具，覆盖剪辑、特效、调色到成片输出的工作流。定位比通用剪辑工具更聚焦「把内容做成片」的全流程，让创作者少在工具间反复切换。适合做自媒体、课程视频、产品演示的人。",
    links: [{ label: "访问官网", url: "https://www.liblib.tv" }],
    badges: [{ text: "国内直连", type: "ok" }, { text: "视频创作", type: "cy" }],
    logo: "libtv",
  },
];
