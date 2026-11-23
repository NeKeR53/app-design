/*
 * Zone de saisie d'un chat avec un agent (D-371). Spec : ChatComposer.spec.md.
 * Validation : docs/validation/components/Chat-v1.html (Q1 B, Q5 A, Q6 A, Q9 A).
 * Cadre de 6 px de marge : la file, les pièces jointes, puis la ligne « + », texte à pastilles, emplacement de l'app,
 * « Arrêter » pendant une réponse, envoi. Entrée envoie, Maj+Entrée va à la ligne, ⌘/Ctrl+Entrée met en file
 * pendant une réponse, Échap arrête. Collage d'images et de longs textes, dépôt de fichiers.
 */
import { useImperativeHandle, useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent, type ReactNode, type Ref } from "react";
import { cx } from "../../lib/cx";
import { useMessages, useSocle } from "../../provider/SocleProvider";
import { ArrowUp, Paperclip, Plus, Square } from "../../icons";
import { DropdownMenu } from "../DropdownMenu/DropdownMenu";
import { IconButton } from "../IconButton/IconButton";
import { AttachmentList } from "../AttachmentChip/AttachmentChip";
import { MentionInput, type MentionInputHandle } from "../MentionInput/MentionInput";
import { trimMentionReferences, type MentionReference, type MentionTrigger } from "../MentionInput/mentions";

export type ChatSubmitMode = "now" | "queue";

/** Entrée du menu « + » ajoutée par l'app (« Capture de la page », « Dossier… »). */
export interface ChatAddMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onAction: () => void;
  isDisabled?: boolean;
}

export interface ChatComposerHandle {
  focus: () => void;
  /** Insère du texte au curseur (une citation, un déclencheur). */
  insertText: (text: string) => void;
}

export interface ChatComposerProps {
  /** Nom accessible du champ. Défaut : « Message ». */
  label?: string;
  /** Texte contrôlé, sans pastilles ; sans lui, la zone garde son texte et se vide après l'envoi. */
  value?: string;
  references?: MentionReference[];
  /** Texte de départ, sans `value`. */
  defaultValue?: string;
  onChange?: (value: string, references: MentionReference[]) => void;
  /** Envoi : texte rogné, `now` ou `queue` (⌘/Ctrl+Entrée pendant une réponse), pastilles. */
  onSubmit: (text: string, mode: ChatSubmitMode, references: MentionReference[]) => void;
  /** Texte d'attente au repos (« Que puis-je faire pour vous ? »). */
  placeholder?: string;
  /** Texte d'attente pendant une réponse. Défaut : « ⌘↩ pour mettre en file » (Ctrl+↩ hors macOS). */
  runningPlaceholder?: string;
  /** Déclencheurs de suggestions (`@`, `/`) ; chacun a son entrée dans le menu « + ». */
  triggers?: MentionTrigger[];
  /** L'agent répond : « Arrêter » paraît, l'envoi devient « Envoyer maintenant ». */
  isRunning?: boolean;
  /** Arrêter la réponse : bouton « Arrêter » et Échap. */
  onStop?: () => void;
  /** Dernier envoi en échec ou interrompu : la zone vide propose « Relancer ». */
  canResume?: boolean;
  onResume?: () => void;
  /** Pièces jointes en préparation : l'envoi attend (roue). */
  isPending?: boolean;
  isDisabled?: boolean;
  /** Des pièces jointes attendent : l'envoi est permis sans texte. */
  hasAttachments?: boolean;
  /** Fichiers choisis, déposés ou images collées. Sans lui, ni « Joindre des fichiers… » ni dépôt. */
  onAddFiles?: (files: File[]) => void;
  /** Types acceptés par le sélecteur de fichiers (attribut `accept`). Défaut : tous. */
  accept?: string;
  /** Collage d'au moins 2 000 caractères ou 20 lignes, à montrer en pièce « Texte collé n ». Sans lui, collage normal. */
  onPasteLongText?: (text: string) => void;
  /** Entrées du menu « + » après les fichiers et les déclencheurs. */
  addMenu?: ChatAddMenuItem[];
  /** `MessageQueue`, en tête du cadre. */
  queue?: ReactNode;
  /** Des `AttachmentChip`, au-dessus du texte. */
  attachments?: ReactNode;
  /** Emplacement avant « Arrêter » et l'envoi : dictée, par exemple. */
  trailing?: ReactNode;
  ref?: Ref<ChatComposerHandle>;
}

/** Comme les apps d'origine : un collage d'au moins 2 000 caractères ou 20 lignes devient une pièce « Texte collé n ». */
export function isLongPaste(text: string): boolean {
  return text.length >= 2000 || text.split(/\r\n|\r|\n/, 20).length >= 20;
}

/** Images du presse-papiers ; certains presse-papiers ne les exposent que par `items`. */
export function clipboardImages(data: Pick<DataTransfer, "items" | "files">): File[] {
  const images = [...data.items]
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
  return images.length ? images : [...data.files].filter((file) => file.type.startsWith("image/"));
}

export function ChatComposer({
  label,
  value,
  references,
  defaultValue = "",
  onChange,
  onSubmit,
  placeholder,
  runningPlaceholder,
  triggers = [],
  isRunning = false,
  onStop,
  canResume = false,
  onResume,
  isPending = false,
  isDisabled = false,
  hasAttachments = false,
  onAddFiles,
  accept,
  onPasteLongText,
  addMenu = [],
  queue,
  attachments,
  trailing,
  ref,
}: ChatComposerProps) {
  const m = useMessages();
  const { isMac } = useSocle();
  const mention = useRef<MentionInputHandle>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [own, setOwn] = useState<{ text: string; references: MentionReference[] }>({ text: defaultValue, references: [] });
  const [dragging, setDragging] = useState(false);
  const controlled = value !== undefined;
  const text = controlled ? value : own.text;
  const refs = controlled ? (references ?? []) : own.references;

  useImperativeHandle(ref, () => ({ focus: () => mention.current?.focus(), insertText: (t) => mention.current?.insertText(t) }), []);

  const change = (nextText: string, nextRefs: MentionReference[]) => {
    if (!controlled) setOwn({ text: nextText, references: nextRefs });
    onChange?.(nextText, nextRefs);
  };

  const filled = Boolean(text.trim() || refs.length || hasAttachments);
  const resumable = canResume && !isRunning && !filled;
  const sendLabel = resumable ? m.composerResume : isRunning ? m.composerSendNow : m.composerSend;

  const submit = (mode: ChatSubmitMode) => {
    if (isDisabled || isPending) return;
    if (!filled) {
      if (resumable) onResume?.();
      return;
    }
    onSubmit(text.trim(), isRunning ? mode : "now", trimMentionReferences(text, refs));
    if (!controlled) setOwn({ text: "", references: [] });
    mention.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit(event.metaKey || event.ctrlKey ? "queue" : "now");
      return;
    }
    if (event.key === "Escape" && isRunning && onStop) {
      event.preventDefault();
      onStop();
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const images = onAddFiles ? clipboardImages(event.clipboardData) : [];
    if (images.length) {
      event.preventDefault();
      onAddFiles?.(images);
      return;
    }
    const pasted = event.clipboardData.getData("text/plain");
    if (onPasteLongText && pasted.trim() && isLongPaste(pasted)) {
      event.preventDefault();
      onPasteLongText(pasted);
    }
  };

  const canDrop = Boolean(onAddFiles) && !isDisabled;
  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!canDrop || !event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDragging(true);
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!canDrop) return;
    event.preventDefault();
    setDragging(false);
    const files = [...event.dataTransfer.files];
    if (files.length) onAddFiles?.(files);
  };

  // Un déclencheur inséré depuis le menu : après la fermeture du menu, qui rend le focus au bouton « + ».
  const insertTrigger = (char: string) => requestAnimationFrame(() => mention.current?.insertText(char));

  const hasMenu = Boolean(onAddFiles) || triggers.length > 0 || addMenu.length > 0;
  const shownPlaceholder = dragging ? m.composerDropHere : isRunning ? (runningPlaceholder ?? m.composerQueueHint(isMac ? "⌘↩" : "Ctrl+↩")) : placeholder;

  return (
    <div
      data-dragging={dragging || undefined}
      className={cx(
        "socle-box flex min-w-0 flex-col gap-1 rounded-md border bg-surface p-1.5 font-sans text-fg shadow-md transition-colors duration-[var(--dur-fast)] ease-standard",
        dragging ? "border-dashed border-accent" : "border-line-strong focus-within:border-[color-mix(in_oklch,var(--accent)_55%,var(--line-strong))]",
      )}
      onDragOver={onDragOver}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={onDrop}
    >
      {queue}
      {attachments ? <AttachmentList>{attachments}</AttachmentList> : null}
      <div className="flex min-w-0 items-end gap-1">
        {hasMenu && (
          <DropdownMenu label={m.composerAdd} placement="top start" trigger={<IconButton icon={<Plus />} label={m.composerAdd} tooltipPlacement="top" isDisabled={isDisabled} />}>
            {onAddFiles && <DropdownMenu.Item id="attach" label={m.composerAttachFiles} icon={<Paperclip />} onAction={() => fileInput.current?.click()} />}
            {onAddFiles && (triggers.length > 0 || addMenu.length > 0) && <DropdownMenu.Separator />}
            {triggers.map((t) => (
              <DropdownMenu.Item key={`trigger-${t.char}`} id={`trigger-${t.char}`} label={t.label} shortcut={t.char} onAction={() => insertTrigger(t.char)} />
            ))}
            {addMenu.map((item) => (
              <DropdownMenu.Item key={item.id} id={item.id} label={item.label} icon={item.icon} isDisabled={item.isDisabled ?? false} onAction={item.onAction} />
            ))}
          </DropdownMenu>
        )}
        <MentionInput
          ref={mention}
          variant="plain"
          label={label ?? m.composerMessage}
          value={text}
          references={refs}
          onChange={change}
          triggers={triggers}
          {...(shownPlaceholder ? { placeholder: shownPlaceholder } : {})}
          isDisabled={isDisabled}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
        />
        {trailing}
        {isRunning && onStop && <IconButton icon={<Square size={14} />} label={m.composerStop} shortcut="Escape" onPress={onStop} isDisabled={isDisabled} />}
        <IconButton
          icon={<ArrowUp />}
          label={sendLabel}
          shortcut="Enter"
          tooltipPlacement="top"
          isDisabled={isDisabled || (!filled && !resumable)}
          isPending={isPending}
          onPress={() => submit("now")}
        />
      </div>
      {onAddFiles && (
        <input
          ref={fileInput}
          type="file"
          multiple
          hidden
          tabIndex={-1}
          {...(accept ? { accept } : {})}
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            event.target.value = "";
            if (files.length) onAddFiles(files);
          }}
        />
      )}
    </div>
  );
}
