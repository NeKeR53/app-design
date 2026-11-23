/**
 * États des résultats, communs à Table et List (D-077, D-084 à D-087). Usage interne.
 */
import type { ReactNode } from "react";
import { Button } from "react-aria-components/Button";
import { AlertTriangle } from "../icons";
import { buttonReset, cx, focusRing } from "./cx";
import { useMessages } from "../provider/SocleProvider";
import { EmptyState } from "../components/EmptyState/EmptyState";

/** Options d'état partagées par Table et List. */
export interface ResultsStateProps {
  /** Chargement en cours : squelettes s'il n'y a encore rien, sinon barre fine au-dessus des résultats (D-084). */
  isLoading?: boolean;
  /** Le dernier chargement a échoué : message, ou bandeau au-dessus des anciens résultats (D-085). */
  hasError?: boolean;
  onRetry?: () => void;
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

/** Barre de 2 px qui défile en haut de la zone pendant un rechargement (D-084). */
export function ReloadBar() {
  const m = useMessages();
  return (
    <div role="progressbar" aria-label={m.loadingResults} className="pointer-events-none sticky top-0 z-[3] h-0.5 overflow-hidden">
      <span className="socle-reload absolute inset-y-0 w-[30%] bg-accent" />
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
export function ErrorBanner({ onRetry }: { onRetry?: (() => void) | undefined }) {
  const m = useMessages();
  return (
    <div role="alert" className="my-2 flex items-center gap-2 rounded-md bg-field px-3 py-2 text-sm text-fg-2">
      <span className="text-warning">
        <AlertTriangle size={14} />
      </span>
      {m.notUpdated}
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
