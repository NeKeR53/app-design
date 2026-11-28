/**
 * États des résultats, communs à Table et List (D-077, D-084 à D-087). Usage interne.
 */
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "react-aria-components/Button";
import { AlertTriangle } from "../icons";
import { buttonReset, cx, focusRing } from "./cx";
import { useMessages } from "../provider/SocleProvider";
import { EmptyState } from "../components/EmptyState/EmptyState";
import { toDate, useFormatValue } from "../components/FormattedValue/FormattedValue";

/** Options d'état partagées par Table et List. */
export interface ResultsStateProps {
  /** Chargement en cours : squelettes s'il n'y a encore rien, sinon barre fine au-dessus des résultats (D-084). */
  isLoading?: boolean;
  /** Le dernier chargement a échoué : message, ou bandeau au-dessus des anciens résultats (D-085). */
  hasError?: boolean;
  onRetry?: () => void;
  /**
   * Date des résultats affichés (dernière lecture réussie) : en erreur avec des résultats, le bandeau dit leur âge,
   * « Dernière mise à jour il y a 12 minutes » (D-434). `Date`, horodatage ou texte ISO.
   */
  updatedAt?: Date | number | string;
  /** Critères de la recherche en cours : « aucun résultat » (D-086) et texte trouvé en gras (D-087). */
  searchTerms?: string[];
  onClearSearch?: () => void;
}

export const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Met en gras, sans changer de couleur, le texte qui correspond à un critère (D-087). */
export function highlight(text: string, terms: string[] | undefined): ReactNode {
  const ts = (terms ?? []).map(norm).filter(Boolean);
  if (!ts.length) return text;
  const n = norm(text);
  const marks: Array<[number, number]> = [];
  for (const t of ts) {
    let i = 0;
    let k: number;
    while ((k = n.indexOf(t, i)) >= 0) {
      marks.push([k, k + t.length]);
      i = k + t.length;
    }
  }
  if (!marks.length) return text;
  marks.sort((a, b) => a[0] - b[0]);
  const out: ReactNode[] = [];
  let pos = 0;
  marks.forEach(([a, b], i) => {
    if (a < pos) return;
    if (a > pos) out.push(text.slice(pos, a));
    out.push(
      <b key={i} className="font-semibold">
        {text.slice(a, b)}
      </b>,
    );
    pos = b;
  });
  if (pos < text.length) out.push(text.slice(pos));
  return out;
}

/**
 * Barre de 2 px qui défile en haut de la zone pendant un rechargement (D-084).
 * `sticky` (défaut) : en tête d'une zone qui défile, collée en haut. `overlay` : posée en haut d'un bloc positionné,
 * rognée par son rayon (Card, PageSection encadrée). `flush` : collée en haut d'une zone qui défile, sans prendre de
 * hauteur (Page, DetailPage, D-426). Aucune ne déplace le contenu, sauf `sticky` (2 px, comme avant).
 */
export function ReloadBar({ label, placement = "sticky" }: { label?: string | undefined; placement?: "sticky" | "overlay" | "flush" }) {
  const m = useMessages();
  const bar = <span className="socle-reload absolute inset-y-0 w-[30%] bg-accent" />;
  const common = { role: "progressbar" as const, "aria-label": label ?? m.loadingResults };
  if (placement === "overlay")
    return (
      <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden rounded-[inherit]">
        <div {...common} data-reload-bar="" className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
          {bar}
        </div>
      </div>
    );
  if (placement === "flush")
    return (
      <div className="pointer-events-none sticky top-0 z-[3] h-0">
        <div {...common} data-reload-bar="" className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
          {bar}
        </div>
      </div>
    );
  return (
    <div {...common} data-reload-bar="" className="pointer-events-none sticky top-0 z-[3] h-0.5 overflow-hidden">
      {bar}
    </div>
  );
}

export function RetryButton({ onRetry, children }: { onRetry?: (() => void) | undefined; children?: ReactNode }) {
  const m = useMessages();
  return (
    <Button {...(onRetry ? { onPress: onRetry } : {})} className={cx(buttonReset, "h-(--row-h) rounded-md bg-field px-3 text-sm text-fg data-hovered:bg-hover", focusRing)}>
      {children ?? m.retry}
    </Button>
  );
}

/** Bandeau au-dessus des anciens résultats quand une nouvelle recherche échoue (D-085). */
export function ErrorBanner({ onRetry, message, updatedAt }: { onRetry?: (() => void) | undefined; message?: string; updatedAt?: Date | number | string | undefined }) {
  const m = useMessages();
  const format = useFormatValue();
  const date = updatedAt === undefined ? null : toDate(updatedAt);
  // L'âge se relit chaque minute : « il y a 12 minutes » ne reste pas figé pendant que le service ne répond pas.
  const [, tick] = useState(0);
  useEffect(() => {
    if (!date) return;
    const t = setInterval(() => tick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, [date === null]);
  return (
    <div role="alert" className="my-2 flex items-center gap-2 rounded-md bg-field px-3 py-2 text-sm text-fg-2">
      <span className="text-warning">
        <AlertTriangle size={14} />
      </span>
      <span>
        {message ?? m.notUpdated}
        {date && <span data-results-age=""> {m.lastUpdated(format(date, { type: "relative" }))}</span>}
      </span>
      <Button {...(onRetry ? { onPress: onRetry } : {})} className={cx(buttonReset, "ml-auto rounded-sm px-1.5 py-0.5 text-sm text-accent-text data-hovered:underline", focusRing)}>
        {m.retry}
      </Button>
    </div>
  );
}

/** Message centré : erreur au premier chargement, ou aucun résultat (D-085, D-086), dessiné par EmptyState sans icône (D-169). */
export function CenterMessage({ title, text, action, alert }: { title: ReactNode; text?: string; action?: ReactNode; alert?: boolean }) {
  return (
    <div role={alert ? "alert" : undefined}>
      <EmptyState title={title} {...(text ? { description: text } : {})} {...(action ? { action } : {})} />
    </div>
  );
}

export function NoResults({ terms, onClearSearch }: { terms: string[]; onClearSearch?: (() => void) | undefined }) {
  const m = useMessages();
  return (
    <CenterMessage
      title={
        <>
          {m.noResultsFor}{" "}
          {terms.map((t, i) => (
            <span key={t}>
              {i > 0 && ", "}« {t} »
            </span>
          ))}
        </>
      }
      text={m.noResultsHint}
      action={onClearSearch && <RetryButton onRetry={onClearSearch}>{m.clearSearch}</RetryButton>}
    />
  );
}

export function LoadError({ onRetry }: { onRetry?: (() => void) | undefined }) {
  const m = useMessages();
  return <CenterMessage alert title={m.loadErrorTitle} text={m.loadErrorText} action={<RetryButton onRetry={onRetry} />} />;
}
