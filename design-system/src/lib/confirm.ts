/**
 * Demande de confirmation d'une action (D-115).
 *
 * Point de raccord avec la confirmation de Socle (P3, `useConfirm`). Tant qu'elle n'est pas
 * disponible, la boîte de confirmation du navigateur sert de repli : une action destructrice
 * n'est jamais lancée sans accord.
 */
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

const browserConfirm: ConfirmFn = (request) =>
  Promise.resolve(typeof window !== "undefined" && window.confirm(request.message ? `${request.title}\n\n${request.message}` : request.title));

/** Fonction de confirmation à utiliser. Une fois P3 fusionné, rendre ici `useConfirm()`. */
export function useConfirmFn(): ConfirmFn {
  return browserConfirm;
}
