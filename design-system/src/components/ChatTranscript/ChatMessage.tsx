/*
 * Message d'une conversation. Spec : ChatMessage.spec.md. Décision : D-375.
 * Mesures reprises de l'app de référence : bulle de l'utilisateur à droite (85 % au plus), réponse sans bulle,
 * actions 4 px sous la bulle (utilisateur) ou dans la marge basse de la réponse (assistant), au survol et au focus.
 * La modification en place (« Modifier ») vient de la seconde app de référence.
 */
import { createContext, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Button } from "../Button/Button";
import { cx } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";

export type ChatMessageRole = "user" | "assistant";

export interface ChatMessageProps {
  /** `user` : bulle à droite ; `assistant` : texte sur toute la largeur, sans bulle. */
  role: ChatMessageRole;
  /** Contenu : texte de l'utilisateur, ou `Markdown` de Socle pour une réponse. */
  children: ReactNode;
  /** Pièces jointes, au-dessus de la bulle (vignettes, fichiers). */
  attachments?: ReactNode;
  /** Actions du message : un `MessageActions`. */
  actions?: ReactNode;
  /** Heure, état d'envoi (« Envoyé ») : en `--fg-3`, au bout de la rangée d'actions. */
  meta?: ReactNode;
  /** Auteur lu par le lecteur d'écran. Défaut : « Vous » ou « Assistant » (i18n). */
  author?: string;
}

/** Modification en cours : texte de départ et envoi (fournis par `MessageActions`). */
export interface MessageEdit {
  text: string;
  width: number;
  submit: (text: string) => void | Promise<void>;
  /** Appelé à la fin de la modification (annulée ou envoyée) : rend le focus au bouton « Modifier ». */
  done: () => void;
}

export interface MessageContextValue {
  role: ChatMessageRole;
  /** Message entier : la citation y cherche le passage sélectionné. */
  entry: RefObject<HTMLElement | null>;
  /** Corps affiché : sa largeur sert au champ de modification. */
  body: RefObject<HTMLDivElement | null>;
  startEdit: (edit: MessageEdit) => void;
}

export const MessageContext = createContext<MessageContextValue | null>(null);

/** Rangée d'actions : cachée au repos, visible au survol, au focus et sur écran tactile (D-375). */
const actionRow = cx(
  "absolute z-[1] items-center opacity-0 pointer-events-none transition-opacity duration-150 ease-out",
  "group-hover/msg:pointer-events-auto group-hover/msg:opacity-100 group-focus-within/msg:pointer-events-auto group-focus-within/msg:opacity-100",
  "pointer-coarse:pointer-events-auto pointer-coarse:opacity-100",
);

export function ChatMessage({ role, children, attachments, actions, meta, author }: ChatMessageProps) {
  const m = useMessages();
  const entry = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [edit, setEdit] = useState<MessageEdit | null>(null);
  const user = role === "user";
  const context: MessageContextValue = { role, entry, body, startEdit: setEdit };
  const close = () => {
    const current = edit;
    setEdit(null);
    current?.done();
  };
  const row =
    actions || meta ? (
      <div
        data-message-actions=""
        className={cx(
          actionRow,
          // Pendant la modification, la rangée est cachée mais reste montée : le focus revient sur « Modifier ».
          edit ? "hidden" : "flex",
          user
            ? // 4 px sous la bulle, à droite ; le pont garde le survol entre la bulle et les actions.
              "top-[calc(100%+4px)] right-1.5 before:absolute before:inset-x-0 before:bottom-full before:h-1 before:content-['']"
            : // Dans la marge basse de la réponse, à gauche : près du texte.
              "top-[calc(100%-24px)] left-1.5",
        )}
      >
        {actions}
        {meta && <span className="ms-1.5 inline-flex items-center gap-1 text-sm whitespace-nowrap text-fg-3">{meta}</span>}
      </div>
    ) : null;

  return (
    <MessageContext.Provider value={context}>
      <article
        ref={entry}
        aria-label={author ?? (user ? m.messageYou : m.messageAssistant)}
        data-role={role}
        className={cx(
          "group/msg relative font-sans [overflow-wrap:anywhere]",
          user ? "ms-auto mt-4 mb-7 w-fit max-w-[85%]" : "pt-3 pb-7 text-md leading-[1.6] text-fg",
        )}
      >
        {user ? (
          <div className="flex flex-col items-end gap-2">
            {attachments && <div className="flex flex-wrap justify-end gap-2">{attachments}</div>}
            {edit ? (
              <MessageEditor edit={edit} onClose={close} />
            ) : (
              <div ref={body} data-message-body="" className="w-fit max-w-full rounded-md bg-surface-side px-3 py-2 text-md leading-[1.6] whitespace-pre-wrap text-fg">
                {children}
              </div>
            )}
          </div>
        ) : (
          <>
            {attachments && <div className="mb-2 flex flex-wrap gap-2">{attachments}</div>}
            {edit ? (
              <MessageEditor edit={edit} onClose={close} />
            ) : (
              <div ref={body} data-message-body="">
                {children}
              </div>
            )}
          </>
        )}
        {row}
      </article>
    </MessageContext.Provider>
  );
}

/** Champ de modification en place : Entrée envoie, Maj+Entrée va à la ligne, Échap annule. */
function MessageEditor({ edit, onClose }: { edit: MessageEdit; onClose: () => void }) {
  const m = useMessages();
  const [text, setText] = useState(edit.text);
  const [busy, setBusy] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);

  // Focus au bout du texte ; hauteur ajustée au texte.
  useLayoutEffect(() => {
    const el = field.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);
  useLayoutEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [text]);

  const send = async () => {
    if (busy || !text.trim()) return;
    setBusy(true);
    try {
      await edit.submit(text);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex max-w-full flex-col items-end gap-2" style={{ width: Math.max(240, edit.width) }}>
      <textarea
        ref={field}
        aria-label={m.messageEdit}
        value={text}
        rows={1}
        readOnly={busy}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Escape" && !busy) {
            e.preventDefault();
            onClose();
          } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void send();
          }
        }}
        className={cx(
          "socle-box block max-h-[50vh] w-full resize-none overflow-auto rounded-md border border-line-strong bg-field px-3 py-2 font-sans text-md leading-[1.6] text-fg",
          "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus focus-visible:outline-offset-1",
        )}
      />
      <div className="flex gap-2">
        <Button size="sm" onPress={onClose} isDisabled={busy}>
          {m.messageEditCancel}
        </Button>
        <Button size="sm" variant="primary" onPress={() => void send()} isPending={busy} isDisabled={!text.trim()}>
          {m.messageEditSend}
        </Button>
      </div>
    </div>
  );
}
