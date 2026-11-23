/*
 * Texte à chasse fixe. Spec : Code.spec.md. Décision : D-168.
 */
import type { ReactNode } from "react";
import { useMessages } from "../../provider/SocleProvider";

export interface CodeProps {
  children: ReactNode;
  /** Bloc préformaté : garde les retours à la ligne, défile à l'horizontale, joignable au clavier. */
  block?: boolean;
  /** Nom accessible du bloc. Défaut : « Extrait de code ». */
  label?: string;
}

/** En ligne : fond `--field`, rayon 4 px. En bloc : rayon 8 px, défilement (D-168). */
export function Code({ children, block = false, label }: CodeProps) {
  const m = useMessages();
  if (!block) return <code className="rounded-sm bg-field px-[5px] py-px font-mono text-[0.92em] text-fg">{children}</code>;
  return (
    <pre
      role="region"
      aria-label={label ?? m.codeSample}
      tabIndex={0}
      className="m-0 overflow-auto rounded-md bg-field px-3 py-2.5 font-mono text-sm whitespace-pre text-fg outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
    >
      <code>{children}</code>
    </pre>
  );
}
