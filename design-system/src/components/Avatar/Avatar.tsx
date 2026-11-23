/*
 * Avatar : image ou initiales, sur fond neutre. Spec : Avatar.spec.md. Décision : D-163.
 */
import { useState } from "react";
import { cx } from "../../lib/cx";

export interface AvatarProps {
  /** Nom de la personne ou de l'élément : nom accessible et source des initiales. */
  name: string;
  /** Adresse de l'image. Si elle ne charge pas, les initiales s'affichent. */
  src?: string;
  /** 24, 32 ou 40 px. */
  size?: "sm" | "md" | "lg";
}

const SIZE = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
} as const;

/** Initiales : première lettre du premier et du dernier mot qui commencent par une lettre ; « ? » sinon. */
export function initials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => /^\p{L}/u.test(w));
  const picked = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return picked.map((w) => [...(w ?? "")][0]?.toLocaleUpperCase() ?? "").join("") || "?";
}

/** Cercle de 24, 32 ou 40 px : l'image, ou les initiales sur fond neutre (D-163). */
export function Avatar({ name, src, size = "md" }: AvatarProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = src && failed !== src;
  return (
    <span
      role="img"
      aria-label={name}
      className={cx(
        "inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-(--avatar-bg,var(--field)) font-sans leading-none font-semibold text-fg select-none",
        SIZE[size],
      )}
    >
      {showImage ? <img src={src} alt="" className="block size-full object-cover" onError={() => setFailed(src)} /> : <span aria-hidden>{initials(name)}</span>}
    </span>
  );
}
