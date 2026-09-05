# 给协作者的独立页面开发指南（vibe-lab）

> 本仓库是 **Vibe Lab 官网**：Next.js 15（App Router）+ TypeScript，样式走全局 design tokens。
> 你的页面可以**自由设计、自由排版、有自己的设计语言**——但必须守下面的「隔离铁律」：
> **只新增、不破坏**，任何改动都逃不过 owner 在 PR 里的 review。

---

## 0. 开始前

1. 在 GitHub 接受 `lant1ng-1216/vibe-lab` 的协作者邀请（Settings 通知 / 邮件里）。
2. 克隆并建自己的分支（**永远不要往 main 直推**，main 有保护）：

```bash
git clone https://github.com/lant1ng-1216/vibe-lab.git
cd vibe-lab
npm install
git checkout -b feat/<你的页面slug>   # 例：feat/deals
npm run dev                           # http://localhost:3000
```

## 1. 最小页面骨架（照抄即可）

在 `app/` 下新建一个目录就是新路由（如 `app/deals/` → 访问 `/deals`）：

```tsx
// app/deals/page.tsx
import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "页面名 — Vibe Lab · 振动实验室",   // 标题格式统一
  description: "一句话描述…",
};

export default function DealsPage() {
  return (
    <>
      <SiteNav />
      <main>{/* 你的设计在这里 */}</main>
      <SiteFooter />
    </>
  );
}
```

顶部/底部导航必须用 `<SiteNav />` + `<SiteFooter />`（不要自己再造一个）。

## 2. 隔离铁律（最重要）

### ✅ 你可以自由新增
| 路径 | 说明 |
|---|---|
| `app/<页面>/` | 你的页面目录（可含多个子页/组件） |
| `components/` 下你自己的文件 | 命名带页面前缀，如 `DealsClient.tsx` |
| `data/<页面>.ts` | 你自己的数据文件 |
| `app/<页面>/xxx.module.css` | 你的局部样式 |

### ⛔ 默认禁止改动（要动 = 在 PR 里显式说明原因与影响面）
| 路径 | 为什么 |
|---|---|
| `app/globals.css` | **全站样式**，改它影响每个页面 |
| `components/SiteNav.tsx` / `SiteFooter.tsx` / `Brand.tsx` | 共享导航，出现在所有页面 |
| `app/layout.tsx` / `bui-tokens.css` | 全局布局与设计变量 |
| 其它现有页面（`app/tools` `app/tutorials` `app/lab` `app/courses` 等） | 已有功能，禁止顺手改 |
| 现有 `data/*` 文件 | 其它页面的数据源 |

> 判断标准很简单：**这个改动会不会让别人的页面变样？会 → 先问 / 在 PR 里说清楚。**

## 3. 样式隔离（两种合法方式）

1. **推荐：CSS Modules**——建 `app/<页面>/xxx.module.css`,class 自动带作用域,**物理上不会污染全站**:
   ```tsx
   import styles from "./xxx.module.css";
   <div className={styles.card}>…</div>
   ```
2. 或**写进 globals.css 的"只追加 + 前缀"规则**(改 globals.css 属于上面灰名单,需要 PR 说明;追加带 `你的slug-` 前缀的新 class,绝不动现有规则)。

**配色/字体一律引用全局 CSS 变量**(不要写死 hex,否则风格漂移):
`var(--bg)` `var(--bg-2)` `var(--ink)` `var(--ink-soft)` `var(--ink-faint)` `var(--line)` `var(--accent)` `var(--accent-soft)`。

## 4. 其它约定

- **不要引入新的 UI 框架 / 字体 / 动画库**——需要能力先问 owner（如 GSAP 已在项目里可用）。
- **密钥绝不提交**:`.env.local` 已 gitignore,别把它 add 进去;代码里不写任何 API key。
- 文案中文为主,`metadata.title` 统一后缀「— Vibe Lab · 振动实验室」。
- 想进**顶部导航**:在 PR 里说明;或自己改 `SiteNav` 的 `LINKS`——但那是灰名单文件,owner 会在 diff 里审。

## 5. 提交前的自检

```bash
npx tsc --noEmit        # 类型必须全绿
npm run build           # 可选,构建验证
git status              # 确认没有 .env.local / 意外文件混入
```

（`node scripts/validate.mjs` 只在改动 `creators/` 或 `covers/` 时需要——你新增页面一般用不到。）

## 6. 提交 PR

```bash
git add .
git commit -m "feat(<slug>): 页面名 —— 新增 <slug> 页"
git push -u origin feat/<slug>
```
去 GitHub 开 PR(base=`main`),标题如 `feat(wool): 羊毛专区`。PR 描述里写清:
- 这个页面做什么;
- 新增了哪些文件(应当都是新增);
- **有没有动灰名单文件**(globals/SiteNav/Footer 等)?动了就写清楚为什么 + 影响面;
- (可选)放两张本地截图方便 owner 预览。

## 7. 审核与上线

- main 分支有保护:**不能直推**;CI 会自动跑校验(动创作者数据还会有白名单闸);
- owner 会看 **Files changed** 后决定合并;
- **合并即上线**(Vercel 自动部署,最长 1-2 分钟),你可以去 https://www.labagent.online 验收。

---

*有问题就在 PR 里问 owner,或在群里喊;别闷头改共享文件。*
