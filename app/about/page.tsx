import { redirect } from "next/navigation";

/** 关于页已与联系页融合（品牌介绍 + 联系渠道 + 训练营报名都在 /contact） */
export default function AboutPage() {
  redirect("/contact");
}
