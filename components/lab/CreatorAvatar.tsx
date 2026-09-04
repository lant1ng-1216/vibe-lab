"use client";

import { useState } from "react";
import type { Creator } from "@/data/creators";

/**
 * 创作者头像三级解析：
 *  1. avatar 自定义图（最高优先）
 *  2. github 用户名 → GitHub 头像（创作者在 GitHub 换头像，Lab 自动同步）
 *  3. 本地 DiceBear 生成（seed=handle 稳定同一张，冷启动演示用）
 *
 * 未来 vibe-lab/creators 仓库就绪后，创作者资料只需带上 github 用户名即可。
 */

function localDiceBear(handle: string) {
  return `/assets/lab/avatars/${handle}.svg`;
}

export function resolveAvatar(c: Creator): { src: string; local: string } {
  const local = localDiceBear(c.handle);
  if (c.avatar) return { src: c.avatar, local };
  if (c.github) return { src: `https://github.com/${c.github}.png?size=96`, local };
  return { src: local, local };
}

export default function CreatorAvatar({
  creator,
  className,
  alt,
}: {
  creator: Creator;
  className?: string;
  alt?: string;
}) {
  const { src, local } = resolveAvatar(creator);
  const [use, setUse] = useState<string>(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={use}
      alt={alt ?? creator.name}
      loading="lazy"
      className={className}
      onError={() => {
        if (use !== local) setUse(local); // GitHub/自定义加载失败 → 降级本地 DiceBear；再失败不再循环
      }}
    />
  );
}