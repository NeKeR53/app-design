/*
 * Relevé d'une conversation avec un agent. Spec : ChatTranscript.spec.md. Décision : D-375.
 * Comportement repris du relevé des apps de référence : colonne de 760 px, collé en bas à moins de 100 px,
 * recollé à chaque envoi ; « Nouveaux messages » et l'annonce de fin de réponse sont nouveaux (Chat-v1, Q10 A).
 */
import { Children, useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Button as RACButton } from "react-aria-components/Button";
import { Button } from "../Button/Button";
import { ArrowDown } from "../../icons";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";

export interface ChatTranscriptProps {
  /** Messages et travail de l'agent : `ChatMessage`, `ActivityGroup`, `WorkStatus`, `WorkSummary`. */
  children?: ReactNode;
  /** Nom de la zone défilante, lu par le lecteur d'écran. Défaut : « Conversation » (i18n). */
  label?: string;
  /** Change à chaque envoi de l'utilisateur : le relevé revient en bas et s'y recolle. */
  followKey?: string | number;
  /**
   * Texte lu poliment, une fois, quand il change : la fin d'une réponse (« Réponse terminée »).
   * Laisser vide pendant que la réponse s'écrit : rien n'est lu mot à mot.
   */
  announce?: string;
  /** Contenu d'une conversation vide, en général un `EmptyState`. */
  empty?: ReactNode;
  /** Des messages plus anciens existent : un bouton « Afficher les messages précédents » s'affiche en haut. */
  hasEarlier?: boolean;
  /** Charge les messages plus anciens ; la position de lecture est gardée. */
  onShowEarlier?: () => void;
}

/** Distance au bas sous laquelle le relevé suit la réponse (Q10 A). */
export const STICK_DISTANCE = 100;

export function ChatTranscript({ children, label, followKey, announce, empty, hasEarlier = false, onShowEarlier }: ChatTranscriptProps) {
  const m = useMessages();
  const scroller = useRef<HTMLElement>(null);
  const column = useRef<HTMLDivElement>(null);
  /** L'utilisateur est en bas : le relevé suit le contenu. */
  const pinned = useRef(true);
  /** Distance au bas à garder pendant l'ajout des messages plus anciens. */
  const keepFromBottom = useRef<number | null>(null);
  const [unseen, setUnseen] = useState(false);
  const isEmpty = Children.toArray(children).length === 0;

  const toBottom = useCallback(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // Ouverture et envoi de l'utilisateur : retour en bas, même s'il avait remonté.
  useLayoutEffect(() => {
    pinned.current = true;
    setUnseen(false);
    toBottom();
  }, [followKey, toBottom]);

  // Tout changement de hauteur (fragment de réponse, outil, image chargée) : suivre si l'on est en bas,
  // sinon signaler le nouveau contenu.
  useLayoutEffect(() => {
    const el = scroller.current;
    const col = column.current;
    if (!el || !col) return;
    let last = col.offsetHeight;
    const observer = new ResizeObserver(() => {
      const height = col.offsetHeight;
      const grew = height > last;
      last = height;
      if (keepFromBottom.current !== null) {
        if (!grew) return;
        el.scrollTop = el.scrollHeight - keepFromBottom.current;
        keepFromBottom.current = null;
        return;
      }
      if (pinned.current) toBottom();
      else if (grew) setUnseen(true);
    });
    observer.observe(col);
    observer.observe(el);
    return () => observer.disconnect();
  }, [toBottom]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_DISTANCE;
    if (pinned.current) setUnseen(false);
  };

  const showNew = () => {
    pinned.current = true;
    setUnseen(false);
    toBottom();
    // Le bouton disparaît : le focus reste dans la conversation.
    scroller.current?.focus({ preventScroll: true });
  };

  const showEarlier = () => {
    const el = scroller.current;
    if (el) keepFromBottom.current = el.scrollHeight - el.scrollTop;
    onShowEarlier?.();
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col font-sans text-fg">
      <section
        ref={scroller}
        aria-label={label ?? m.transcriptLabel}
        // Zone défilante : atteinte au clavier pour défiler avec les flèches.
        tabIndex={0}
        onScroll={onScroll}
        data-transcript=""
        className={cx(
          "min-h-0 flex-1 overflow-auto overscroll-contain px-4 pt-3 pb-4 [overflow-anchor:none] [scrollbar-gutter:stable_both-edges]",
          "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus focus-visible:-outline-offset-2",
        )}
      >
        <div ref={column} className={cx("mx-auto max-w-[760px] [overflow-wrap:anywhere]", isEmpty && "flex min-h-full flex-col justify-center")}>
          {hasEarlier && onShowEarlier && (
            <div className="flex justify-center pb-2">
              <Button size="sm" variant="subtle" onPress={showEarlier}>
                {m.transcriptShowEarlier}
              </Button>
            </div>
          )}
          {isEmpty ? empty : children}
        </div>
      </section>
      {unseen && (
        <RACButton
          onPress={showNew}
          className={cx(
            buttonReset,
            "absolute bottom-3 left-1/2 inline-flex h-7 -translate-x-1/2 cursor-default items-center gap-1.5 rounded-full border border-line bg-surface-raised px-3 text-sm font-medium text-fg shadow-md",
            "data-hovered:bg-hover",
            focusRing,
          )}
        >
          {m.transcriptNewMessages}
          <ArrowDown size={14} />
        </RACButton>
      )}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announce}
      </div>
    </div>
  );
}
