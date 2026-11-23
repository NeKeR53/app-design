/**
 * Info-bulles Socle pour des éléments qui ne sont pas des boutons (usage interne) :
 * - OverflowTooltip : texte coupé avec une ellipse, texte complet dans la bulle,
 *   seulement s'il est vraiment coupé (Tooltip.spec.md, « Contenu ») ;
 * - HintTooltip : petite icône d'état non focusable (indicateur de sidebar, D-055).
 * La bulle s'ouvre au survol après 500 ms (D-031), ou tout de suite au focus clavier
 * de l'élément qui la contient (onglet, ligne, bouton).
 */
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Tooltip as RACTooltip, TooltipTriggerStateContext, type TooltipTriggerState } from "react-aria-components/Tooltip";
import { TOOLTIP_CLASS, TOOLTIP_DELAY } from "./Tooltip";

const HOST = '[role="tab"],[role="row"],[role="columnheader"],[role="gridcell"],[role="menuitem"],[role="menuitemradio"],button,a';

function useHoverTooltip(ref: RefObject<HTMLElement | null>, onlyIfCut: boolean) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const host = onlyIfCut ? (el.closest<HTMLElement>(HOST) ?? el) : el;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const allowed = () => !onlyIfCut || el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
    const show = (now: boolean) => {
      clearTimeout(timer);
      if (!allowed()) return;
      if (now) setOpen(true);
      else timer = setTimeout(() => setOpen(true), TOOLTIP_DELAY);
    };
    const hide = () => {
      clearTimeout(timer);
      setOpen(false);
    };
    const enter = (e: PointerEvent) => e.pointerType === "mouse" && show(false);
    const focus = () => host.matches(":focus-visible") && show(true);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && hide();
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", hide);
    host.addEventListener("pointerdown", hide);
    host.addEventListener("focus", focus);
    host.addEventListener("blur", hide);
    window.addEventListener("keydown", esc);
    return () => {
      clearTimeout(timer);
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", hide);
      host.removeEventListener("pointerdown", hide);
      host.removeEventListener("focus", focus);
      host.removeEventListener("blur", hide);
      window.removeEventListener("keydown", esc);
    };
  }, [ref, onlyIfCut]);
  return [open, setOpen] as const;
}

function Bubble({ anchor, open, setOpen, text }: { anchor: RefObject<HTMLElement | null>; open: boolean; setOpen: (v: boolean) => void; text: string }) {
  // Sans TooltipTrigger, React Aria attend quand même un état dans son contexte : on le fournit.
  const state = useMemo<TooltipTriggerState>(
    () => ({ isOpen: open, open: () => setOpen(true), close: () => setOpen(false), shouldSkipAnimation: false }) as TooltipTriggerState,
    [open, setOpen],
  );
  return (
    <TooltipTriggerStateContext.Provider value={state}>
      <RACTooltip triggerRef={anchor} placement="bottom" offset={6} containerPadding={8} className={TOOLTIP_CLASS}>
        {text}
      </RACTooltip>
    </TooltipTriggerStateContext.Provider>
  );
}

export function OverflowTooltip({ text, textClass, children }: { text: string; textClass?: string; children?: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useHoverTooltip(ref, true);
  return (
    <>
      <span ref={ref} className={textClass ?? "min-w-0 truncate"}>
        {children ?? text}
      </span>
      <Bubble anchor={ref} open={open} setOpen={setOpen} text={text} />
    </>
  );
}

export function HintTooltip({ label, frameClass, children }: { label: string; frameClass?: string; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useHoverTooltip(ref, false);
  return (
    <>
      <span ref={ref} role="img" aria-label={label} className={frameClass}>
        {children}
      </span>
      <Bubble anchor={ref} open={open} setOpen={setOpen} text={label} />
    </>
  );
}
