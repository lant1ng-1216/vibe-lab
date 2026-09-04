import Link from "next/link";
import type { Creator } from "@/data/creators";
import CreatorAvatar from "./CreatorAvatar";

/** 创作者个人页名牌（v4 恢复）：大头像 + 大字名 + bio + 社交链接 */
export default function CreatorHeader({ creator }: { creator: Creator }) {
  return (
    <div className="cp4-head">
      <Link href="/lab" className="cp4-back mono">
        ← 实验室
      </Link>
      <div className="cp4-id">
        <CreatorAvatar creator={creator} className="cp4-av" />
        <div className="cp4-info">
          <p className="cp4-handle mono">
            @{creator.handle} · LAB / {creator.handle.slice(0, 3).toUpperCase()}
          </p>
          <h1>{creator.name}</h1>
          <p className="cp4-tag">{creator.tagline}</p>
        </div>
      </div>
      {creator.bio && <p className="cp4-bio">{creator.bio}</p>}
      {creator.links && creator.links.length > 0 && (
        <div className="cp4-links">
          {creator.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="cp4-link mono"
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      )}
      {creator.joinedAt && <p className="cp4-joined mono">JOINED {creator.joinedAt}</p>}
    </div>
  );
}