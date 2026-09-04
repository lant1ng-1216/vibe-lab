import Link from "next/link";
import FlaskBadge from "./FlaskBadge";

export default function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="brand brand--site" aria-label="Vibe Lab 首页">
      <FlaskBadge size={36} dark={dark} />
      <span className="brand-word">
        Vibe <em>Lab</em>
      </span>
    </Link>
  );
}