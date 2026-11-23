/*
 * Pièce jointe d'un message (D-374). Spec : AttachmentChip.spec.md.
 * Vignette d'image de 56 px, étiquette de fichier de 28 px, ou texte collé qui s'ouvre en lecture seule.
 * Chacune a son × quand l'app permet de la retirer, et un état « en préparation » ou « en erreur ».
 */
import { Children, useState, type ReactNode } from "react";
import { Button } from "react-aria-components/Button";
import { useLocale } from "react-aria-components/I18nProvider";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { CircleAlert, FileImage, FileText, Paperclip, X } from "../../icons";
import { Modal } from "../Modal/Modal";
import { Spinner } from "../Spinner/Spinner";
import { TextArea } from "../TextArea/TextArea";
import { Tooltip } from "../Tooltip/Tooltip";
import { HintTooltip, OverflowTooltip } from "../Tooltip/OverflowTooltip";

export type AttachmentKind = "image" | "file" | "text";
export type AttachmentStatus = "ready" | "pending" | "error";

export interface AttachmentChipProps {
  /** `image` : vignette ; `file` : étiquette ; `text` : texte collé, ouvert en lecture seule. */
  kind: AttachmentKind;
  /** Nom du fichier, ou « Texte collé 1 » pour un texte. */
  name: string;
  /** Adresse de la vignette (`kind: "image"`) : `blob:` ou `data:`. */
  src?: string;
  /** Contenu du texte collé (`kind: "text"`). */
  text?: string;
  /** `pending` : en préparation (roue) ; `error` : non joint, bord rouge. Défaut : `ready`. */
  status?: AttachmentStatus;
  /** Ce qui ne va pas, avec `status: "error"`. Défaut : « <nom> n'a pas pu être joint. ». */
  error?: string;
  /** Bouton × « Retirer <nom> ». Sans lui, pas de bouton. */
  onRemove?: () => void;
}

/** Nombre de caractères gardés à la fin du nom, extension comprise, pour couper au milieu. */
const TAIL = 8;

/** Nom coupé au milieu : le début se tronque, la fin (extension) reste ; nom complet en info-bulle s'il est coupé. */
function MiddleName({ name }: { name: string }) {
  const split = name.length > TAIL * 2;
  const head = split ? name.slice(0, -TAIL) : name;
  const tail = split ? name.slice(-TAIL) : "";
  return (
    <span className="flex max-w-50 min-w-0" data-attachment-name="">
      <OverflowTooltip text={name} textClass="min-w-0 truncate whitespace-pre">
        {head}
      </OverflowTooltip>
      {tail && <span className="shrink-0 whitespace-pre">{tail}</span>}
    </span>
  );
}

/** Bouton × de 20 px ; rond et bordé sur une vignette. */
function RemoveButton({ name, onRemove, round }: { name: string; onRemove: () => void; round?: boolean }) {
  const m = useMessages();
  return (
    <Tooltip content={m.removeItem(name)} placement="top">
      <Button
        aria-label={m.removeItem(name)}
        aria-describedby=""
        onPress={onRemove}
        className={cx(
          buttonReset,
          "inline-grid size-5 shrink-0 cursor-default place-items-center text-fg-2 transition-colors duration-[var(--dur-fast)] ease-standard data-hovered:bg-hover data-hovered:text-fg data-pressed:bg-selected",
          round ? "rounded-full border border-line bg-surface" : "rounded-md",
          focusRing,
        )}
      >
        <X size={12} />
      </Button>
    </Tooltip>
  );
}

export function AttachmentChip({ kind, name, src, text = "", status = "ready", error, onRemove }: AttachmentChipProps) {
  const m = useMessages();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const pending = status === "pending";
  const failed = status === "error";
  const problem = error ?? m.attachmentError(name);

  if (kind === "image") {
    return (
      <div className="socle-box group/chip relative" data-attachment="image" data-status={status}>
        <div
          className={cx("relative grid size-14 place-items-center overflow-hidden rounded-md border bg-surface-side text-fg-3", failed ? "border-danger" : "border-line")}
        >
          {src ? <img src={src} alt={name} className="block size-full object-cover" /> : <FileImage aria-label={name} role="img" />}
          {pending && (
            <span className="absolute inset-0 grid place-items-center bg-surface/60">
              <Spinner label={m.attachmentPending(name)} />
            </span>
          )}
          {failed && (
            <span className="absolute inset-0 grid place-items-center bg-surface/60 text-danger">
              <HintTooltip label={problem} frameClass="inline-grid place-items-center">
                <CircleAlert />
              </HintTooltip>
            </span>
          )}
        </div>
        {onRemove && (
          <span className="absolute -top-1.5 -right-1.5 opacity-0 transition-opacity duration-[var(--dur-fast)] group-focus-within/chip:opacity-100 group-hover/chip:opacity-100 [@media(hover:none)]:opacity-100">
            <RemoveButton name={name} onRemove={onRemove} round />
          </span>
        )}
      </div>
    );
  }

  const icon = pending ? (
    <Spinner label={m.attachmentPending(name)} />
  ) : failed ? (
    <HintTooltip label={problem} frameClass="inline-grid shrink-0 place-items-center text-danger">
      <CircleAlert size={14} />
    </HintTooltip>
  ) : kind === "text" ? (
    <FileText size={14} className="shrink-0 text-fg-2" />
  ) : (
    <Paperclip size={14} className="shrink-0 text-fg-2" />
  );
  const summary = m.attachmentTextSummary(name, text.length.toLocaleString(locale));
  return (
    <div
      data-attachment={kind}
      data-status={status}
      className={cx(
        "socle-box inline-flex h-7 max-w-full min-w-0 items-center gap-1.5 rounded-md border bg-surface-side pl-2 font-sans text-sm text-fg",
        failed ? "border-danger" : "border-line",
        onRemove ? "pr-0.5" : "pr-2",
      )}
    >
      {icon}
      {kind === "text" ? (
        <>
          <Button
            aria-label={m.attachmentView(summary)}
            onPress={() => setOpen(true)}
            className={cx(buttonReset, "max-w-60 min-w-0 cursor-default truncate rounded-sm data-hovered:underline", focusRing)}
          >
            {summary}
          </Button>
          {open && (
            <Modal isOpen onOpenChange={setOpen} title={summary} size="lg">
              <TextArea label={m.attachmentContent(name)} hideLabel isReadOnly value={text} minRows={8} maxRows={24} />
            </Modal>
          )}
        </>
      ) : (
        <MiddleName name={name} />
      )}
      {onRemove && <RemoveButton name={name} onRemove={onRemove} />}
    </div>
  );
}

export interface AttachmentListProps {
  /** Nom de la liste. Défaut : « Pièces jointes » (i18n). */
  label?: string;
  /** Des `AttachmentChip`. */
  children: ReactNode;
}

/** Pièces jointes en ligne, 8 px d'écart, alignées en bas : les vignettes et les étiquettes se côtoient. */
export function AttachmentList({ label, children }: AttachmentListProps) {
  const m = useMessages();
  const chips = Children.toArray(children);
  if (!chips.length) return null;
  return (
    <ul aria-label={label ?? m.attachmentList} className="m-0 flex list-none flex-wrap items-end gap-2 p-0 pb-1">
      {chips.map((chip, index) => (
        <li key={(chip as { key?: string | null }).key ?? index} className="min-w-0">
          {chip}
        </li>
      ))}
    </ul>
  );
}
