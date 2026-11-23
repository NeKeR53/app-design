/**
 * Texte coupé avec une ellipse, texte complet dans une info-bulle Socle (Tooltip.spec.md, « Contenu »).
 * La bulle s'affiche seulement si le texte est vraiment coupé (scrollWidth > clientWidth) :
 * - tout de suite quand l'élément qui le contient est mis en avant au clavier (`highlighted`) ;
 * - après 500 ms de survol à la souris (D-031), survol donné par `hovered` ou suivi sur le texte.
 * Sert aux éléments dont le focus est géré à part (option de liste, étiquette de recherche).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Tooltip as RACTooltip, TooltipTriggerStateContext, type TooltipTriggerState } from "react-aria-components/Tooltip";
import { TOOLTIP_CLASS, TOOLTIP_DELAY } from "../components/Tooltip/Tooltip";

export interface TruncatedTextProps {
  text: string;
  /** Classes du texte ; doivent couper la ligne (par défaut `min-w-0 truncate`). */
  textClass?: string;
  /** Mis en avant au clavier : la bulle s'ouvre tout de suite. */
  highlighted?: boolean;
  /** Survol de l'élément parent ; sans cette valeur, le survol du texte compte. */
  hovered?: boolean;
}

export function TruncatedText({ text, textClass = "min-w-0 truncate", highlighted = false, hovered }: TruncatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [ownHover, setOwnHover] = useState(false);
  const [open, setOpen] = useState(false);
  const isHovered = hovered ?? ownHover;

  useEffect(() => {
    const el = ref.current;
    const cut = () => !!el && el.scrollWidth > el.clientWidth + 1;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (highlighted) timer = setTimeout(() => setOpen(cut()), 0);
    else if (isHovered) timer = setTimeout(() => setOpen(cut()), TOOLTIP_DELAY);
    else timer = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timer);
  }, [highlighted, isHovered, text]);

  // Sans TooltipTrigger, React Aria attend un état dans son contexte : on le fournit.
  const state = useMemo<TooltipTriggerState>(
    () => ({ isOpen: open, open: () => setOpen(true), close: () => setOpen(false), shouldSkipAnimation: false }) as TooltipTriggerState,
    [open],
  );

  return (
    <>
      <span
        ref={ref}
        className={textClass}
        onPointerEnter={hovered === undefined ? (e) => e.pointerType === "mouse" && setOwnHover(true) : undefined}
        onPointerLeave={hovered === undefined ? () => setOwnHover(false) : undefined}
      >
        {text}
      </span>
      <TooltipTriggerStateContext.Provider value={state}>
        <RACTooltip triggerRef={ref} placement="bottom" offset={6} containerPadding={8} className={TOOLTIP_CLASS}>
          {text}
        </RACTooltip>
      </TooltipTriggerStateContext.Provider>
    </>
  );
}
