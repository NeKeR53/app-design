/*
 * Dépôt de fichiers sur toute une page (ChatPage D-382, ListPage D-416) : survol vu dans le DOM,
 * ou signalé par l'app quand le système le capte (Tauri), et cadre « Déposez… » posé sur la page.
 */
import { useEffect, useState, type DragEvent } from "react";

const hasFiles = (event: DragEvent) => event.dataTransfer.types.includes("Files");

export interface FileDropOptions {
  /** Fichiers déposés. Sans lui, pas de dépôt DOM. */
  onDropFiles?: ((files: File[]) => void) | undefined;
  /** Survol de fichiers vu par l'app (glisser-déposer du système). */
  isDraggingFiles?: boolean | undefined;
}

/** Écouteurs à poser sur la zone de dépôt, et l'état du cadre. */
export function useFileDrop({ onDropFiles, isDraggingFiles = false }: FileDropOptions) {
  const [domDragging, setDomDragging] = useState(false);
  const canDrop = Boolean(onDropFiles);

  // Un glisser qui finit hors de la page (abandon, dépôt ailleurs) ne laisse pas le cadre affiché.
  useEffect(() => {
    if (!domDragging) return;
    const reset = () => setDomDragging(false);
    window.addEventListener("dragend", reset);
    window.addEventListener("drop", reset);
    return () => {
      window.removeEventListener("dragend", reset);
      window.removeEventListener("drop", reset);
    };
  }, [domDragging]);

  const onDragOver = (event: DragEvent<HTMLElement>) => {
    if (!canDrop || !hasFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDomDragging(true);
  };
  const onDragLeave = (event: DragEvent<HTMLElement>) => {
    // Passer d'un enfant à l'autre déclenche aussi « dragleave » : seule la sortie de la zone compte.
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
    setDomDragging(false);
  };
  const onDrop = (event: DragEvent<HTMLElement>) => {
    if (!canDrop) return;
    setDomDragging(false);
    // Déjà pris par un enfant qui a son propre dépôt (ChatComposer, FileUpload) : pas de second ajout.
    if (event.defaultPrevented) return;
    event.preventDefault();
    const files = [...event.dataTransfer.files];
    if (files.length) onDropFiles?.(files);
  };

  return { dropProps: { onDragOver, onDragLeave, onDrop }, showDrop: isDraggingFiles || domDragging };
}

/** Cadre de dépôt posé sur la zone : trait pointillé et texte en accent (D-382). */
export function DropOverlay({ label, marker }: { label: string; marker: string }) {
  return (
    <div
      {...{ [marker]: "" }}
      className="pointer-events-none absolute inset-3 z-60 grid place-items-center rounded-md border border-dashed border-accent bg-[color-mix(in_oklch,var(--accent)_6%,var(--surface))] text-center text-md text-accent"
    >
      {label}
    </div>
  );
}
