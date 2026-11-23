/*
 * Squelettes de chargement. Spec : Skeleton.spec.md. Décision : D-165.
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";

export interface SkeletonProps {
  /** Ligne de texte (10 px de haut), cercle (avatar, icône) ou bloc (vignette, carte). */
  shape?: "line" | "circle" | "rect";
  /** Largeur : nombre en px ou valeur CSS (« 40% »). Défaut : toute la largeur ; 32 px pour un cercle. */
  width?: number | string;
  /** Hauteur : nombre en px ou valeur CSS. Défaut : 10 px pour une ligne, la largeur pour un cercle, 40 px pour un bloc. */
  height?: number | string;
}

const SHAPE = { line: "rounded-sm", circle: "rounded-full", rect: "rounded-md" } as const;

/** Forme immobile en `--field` (D-165). Décorative : le nom est porté par `SkeletonGroup`. */
export function Skeleton({ shape = "line", width, height }: SkeletonProps) {
  const w = width ?? (shape === "circle" ? 32 : "100%");
  const h = height ?? (shape === "line" ? 10 : shape === "circle" ? w : 40);
  const style: CSSProperties = { width: w, height: h };
  return <i aria-hidden className={cx("block shrink-0 bg-field", SHAPE[shape])} style={style} />;
}

export interface SkeletonGroupProps {
  /** Squelettes, disposés comme le contenu attendu. */
  children: ReactNode;
  /** Nom annoncé. Défaut : « Chargement… ». */
  label?: string;
  /** Délai avant l'affichage, en ms (200 par défaut) : rien ne clignote si la réponse est rapide. */
  delay?: number;
}

/** Groupe de squelettes : `aria-busy`, nom « Chargement… », affiché après 200 ms (D-165). */
export function SkeletonGroup({ children, label, delay = 200 }: SkeletonGroupProps) {
  const m = useMessages();
  const [visible, setVisible] = useState(delay <= 0);
  useEffect(() => {
    if (delay <= 0) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div role="status" aria-busy="true" aria-label={label ?? m.loading} className="socle-box">
      {visible && children}
    </div>
  );
}
