/*
 * Ajout de fichiers : zone de dépôt et bouton, vérification avant envoi. Spec : FileUpload.spec.md.
 * Validation : docs/validation/components/Nouveaux-P2-P3-v1.html (F1 à F3, options A).
 * Le composant n'envoie rien : l'app reçoit les fichiers acceptés (`onAdd`) et rend leur état (`files`).
 */
import { useId, useRef, useState } from "react";
import type { DropItem, FileDropItem } from "react-aria-components";
import { Button } from "react-aria-components/Button";
import { DropZone } from "react-aria-components/DropZone";
import { FileTrigger } from "react-aria-components/FileTrigger";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { fieldRoot } from "../Field/Field";
import { FileList, type FileItem } from "./FileList";
import { UploadIcon, acceptText, formatBytes, isAccepted, typeName } from "./files";

export interface FileUploadProps {
  /** Libellé au-dessus de la zone et nom du groupe. */
  label: string;
  /** Masque le libellé à l'écran ; il reste le nom accessible. */
  hideLabel?: boolean;
  /** Aide sous la zone. */
  description?: string;
  /** Sans lui, « (facultatif) » suit le libellé (D-022). */
  isRequired?: boolean;
  /** Erreur imposée par l'app (« Ajoutez le devis signé. »), à la place de l'aide (D-132). */
  error?: string;
  isDisabled?: boolean;
  /** Types acceptés : extensions (`.pdf`), types MIME (`application/pdf`) ou familles (`image/*`). Sans liste : tout type. */
  accept?: ReadonlyArray<string>;
  /** Types en clair dans la zone, si le texte construit ne convient pas (« PDF ou image »). */
  acceptLabel?: string;
  /** Taille maximale d'un fichier, en octets. */
  maxSize?: number;
  /** Plusieurs fichiers à la fois. Défaut : un seul. */
  multiple?: boolean;
  /** Reçoit les fichiers acceptés (type et taille vérifiés). Les fichiers refusés ne sont pas transmis. */
  onAdd: (files: File[]) => void;
  /** Fichiers ajoutés, avec leur état d'envoi : la liste sous la zone (`FileList`). */
  files?: ReadonlyArray<FileItem>;
  /** × d'un fichier de `files`. */
  onRemove?: (id: string) => void;
  /** « Réessayer » d'un fichier de `files` en erreur. */
  onRetry?: (id: string) => void;
}

/** Zone en pointillés, rayon 8 px ; marquée (trait plein `--focus`, fond `--hover`) quand un fichier glissé la survole. */
const ZONE = cx(
  "socle-box flex w-full flex-col items-center gap-1 rounded-md border-[1.5px] border-dashed border-line-strong px-4 py-3.5 text-center text-sm text-fg-2",
  "transition-colors duration-[var(--dur-fast)] ease-standard",
  "data-drop-target:border-solid data-drop-target:border-focus data-drop-target:bg-hover",
  "data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-focus data-focus-visible:outline-offset-1",
  "group-data-invalid/field:border-danger",
);

/** Bouton dans la phrase : texte `--fg` en gras, souligné au survol. */
const CHOOSE = cx(buttonReset, "inline cursor-pointer rounded-[2px] font-medium text-fg data-hovered:underline data-disabled:cursor-default data-disabled:no-underline", focusRing);

let rejectedSeq = 0;

export function FileUpload({
  label,
  hideLabel,
  description,
  isRequired,
  error,
  isDisabled,
  accept,
  acceptLabel,
  maxSize,
  multiple = false,
  onAdd,
  files,
  onRemove,
  onRetry,
}: FileUploadProps) {
  const m = useMessages();
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const helpId = `${id}-help`;
  const [rejected, setRejected] = useState<FileItem[]>([]);
  const onAddRef = useRef(onAdd);
  onAddRef.current = onAdd;

  const types = acceptLabel ?? (accept && accept.length > 0 ? acceptText(accept, m) : undefined);
  const max = maxSize !== undefined ? formatBytes(maxSize, m) : undefined;
  const hint = types || max ? m.fileHint(types, max) : undefined;
  const help = error ?? description;
  const describedBy = [hint ? hintId : "", help ? helpId : ""].filter(Boolean).join(" ");

  /** Vérifie type et taille ; transmet les fichiers acceptés ; liste les refusés avec leur erreur (nouvel essai : nouvelle liste). */
  const handle = (list: ReadonlyArray<File>) => {
    if (isDisabled || list.length === 0) return;
    const ok: File[] = [];
    const bad: FileItem[] = [];
    const refuse = (f: File, reason: string) =>
      bad.push({ id: `rejected-${++rejectedSeq}`, name: f.name, size: f.size, type: f.type, status: "error", error: reason });
    list.forEach((f, i) => {
      if (!multiple && i > 0) refuse(f, m.fileOnlyOne);
      else if (!isAccepted(f, accept)) refuse(f, m.fileTypeRejected(typeName(f, m)));
      else if (maxSize !== undefined && f.size > maxSize) refuse(f, m.fileTooLarge(formatBytes(f.size, m), formatBytes(maxSize, m)));
      else ok.push(f);
    });
    setRejected(bad);
    if (ok.length > 0) onAddRef.current(ok);
  };

  const onDrop = async (e: { items: DropItem[] }) => {
    const dropped = await Promise.all(e.items.filter((i): i is FileDropItem => i.kind === "file").map((i) => i.getFile()));
    handle(dropped);
  };

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className={fieldRoot("full")}
      {...(isDisabled ? { "data-disabled": "" } : {})}
      {...(error ? { "data-invalid": "" } : {})}
    >
      <span id={labelId} className={cx("w-fit text-sm font-medium text-fg", hideLabel && "sr-only")}>
        {label}
        {!isRequired && !hideLabel && <span className="font-normal text-fg-3"> {m.optional}</span>}
      </span>
      <DropZone data-dropzone="" aria-label={label} isDisabled={Boolean(isDisabled)} onDrop={(e) => void onDrop(e)} className={ZONE}>
        <span className="text-fg-3">
          <UploadIcon />
        </span>
        <span>
          {m.fileDropHere(multiple)}{" "}
          <FileTrigger
            {...(accept && accept.length > 0 ? { acceptedFileTypes: accept } : {})}
            allowsMultiple={multiple}
            onSelect={(fl) => handle(fl ? Array.from(fl) : [])}
          >
            <Button
              isDisabled={Boolean(isDisabled)}
              className={CHOOSE}
              {...(describedBy ? { "aria-describedby": describedBy } : {})}
            >
              {m.fileChoose(multiple)}
            </Button>
          </FileTrigger>
        </span>
        {hint && (
          <span id={hintId} className="text-fg-3">
            {hint}
          </span>
        )}
      </DropZone>
      {help && (
        <span id={helpId} className={cx("text-sm", error ? "text-danger" : "text-fg-3")}>
          {help}
        </span>
      )}
      {/* Toujours montées : leur zone d'annonce doit exister avant le premier changement. */}
      <FileList files={files ?? []} {...(onRemove ? { onRemove } : {})} {...(onRetry ? { onRetry } : {})} />
      <FileList label={m.filesRejected} files={rejected} onRemove={(rid) => setRejected((r) => r.filter((f) => f.id !== rid))} />
    </div>
  );
}
