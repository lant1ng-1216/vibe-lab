/**
 * 带框品牌 Logo：方框 + 绿烧杯 + 右上紫点（整体一个"章"）。
 * 与 Lab 侧栏、工具库 Skill 收录中的品牌框同源，可缩放复用。
 */
export default function FlaskBadge({
  size = 36,
  dark = false,
}: {
  size?: number;
  dark?: boolean;
}) {
  return (
    <span
      className={"flask-badge" + (dark ? " flask-badge--dark" : "")}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/flasks/green_1.png"
        alt=""
        style={{ width: Math.round(size * 0.56), height: Math.round(size * 0.56) }}
      />
    </span>
  );
}