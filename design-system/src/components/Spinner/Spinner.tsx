/*
 * Indicateur rotatif. Spec : Spinner.spec.md.
 * Dessin de la roue interne de Button, IconButton (`lib/pending.tsx`) et SearchInput, qui l'utilisent (D-081, D-105).
 */
import { cx } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";

export type SpinnerSize = "sm" | "md";

export interface SpinnerProps {
  /** `sm` : 14 px, à côté d'un texte ou dans une cellule ; `md` : 20 px, au centre d'un panneau. */
  size?: SpinnerSize;
  /** Ce qui charge, lu par le lecteur d'écran. Défaut : « Chargement… » (i18n). Ignoré si `decorative`. */
  label?: string;
  /** Décoratif : un texte visible à côté dit déjà ce qui se passe ; la roue est cachée aux lecteurs d'écran. */
  decorative?: boolean;
}

/**
 * Cercle de 2 px en couleur du texte, quart droit transparent ; `socle-spin` le ralentit 3 fois si le mouvement est réduit (D-014).
 * Couleur : `--fg-2`, sauf si un parent interne de Socle pose `--spinner-fg` (bouton en attente : couleur du bouton).
 */
const RING: Record<SpinnerSize, string> = {
  sm: "size-3.5",
  md: "size-5",
};

export function Spinner({ size = "sm", label, decorative = false }: SpinnerProps) {
  const m = useMessages();
  const ring = (
    <span
      aria-hidden="true"
      data-spinner=""
      className={cx("socle-spin box-border inline-block shrink-0 rounded-full border-2 border-current border-r-transparent [color:var(--spinner-fg,var(--fg-2))]", RING[size])}
    />
  );
  if (decorative) return ring;
  return (
    <span role="status" className="inline-flex shrink-0 align-middle">
      {ring}
      <span className="sr-only">{label ?? m.loading}</span>
    </span>
  );
}
