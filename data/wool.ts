/**
 * 羊毛专区 —— AI 工具白嫖额度数据
 * -------------------------------------------------
 * 与工具库 data/tools.ts 的分工：
 *  - tools.ts 回答「这个工具是什么、能干什么」
 *  - 本文件回答「能白嫖多少、门槛多高、什么时候过期」
 * 因此每条通过 toolId 关联 tools.ts（复用 logo 与官网链接），但不重复工具介绍。
 *
 * ⚠️ 维护约定：薅羊毛信息过期极快，新增/修改条目时
 *    1) checkedAt 必须填实际核实日期，不要照抄上一条
 *    2) 额度或有效期变了就改，失效了把 validity 改成 "已失效" 而不是删掉——
 *       置灰保留能让读者知道「这个没了，别白跑」
 *
 * 模板（复制后填）：
 * {
 *   id: "xxx", toolId: "tools.ts 里的 id", name: "工具名",
 *   quota: "白嫖额度", gate: "零门槛", validity: "长期",
 *   how: "一句话领取方式", trap: "坑点提示", href: "领取链接",
 *   weight: 100, checkedAt: "2026-09-06",
 * },
 */

/** 领取门槛 */
export type WoolGate = "零门槛" | "需验证" | "需外网" | "需订阅";

/** 有效期 */
export type WoolValidity = "长期" | "限时" | "已失效";

export type WoolItem = {
  id: string;
  /** 关联 data/tools.ts 的 id，用于复用 logo 与跳转；站点未收录的工具留空即可 */
  toolId?: string;
  name: string;
  /** 白嫖额度 —— 卡片主视觉，越短越好（如 "每月 $5"） */
  quota: string;
  gate: WoolGate;
  validity: WoolValidity;
  /** 截止日期，限时/已失效时填写，格式 YYYY-MM-DD */
  deadline?: string;
  /** 一句话说清怎么领 */
  how: string;
  /** 坑点提示，可不填 */
  trap?: string;
  /** 领取按钮链接 */
  href: string;
  /** 排序权重，按额度价值手动排，越大越靠前 */
  weight: number;
  /** 信息核实日期 YYYY-MM-DD */
  checkedAt: string;
};

export const WOOL_GATES: WoolGate[] = ["零门槛", "需验证", "需外网", "需订阅"];

/**
 * 首批条目为示例数据（参照 data/homeExtra.ts 的做法），
 * 上线前请逐条核实额度与有效期，并更新 checkedAt。
 */
export const WOOL: WoolItem[] = [
  {
    id: "github-education",
    name: "GitHub Education 学生包",
    quota: "Copilot Pro 免费 + 上百项权益",
    gate: "需验证",
    validity: "长期",
    how: "用学校邮箱或学生证完成 GitHub Education 认证，通过后 Copilot Pro 直接免费用。",
    trap: "在校生才行，毕业即失效；审核通常要 1-3 天，别等到要用了才申请。",
    href: "https://education.github.com/",
    weight: 100,
    checkedAt: "2026-09-06",
  },
  {
    id: "copilot-free",
    toolId: "github-copilot",
    name: "GitHub Copilot",
    quota: "每月 2000 次补全 + 50 次高级请求",
    gate: "零门槛",
    validity: "长期",
    how: "登录 GitHub 账号即可开通免费档，VS Code / JetBrains 装插件直接用。",
    trap: "高级请求用完之后会静默降级到基础模型，体感差别不小。",
    href: "https://github.com/features/copilot",
    weight: 90,
    checkedAt: "2026-09-06",
  },
  {
    id: "cursor-student",
    toolId: "cursor",
    name: "Cursor",
    quota: "学生免费一年 Pro",
    gate: "需验证",
    validity: "长期",
    how: "用学校邮箱在 Cursor 官网验证学生身份，Pro 订阅直接免一年。",
    trap: "一年到期后自动转付费，记得提前取消，否则会扣款。",
    href: "https://cursor.com/students",
    weight: 80,
    checkedAt: "2026-09-06",
  },
];
