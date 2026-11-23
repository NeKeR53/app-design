import { ProgressBar } from "react-aria-components/ProgressBar";
import { Spinner } from "../components/Spinner/Spinner";
import { useMessages } from "../provider/SocleProvider";

/**
 * Roue d'attente d'un bouton (D-105, D-107) : 14 px dans une case de 16 px, à la place de l'icône.
 * C'est un `progressbar` indéterminé ; dans un bouton React Aria en attente, il complète le nom accessible.
 * Le cercle est `<Spinner decorative />` (D-360), dans la couleur du bouton (`--spinner-fg`).
 */
export function PendingSpinner() {
  const m = useMessages();
  return (
    <ProgressBar aria-label={m.loading} isIndeterminate className="inline-grid size-(--icon) shrink-0 place-items-center [--spinner-fg:currentColor]">
      <Spinner decorative />
    </ProgressBar>
  );
}
