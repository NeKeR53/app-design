/*
 * Gabarit d'une page de chat avec un agent. Spec : ChatPage.spec.md. Décision : D-382.
 * Barre d'outils de Page, relevé en enfant, pied aligné sur la colonne de 760 px de ChatTranscript,
 * zone de dépôt de fichiers sur toute la page (DOM, ou survol signalé par l'app).
 */
import type { ReactNode } from "react";
import { DropOverlay, useFileDrop } from "../../lib/fileDrop";
import type { Action } from "../../patterns/ActionBar/ActionBar";
import { useMessages } from "../../provider/SocleProvider";
import { PageToolbar } from "../Page/Page";

export interface ChatPageProps {
  /** Le relevé : un `ChatTranscript`. Il prend la hauteur restante et défile seul. */
  children: ReactNode;
  /** Contenu libre de la barre d'outils, à gauche (titre de la conversation). Une ligne, comme `Page`. */
  toolbar?: ReactNode;
  /** Actions de la barre, zone `toolbar`, à droite. */
  actions?: ReadonlyArray<Action>;
  /** Sujet des actions, pour leur nom accessible. */
  actionsLabel?: string;
  onActionError?: (action: Action, error: unknown) => void;
  onActionDone?: (action: Action) => void;
  /** `Alert` liés à la saisie (sauvegarde en échec), au-dessus de la question. */
  alerts?: ReactNode;
  /** Question ou autorisation de l'agent (`ChoicePrompt`). Bornée à 40 % de la hauteur de la page de chat, 360 px au plus ; elle défile. */
  question?: ReactNode;
  /** La saisie (`ChatComposer`). Absente : conversation en lecture seule. */
  composer?: ReactNode;
  /** La rangée d'options (`ChatOptions`), juste sous la saisie. */
  options?: ReactNode;
  /** Fichiers déposés n'importe où sur la page. Sans lui, pas de dépôt DOM. */
  onDropFiles?: (files: File[]) => void;
  /** Survol de fichiers vu par l'app (glisser-déposer du système, Tauri) : affiche le cadre de dépôt. */
  isDraggingFiles?: boolean;
  /** Texte du cadre de dépôt. Défaut : « Déposez les fichiers pour les joindre » (i18n). */
  dropLabel?: string;
}

/** Page de chat : barre d'outils, relevé, pied aligné sur la colonne du relevé (D-382). */
export function ChatPage({
  children,
  toolbar,
  actions,
  actionsLabel,
  onActionError,
  onActionDone,
  alerts,
  question,
  composer,
  options,
  onDropFiles,
  isDraggingFiles = false,
  dropLabel,
}: ChatPageProps) {
  const m = useMessages();
  const hasBar = toolbar !== undefined || (actions && actions.length > 0);
  const { dropProps, showDrop } = useFileDrop({ onDropFiles, isDraggingFiles });

  return (
    <div className="socle-chat-page flex h-full min-h-0 flex-col bg-surface font-sans text-md text-fg">
      {hasBar && (
        <PageToolbar
          width="full"
          toolbar={toolbar}
          actions={actions}
          actionsLabel={actionsLabel}
          onActionError={onActionError}
          onActionDone={onActionDone}
        />
      )}
      <div
        data-chat-page-main=""
        data-dragging={showDrop || undefined}
        className="relative flex min-h-0 flex-1 flex-col [container-type:size]"
        {...dropProps}
      >
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        {(alerts || question || composer || options) && (
          <div data-chat-page-footer="" className="mx-auto box-border flex w-full max-w-[calc(760px+32px)] shrink-0 flex-col gap-2 px-4 pb-4">
            {alerts && <div className="flex flex-col gap-2 empty:hidden">{alerts}</div>}
            {question && (
              <div data-chat-page-question="" className="socle-focus-scroll max-h-[min(40cqh,360px)] overflow-auto overscroll-contain empty:hidden">
                {question}
              </div>
            )}
            {(composer || options) && (
              <div>
                {composer}
                {options}
              </div>
            )}
          </div>
        )}
        {showDrop && <DropOverlay marker="data-chat-page-drop" label={dropLabel ?? m.chatPageDropHere} />}
      </div>
    </div>
  );
}
