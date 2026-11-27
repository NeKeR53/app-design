/*
 * Relevé d'une conversation avec un agent. Spec : ChatTranscript.spec.md. Décision : D-375.
 * Comportement repris du relevé des apps de référence : colonne de 760 px, collé en bas à moins de 100 px,
 * recollé à chaque envoi ; « Nouveaux messages » et l'annonce de fin de réponse sont nouveaux (Chat-v1, Q10 A).
 */
import { Children, useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Button as RACButton } from "react-aria-components/Button";
import { Focusable } from "react-aria-components/Focusable";
import { Button } from "../Button/Button";
import { Tooltip } from "../Tooltip/Tooltip";
import { ArrowDown } from "../../icons";
import { buttonReset, cx, focusRing, nativeInsetFocusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";

export interface ChatTranscriptProps {
  /** Messages et travail de l'agent : `ChatMessage`, `ActivityGroup`, `WorkStatus`, `WorkSummary`. */
  children?: ReactNode;
  /** Nom de la zone défilante, lu par le lecteur d'écran. Défaut : « Conversation » (i18n). */
  label?: string;
  /** Change à chaque envoi de l'utilisateur : le relevé revient en bas et s'y recolle. */
  followKey?: string | number;
  /**
   * Identifiant de la conversation affichée. La position de lecture lui est attachée : en quittant puis en rouvrant
   * la conversation (autre page, autre conversation), on la retrouve telle quelle ; en bas, le suivi continue et les
   * messages arrivés entre-temps sont déjà à l'écran (D-397).
   */
  scrollKey?: string;
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
  /** Ligne de contexte en tête du relevé, au-dessus du premier message : « Depuis Notes · 24/11/2026 09:03 » (D-382). */
  context?: string;
  /** Détail de la ligne de contexte, montré en info-bulle au survol et au focus (le modèle utilisé). */
  contextDetail?: string;
}

/** Position de lecture de chaque conversation (`scrollKey`), gardée le temps de la session (D-397). */
const positions = new Map<string, { pinned: boolean; top: number }>();

/** Délai pendant lequel un défilement suit un geste de l'utilisateur (molette, doigt, clavier, barre de défilement). */
const USER_INPUT_MS = 400;

/** Distance au bas sous laquelle le relevé suit la réponse, au moins (Q10 A). */
export const STICK_DISTANCE = 100;

/**
 * Zone de reprise du suivi : le tiers de la hauteur visible, 100 px au moins (D-396). Dans ce tiers, la fin de la
 * conversation reste à l'écran ; au-delà, l'utilisateur lit autre chose.
 */
export function stickDistance(visibleHeight: number): number {
  return Math.max(STICK_DISTANCE, visibleHeight / 3);
}

export function ChatTranscript({ children, label, followKey, scrollKey, announce, empty, hasEarlier = false, onShowEarlier, context, contextDetail }: ChatTranscriptProps) {
  const m = useMessages();
  const scroller = useRef<HTMLElement>(null);
  const column = useRef<HTMLDivElement>(null);
  /** L'utilisateur est en bas : le relevé suit le contenu. */
  const pinned = useRef(true);
  /**
   * Dernière position connue de la zone. Seul un défilement vers le haut décroche le suivi : un événement de
   * défilement lu après une croissance du contenu (le nôtre, différé d'une image) ne veut pas dire que l'utilisateur
   * est remonté (D-389).
   */
  const lastTop = useRef(0);
  /** Distance au bas à garder pendant l'ajout des messages plus anciens. */
  const keepFromBottom = useRef<number | null>(null);
  const [unseen, setUnseen] = useState(false);
  const isEmpty = Children.toArray(children).length === 0;
  /**
   * Instant du dernier geste de l'utilisateur sur la zone, et bouton de souris enfoncé (barre de défilement). Seul un
   * défilement qui suit un geste peut décrocher le suivi : ceux que le navigateur fait seul (contenu qui se charge,
   * panneau qui s'ouvre, largeur qui change) ne le décrochent jamais (D-397).
   */
  const lastInput = useRef(0);
  const pointerDown = useRef(false);
  const byUser = () => pointerDown.current || performance.now() - lastInput.current < USER_INPUT_MS;

  const remember = useCallback(() => {
    const el = scroller.current;
    if (scrollKey && el) positions.set(scrollKey, { pinned: pinned.current, top: el.scrollTop });
  }, [scrollKey]);

  const toBottom = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    lastTop.current = el.scrollTop;
  }, []);

  // Ouverture d'une conversation : la position gardée pour elle, sinon le bas (D-397).
  const opened = useRef<string | undefined>(undefined);
  useLayoutEffect(() => {
    const el = scroller.current;
    const saved = scrollKey ? positions.get(scrollKey) : undefined;
    opened.current = scrollKey;
    if (el && saved && !saved.pinned) {
      pinned.current = false;
      el.scrollTop = saved.top;
      lastTop.current = el.scrollTop;
    } else {
      pinned.current = true;
      toBottom();
    }
    setUnseen(false);
  }, [scrollKey, toBottom]);

  // Envoi de l'utilisateur : retour en bas, même s'il avait remonté. Pas à l'ouverture : la position gardée prime.
  const firstFollow = useRef(true);
  useLayoutEffect(() => {
    if (firstFollow.current) {
      firstFollow.current = false;
      return;
    }
    pinned.current = true;
    setUnseen(false);
    toBottom();
    remember();
  }, [followKey, toBottom, remember]);

  // En quittant la conversation (autre page, autre conversation), sa position est gardée.
  useLayoutEffect(() => () => remember(), [remember]);

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
        lastTop.current = el.scrollTop;
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
    const movedUp = el.scrollTop < lastTop.current - 1;
    lastTop.current = el.scrollTop;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < stickDistance(el.clientHeight)) {
      // Revenu en bas (ou resté en bas) : le suivi reprend.
      pinned.current = true;
      setUnseen(false);
    } else if (movedUp && byUser()) {
      // Remonté par l'utilisateur : le relevé reste sur ce qu'il lit. Un défilement fait par le navigateur seul
      // (contenu qui se charge ou se replie, panneau qui s'ouvre) ne décroche pas le suivi (D-397).
      pinned.current = false;
    } else if (pinned.current) {
      // Le navigateur a déplacé la vue alors qu'on suivait : on revient en bas.
      toBottom();
    }
    remember();
  };
  const markInput = () => {
    lastInput.current = performance.now();
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
        onWheel={markInput}
        onTouchMove={markInput}
        onKeyDown={markInput}
        onPointerDown={() => {
          pointerDown.current = true;
          markInput();
        }}
        onPointerUp={() => {
          pointerDown.current = false;
          markInput();
        }}
        onPointerCancel={() => {
          pointerDown.current = false;
        }}
        data-transcript=""
        className={cx(
          // relative : la zone qui défile est le bloc de référence des éléments en position absolue du relevé (textes
          // pour lecteur d’écran, `sr-only`). Sans cela, ils se placent hors d’elle et allongent la page entière, qui
          // défile alors avec la saisie (D-387).
          "socle-focus-scroll relative min-h-0 flex-1 overflow-auto overscroll-contain px-4 pt-3 pb-4 [overflow-anchor:none] [scrollbar-gutter:stable_both-edges]",
          nativeInsetFocusRing,
        )}
      >
        <div ref={column} className={cx("mx-auto max-w-[760px] [overflow-wrap:anywhere]", isEmpty && "flex min-h-full flex-col justify-center")}>
          {context && !isEmpty && <ContextLine text={context} detail={contextDetail} />}
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

/** Ligne de contexte centrée ; avec un détail, focusable pour montrer l'info-bulle au clavier (D-382, comme BadgeDot). */
function ContextLine({ text, detail }: { text: string; detail?: string | undefined }) {
  return (
    <p data-transcript-context="" className="m-0 mb-1 text-center text-sm text-fg-2">
      {detail ? (
        <Tooltip content={detail} placement="bottom">
          <Focusable>
            <span
              tabIndex={0}
              className="cursor-default rounded-sm px-1 outline-none focus-visible:outline-2 focus-visible:outline-solid outline-focus focus-visible:outline-offset-1"
            >
              {text}
            </span>
          </Focusable>
        </Tooltip>
      ) : (
        text
      )}
    </p>
  );
}
