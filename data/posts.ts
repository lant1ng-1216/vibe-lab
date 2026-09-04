export type PostItem = {
  id: string;
  date: string; // display date e.g. 09-04
  tag: string;
  title: string;
  desc: string;
  href: string;
};

/**
 * 创始人手写公告 —— 想发新动态直接在这加一条。
 */
export const POSTS: PostItem[] = [
  {
    id: "p1",
    date: "09-04",
    tag: "课程",
    title: "进阶课 6 节大纲定稿：下山 · 打造属于 AI 时代的个人网站",
    desc: "能力爬坡链路从提示词一直走到个人总展示台，每节配一个实物产出。",
    href: "/courses#builder",
  },
  {
    id: "p2",
    date: "09-04",
    tag: "上新",
    title: "工具库收录 Clash Verge Rev",
    desc: "访问 ChatGPT / Claude 等海外服务时的环境准备工具，已按分类收录。",
    href: "/tools",
  },
  {
    id: "p3",
    date: "09-03",
    tag: "作品",
    title: "Hacker 档 1v1 带打名额开放预约",
    desc: "创始人本人带打真实比赛，线上 / 线下均可，课程详情页可咨询。",
    href: "/courses#hacker",
  },
];
