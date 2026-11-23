/*
 * Actions d'un message. Spec : MessageActions.spec.md. Décision : D-375.
 * Reprises de l'app de référence : Copier, Citer (passage sélectionné, sinon tout le message), Relancer,
 * Repartir d'ici ; « Modifier » en place vient de la seconde app de référence. Boutons de 24 px, icônes de 12 px.
 */
import { useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Button } from "react-aria-components/Button";
import { Toolbar } from "react-aria-components/Toolbar";
import { Tooltip as RACTooltip, TooltipTrigger } from "react-aria-components/Tooltip";
import { Check, Copy, Pencil, RotateCcw, Shuffle, TextQuote } from "../../icons";
import { copyText } from "../../lib/clipboard";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { TOOLTIP_CLASS, TOOLTIP_DELAY } from "../Tooltip/Tooltip";
import { MessageContext } from "./ChatMessage";

export interface MessageActionsProps {
  /** Texte du message : copié, cité en entier sans sélection, repris par « Modifier ». */
  content: string;
  /** « Citer dans la réponse » : reçoit le passage sélectionné dans le message, sinon tout le message. */
  onQuote?: (text: string) => void;
  /** « Relancer le message ». */
  onRetry?: () => void;
  /** « Repartir d'ici » : nouvelle conversation à partir de ce message. */
  onFork?: () => void;
  /**
   * « Modifier le message », en place : un champ remplace la bulle. Reçoit le nouveau texte ;
   * une promesse rejetée garde le champ ouvert.
   */
  onEdit?: (text: string) => void | Promise<void>;
  /** Relancer, Repartir d'ici et Modifier inactifs (l'agent répond). Copier et Citer restent actifs. */
  isDisabled?: boolean;
}

/** Durée du retour « Copié » (comme D-304). */
export const COPY_FEEDBACK_MS = 2000;

/** Bouton d'action : 24 px, icône de 12 px, info-bulle au-dessus, ouverte de force pendant un retour. */
function ActionButton({
  icon,
  label,
  onPress,
  isDisabled,
  forceTooltip = false,
  buttonRef,
  onPressStart,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  isDisabled?: boolean;
  forceTooltip?: boolean;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  onPressStart?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <TooltipTrigger delay={TOOLTIP_DELAY} closeDelay={0} isOpen={open || forceTooltip} onOpenChange={setOpen}>
      <Button
        ref={buttonRef}
        aria-label={label}
        // L'info-bulle répète le nom : pas de description en double (comme IconButton).
        aria-describedby=""
        onPress={onPress}
        isDisabled={isDisabled ?? false}
        {...(onPressStart ? { onPressStart } : {})}
        className={cx(
          buttonReset,
          "inline-grid size-6 shrink-0 cursor-default place-items-center rounded-sm text-fg-3",
          "transition-colors duration-[var(--dur-fast)] ease-standard data-hovered:bg-hover data-hovered:text-fg data-pressed:bg-selected",
          "data-disabled:opacity-40 data-disabled:data-hovered:bg-transparent",
          focusRing,
        )}
      >
        {icon}
      </Button>
      <RACTooltip placement="top" offset={6} containerPadding={8} className={TOOLTIP_CLASS}>
        {label}
      </RACTooltip>
    </TooltipTrigger>
  );
}

export function MessageActions({ content, onQuote, onRetry, onFork, onEdit, isDisabled = false }: MessageActionsProps) {
  const m = useMessages();
  const message = useContext(MessageContext);
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const editButton = useRef<HTMLButtonElement>(null);
  // Le passage sélectionné est relevé avant que l'appui ne déplace le focus.
  const passage = useRef("");
  useEffect(() => () => clearTimeout(timer.current), []);

  const readSelection = () => {
    const selection = window.getSelection();
    const node = selection?.anchorNode;
    const inside = node && message?.entry.current?.contains(node);
    passage.current = inside ? (selection?.toString().trim() ?? "") : "";
  };

  const copyLabel = copy === "copied" ? m.messageCopied : copy === "failed" ? m.copyFailed : m.messageCopy;
  const size = 12;

  return (
    <Toolbar aria-label={m.messageActions} className="flex items-center gap-0">
      <ActionButton
        icon={copy === "copied" ? <Check size={size} /> : <Copy size={size} />}
        label={copyLabel}
        forceTooltip={copy !== "idle"}
        onPress={() => {
          clearTimeout(timer.current);
          copyText(content).then(
            () => setCopy("copied"),
            () => setCopy("failed"),
          );
          timer.current = setTimeout(() => setCopy("idle"), COPY_FEEDBACK_MS);
        }}
      />
      {onQuote && (
        <ActionButton
          icon={<TextQuote size={size} />}
          label={m.messageQuote}
          onPressStart={readSelection}
          onPress={() => {
            if (!passage.current) readSelection();
            onQuote(passage.current || content);
            passage.current = "";
          }}
        />
      )}
      {onRetry && <ActionButton icon={<RotateCcw size={size} />} label={m.messageRetry} isDisabled={isDisabled} onPress={onRetry} />}
      {onFork && <ActionButton icon={<Shuffle size={size} />} label={m.messageFork} isDisabled={isDisabled} onPress={onFork} />}
      {onEdit && message && (
        <ActionButton
          icon={<Pencil size={size} />}
          label={m.messageEdit}
          isDisabled={isDisabled}
          buttonRef={editButton}
          onPress={() =>
            message.startEdit({
              text: content,
              width: Math.ceil(message.body.current?.getBoundingClientRect().width ?? 0),
              submit: onEdit,
              done: () => requestAnimationFrame(() => editButton.current?.focus()),
            })
          }
        />
      )}
      <span role="status" className="sr-only">
        {copy === "copied" ? m.messageCopied : copy === "failed" ? m.copyFailed : ""}
      </span>
    </Toolbar>
  );
}
