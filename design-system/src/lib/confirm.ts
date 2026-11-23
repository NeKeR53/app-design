/**
 * Demande de confirmation d'une action (D-115).
 *
 * Raccord entre ActionBar et la confirmation de Socle (`useConfirm`, D-127) : la modale
 * de confirmation affichée par `SocleProvider`. Une action destructrice n'est jamais lancée sans accord.
 */
import { useCallback } from "react";
import { useConfirm } from "../components/Modal/useConfirm";

export interface ConfirmRequest {
  /** Question, qui nomme l'objet. */
  title: string;
  /** Conséquence, sous la question. */
  message?: string;
  /** Libellé du bouton qui confirme : celui de l'action. */
  confirmLabel: string;
  /** Action destructrice : bouton de confirmation en rouge. */
  danger: boolean;
}

export type ConfirmFn = (request: ConfirmRequest) => Promise<boolean>;

/** Fonction de confirmation à utiliser : la modale de Socle. */
export function useConfirmFn(): ConfirmFn {
  const confirm = useConfirm();
  return useCallback(
    (request: ConfirmRequest) =>
      confirm({
        title: request.title,
        message: request.message,
        confirmLabel: request.confirmLabel,
        tone: request.danger ? "danger" : "default",
      }),
    [confirm],
  );
}
