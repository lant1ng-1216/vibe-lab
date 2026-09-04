/**
 * Skill 库 —— 预留数据模型
 * 未来收录网上的开源 Skill（提示词技能 / Agent 技能包）时填入 SKILLS 即可，
 * 页面空态会自动替换为内容列表，无需改组件。
 *
 * Skill 与 Tool 的区别：
 *  - Tool 是一个"工具/产品"，用户要去它的官网使用
 *  - Skill 是一个"可复用的技能包"，通常是文本/JSON/代码，可安装到
 *    WorkBuddy / Claude / 自定义 Agent 中直接调用
 */

export type Skill = {
  id: string;
  name: string;
  /** 一句话说明这个 skill 解决什么问题 */
  desc: string;
  /** 适用平台：workbuddy / claude / agent / 通用… */
  platforms: string[];
  /** 标签：写作 / 编程 / 图像 / 数据分析… */
  tags: string[];
  /** 安装方式一句话，如 "复制 SKILL.md 放入 skills 目录" */
  install?: string;
  /** 开源出处 */
  source?: { label: string; url: string };
  /** 作者（个人 / 组织） */
  author?: string;
  /** 开源协议 */
  license?: string;
};

export const SKILLS: Skill[] = [];

/** Skill 空态引导文案用的几个示例话题（纯展示用，不代表已收录） */
export const SKILL_PREVIEW_TAGS = ["提示词工程", "文档写作", "数据分析", "网页开发", "研究助理"];
