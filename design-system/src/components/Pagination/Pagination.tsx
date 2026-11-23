/*
 * Pagination : précédent, numéros avec points de suspension, suivant. Spec : Pagination.spec.md.
 * Validation : docs/validation/components/Nouveaux-P2-P3-v1.html (P1, option A). ListPage l'utilise en mode `pages` (D-175, D-359).
 */
import { useEffect, useRef } from "react";
import { Button } from "react-aria-components/Button";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { ChevronLeft, ChevronRight } from "../../icons";
import { IconButton } from "../IconButton/IconButton";

export interface PaginationProps {
  /** Page courante, à partir de 1. */
  page: number;
  /** Nombre de pages (1 au moins). */
  pageCount: number;
  /** Appelé avec la page demandée. L'app change `page`. */
  onPageChange: (page: number) => void;
  /** Nom du repère `nav`. Défaut : « Pagination » (i18n). À préciser s'il y a plusieurs paginations sur la page. */
  label?: string;
}

/** Entrée de la suite : un numéro, ou un saut (« … »). */
export type PageEntry = number | "gap";

/**
 * Numéros à afficher, toujours 7 entrées au plus pour une largeur stable :
 * 1 2 3 4 5 … 13 ; 1 … 4 5 6 … 13 ; 1 … 9 10 11 12 13. Fonction pure.
 */
export function pageEntries(page: number, pageCount: number): PageEntry[] {
  const n = Math.max(1, Math.floor(pageCount));
  const p = Math.min(Math.max(1, Math.floor(page)), n);
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (n <= 7) return range(1, n);
  if (p <= 4) return [...range(1, 5), "gap", n];
  if (p >= n - 3) return [1, "gap", ...range(n - 4, n)];
  return [1, "gap", p - 1, p, p + 1, "gap", n];
}

/** Numéro : taille d'un bouton-icône, rayon 8 px ; page courante en `--selected`, graisse forte. */
const NUMBER = cx(
  buttonReset,
  "inline-grid h-(--icon-btn) min-w-(--icon-btn) shrink-0 cursor-default place-items-center rounded-md px-1 font-sans text-md text-fg-2 tabular-nums",
  "transition-colors duration-[var(--dur-fast)] ease-standard",
  "data-hovered:bg-hover data-hovered:text-fg data-pressed:bg-selected",
  "aria-[current=page]:bg-selected aria-[current=page]:font-semibold aria-[current=page]:text-fg",
  focusRing,
);

export function Pagination({ page, pageCount, onPageChange, label }: PaginationProps) {
  const m = useMessages();
  const nf = new Intl.NumberFormat(m.locale);
  const count = Math.max(1, Math.floor(pageCount));
  const current = Math.min(Math.max(1, Math.floor(page)), count);
  const navRef = useRef<HTMLElement>(null);
  const pressed = useRef(false);

  const go = (p: number) => {
    if (p === current || p < 1 || p > count) return;
    pressed.current = true;
    onPageChange(p);
  };

  // Le focus reste dans la pagination quand le bouton pressé disparaît ou devient inactif (première, dernière page).
  useEffect(() => {
    if (!pressed.current) return;
    pressed.current = false;
    const nav = navRef.current;
    const active = document.activeElement as HTMLButtonElement | null;
    if (!nav || (active && nav.contains(active) && !active.disabled && active.checkVisibility())) return;
    const visible = [...nav.querySelectorAll<HTMLButtonElement>("button:not([disabled])")].filter((b) => b.checkVisibility());
    (visible.find((b) => b.getAttribute("aria-current") === "page") ?? visible[0])?.focus();
  }, [current]);

  return (
    <nav ref={navRef} aria-label={label ?? m.pagination} className="socle-box flex items-center gap-0.5 font-sans text-md text-fg">
      <IconButton icon={<ChevronLeft />} label={m.previousPage} isDisabled={current <= 1} onPress={() => go(current - 1)} tooltipPlacement="top" />
      {/* Bureau et tablette : numéros. */}
      <ul className="m-0 flex list-none items-center gap-0.5 p-0 max-tablet:hidden">
        {pageEntries(current, count).map((e, i) =>
          e === "gap" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="inline-grid h-(--icon-btn) min-w-5 place-items-center text-fg-3 select-none">
              …
            </li>
          ) : (
            <li key={e} className="inline-flex">
              <Button
                aria-label={m.pageNumber(e)}
                {...(e === current ? { "aria-current": "page" as const } : {})}
                onPress={() => go(e)}
                className={NUMBER}
              >
                {nf.format(e)}
              </Button>
            </li>
          ),
        )}
      </ul>
      {/* Mobile (moins de 641 px) : « Page 5 sur 13 » entre les flèches. */}
      <span data-compact="" className="hidden px-2 text-sm whitespace-nowrap text-fg-2 tabular-nums max-tablet:inline">
        {m.pageOfPages(nf.format(current), nf.format(count))}
      </span>
      <IconButton icon={<ChevronRight />} label={m.nextPage} isDisabled={current >= count} onPress={() => go(current + 1)} tooltipPlacement="top" />
    </nav>
  );
}
