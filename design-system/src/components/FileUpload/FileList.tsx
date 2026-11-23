/*
 * Liste de fichiers : une ligne par fichier, état d'envoi géré par l'app. Spec : FileUpload.spec.md.
 * Validation : docs/validation/components/Nouveaux-P2-P3-v1.html (F2 et F3, options A).
 */
import { useEffect, useRef, useState } from "react";
import { ProgressBar as RACProgressBar } from "react-aria-components/ProgressBar";
import { cx } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import type { SocleMessages } from "../../i18n/messages";
import { X } from "../../icons";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { OverflowTooltip } from "../Tooltip/OverflowTooltip";
import { FileTypeIcon, formatBytes, visualOf } from "./files";

/** État d'un fichier : en attente, envoi en cours, envoyé, en erreur. */
export type FileStatus = "pending" | "uploading" | "done" | "error";

/** Un fichier de la liste, décrit par l'app. */
export interface FileItem {
  /** Identifiant stable, unique dans la liste. */
  id: string;
  /** Nom du fichier, extension comprise. */
  name: string;
  /** Taille en octets. */
  size?: number;
  /** Type MIME : choisit l'icône. Sans lui, l'extension la choisit. */
  type?: string;
  /** Défaut : `done`. */
  status?: FileStatus;
  /** Avancement de l'envoi, de 0 à 100, avec `status: "uploading"`. Sans valeur : barre indéterminée. */
  progress?: number;
  /** Ce qui ne va pas, avec `status: "error"` : « Fichier trop lourd : 12 Mo, 10 Mo au plus. ». */
  error?: string;
}

export interface FileListProps {
  files: ReadonlyArray<FileItem>;
  /** Bouton × de chaque ligne : « Retirer <nom> ». Sans lui, pas de bouton. */
  onRemove?: (id: string) => void;
  /** Bouton « Réessayer » des lignes en erreur. Sans lui, pas de bouton. */
  onRetry?: (id: string) => void;
  /** Nom de la liste. Défaut : « Fichiers » (i18n). */
  label?: string;
}

/** Nombre de caractères gardés à la fin du nom, extension comprise, pour couper au milieu. */
const TAIL = 8;

/** Nom coupé au milieu : le début se tronque, la fin (extension) reste. Nom complet en info-bulle s'il est coupé. */
function FileName({ name }: { name: string }) {
  const split = name.length > TAIL * 2;
  const head = split ? name.slice(0, -TAIL) : name;
  const tail = split ? name.slice(-TAIL) : "";
  return (
    <span className="flex min-w-0 font-medium text-fg" data-file-name="">
      <OverflowTooltip text={name} textClass="min-w-0 truncate whitespace-pre">
        {head}
      </OverflowTooltip>
      {tail && <span className="shrink-0 whitespace-pre">{tail}</span>}
    </span>
  );
}

/** Texte d'état, pour la ligne et pour l'annonce. */
function statusText(f: FileItem, m: SocleMessages): string {
  switch (f.status ?? "done") {
    case "pending":
      return m.fileStatusPending;
    case "uploading":
      return m.fileStatusUploading(f.progress === undefined ? undefined : new Intl.NumberFormat(m.locale, { style: "percent" }).format(Math.round(f.progress) / 100));
    case "error":
      return f.error || m.fileStatusError;
    default:
      return m.fileStatusDone;
  }
}

/**
 * Annonce polie des changements d'état (D-089) : rien à l'affichage de la liste,
 * puis « Devis.pdf : envoyé » à chaque fichier ajouté ou dont l'état change. L'avancement n'est pas lu.
 */
function useStatusAnnouncement(files: ReadonlyArray<FileItem>, m: SocleMessages) {
  const seen = useRef<Map<string, string> | null>(null);
  const [said, setSaid] = useState("");
  useEffect(() => {
    const next = new Map(files.map((f) => [f.id, `${f.status ?? "done"}|${f.error ?? ""}`]));
    const prev = seen.current;
    seen.current = next;
    if (!prev) return;
    const changed = files.filter((f) => prev.get(f.id) !== next.get(f.id));
    if (changed.length === 0) return;
    setSaid(changed.map((f) => m.fileAnnounce(f.name, statusText(f, m))).join(" "));
  }, [files, m]);
  return said;
}

export function FileList({ files, onRemove, onRetry, label }: FileListProps) {
  const m = useMessages();
  const said = useStatusAnnouncement(files, m);
  return (
    <div className={files.length > 0 ? "socle-box min-w-0 font-sans text-md text-fg" : "contents"}>
      {files.length > 0 && (
        <ul aria-label={label ?? m.fileList} className="m-0 list-none p-0">
          {files.map((f) => {
            const status = f.status ?? "done";
            const meta = [f.size !== undefined ? formatBytes(f.size, m) : null, status === "pending" || status === "uploading" ? statusText(f, m) : null]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={f.id} data-status={status} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-line py-1.5 text-sm">
                <span className={cx("inline-flex self-start pt-0.5", status === "error" ? "text-danger" : "text-fg-2")}>
                  <FileTypeIcon visual={visualOf(f)} />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <FileName name={f.name} />
                  {status === "error" ? (
                    <span className="text-sm text-danger">{statusText(f, m)}</span>
                  ) : (
                    meta && <span className="text-sm text-fg-3 tabular-nums">{meta}</span>
                  )}
                  {status === "uploading" && (
                    <RACProgressBar
                      aria-label={m.fileUploadingName(f.name)}
                      isIndeterminate={f.progress === undefined}
                      {...(f.progress === undefined ? {} : { value: Math.min(Math.max(0, f.progress), 100) })}
                      className="relative mt-0.5 block h-0.75 overflow-hidden rounded-full bg-field"
                    >
                      {({ percentage }) =>
                        f.progress === undefined ? (
                          <span className="socle-reload absolute inset-y-0 w-[30%] rounded-full bg-accent" />
                        ) : (
                          <span className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-(--dur-slow) ease-standard" style={{ width: `${percentage ?? 0}%` }} />
                        )
                      }
                    </RACProgressBar>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  {status === "error" && onRetry && (
                    <Button size="sm" variant="subtle" aria-label={m.retryFile(f.name)} onPress={() => onRetry(f.id)}>
                      {m.retry}
                    </Button>
                  )}
                  {onRemove && <IconButton icon={<X />} label={m.removeItem(f.name)} onPress={() => onRemove(f.id)} tooltipPlacement="top" />}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <span aria-live="polite" className="sr-only" data-file-announcer="">
        {said}
      </span>
    </div>
  );
}
