import { ProgressBar } from "react-aria-components/ProgressBar";
import { useMessages } from "../provider/SocleProvider";

/**
 * Roue d'attente d'un bouton (D-105, D-107) : 14 px dans une case de 16 px, à la place de l'icône.
 * C'est un `progressbar` indéterminé ; dans un bouton React Aria en attente, il complète le nom accessible.
 * Animation `socle-spin`, ralentie si l'utilisateur réduit les animations.
 */
export function PendingSpinner() {
  const m = useMessages();
  return (
    <ProgressBar aria-label={m.loading} isIndeterminate className="inline-grid size-(--icon) shrink-0 place-items-center">
      <span aria-hidden="true" className="socle-spin size-3.5 rounded-full border-2 border-current border-r-transparent" />
    </ProgressBar>
  );
}
