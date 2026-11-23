/*
 * Adapté du starter Tailwind de React Aria (adobe/react-spectrum, starters/tailwind),
 * licence Apache 2.0. Spec : Tooltip.spec.md.
 */
import { cloneElement, isValidElement, type ReactElement } from "react";
import { Tooltip as RACTooltip, TooltipTrigger } from "react-aria-components/Tooltip";
import { useMessages, useSocle } from "../../provider/SocleProvider";
import { ariaShortcut, formatShortcut } from "../../lib/shortcut";

export interface TooltipProps {
  /** Texte de l'info-bulle. Texte seul, sans mise en forme. */
  content: string;
  /** Côté préféré ; il change si la place manque. */
  placement?: "top" | "bottom" | "start" | "end";
  /** Raccourci affiché après le texte, par exemple "Mod+K" (D-032). */
  shortcut?: string;
  /** Élément focusable qui déclenche l'info-bulle. */
  children: ReactElement;
}

/** Délai d'apparition au premier survol (D-031). */
export const TOOLTIP_DELAY = 500;

/** Bulle sombre constante (D-030), rayon 8 px (D-040), sans flèche (D-033), fondu de 120 ms. */
export const TOOLTIP_CLASS =
  "max-w-[240px] rounded-md border border-tip-line bg-tip-bg px-2 py-[3px] font-sans text-sm leading-[1.4] text-tip-fg transition-opacity duration-[var(--dur-fast)] ease-standard data-entering:opacity-0 data-exiting:opacity-0";

export function Tooltip({ content, placement = "bottom", shortcut, children }: TooltipProps) {
  const { isMac } = useSocle();
  const m = useMessages();
  // React Aria filtre aria-keyshortcuts : on le pose directement sur l'élément.
  const keys = shortcut ? ariaShortcut(shortcut, isMac) : null;
  const trigger =
    keys && isValidElement<{ ref?: unknown }>(children)
      ? cloneElement(children as ReactElement<{ ref?: (el: Element | null) => void }>, {
          ref: (el: Element | null) => el?.setAttribute("aria-keyshortcuts", keys),
        })
      : children;
  return (
    <TooltipTrigger delay={TOOLTIP_DELAY} closeDelay={0}>
      {trigger}
      <RACTooltip
        placement={placement}
        offset={6}
        containerPadding={8}
        className={TOOLTIP_CLASS}
      >
        {content}
        {shortcut && <kbd className="ml-2 font-sans text-tip-fg-2">{formatShortcut(shortcut, isMac, m)}</kbd>}
      </RACTooltip>
    </TooltipTrigger>
  );
}
