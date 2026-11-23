/*
 * Bloc repliable avec un titre. Spec : Disclosure.spec.md.
 * Décisions : D-320, D-321 (même titre que les sections de DetailPanel, D-061).
 */
import { useId, useState, type ReactNode } from "react";
import { Button } from "react-aria-components/Button";
import { useStoredState } from "../../provider/SocleProvider";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { ChevronDown } from "../../icons";

export interface DisclosureProps {
  /** Titre, toujours visible ; il replie ou déplie le bloc. */
  title: string;
  /** Contenu, créé seulement à l'ouverture. */
  children: ReactNode;
  /** Déplié au premier affichage. Défaut : replié. */
  defaultExpanded?: boolean;
  /** Ouverture pilotée par l'app, avec `onExpandedChange`. */
  isExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  /** Identifiant stable : l'état est mémorisé (comme D-061). */
  id?: string;
}

/** État mémorisé dans le stockage de SocleProvider, partagé par tous les Disclosure. */
function useExpanded(id: string | undefined, initial: boolean): [boolean, (v: boolean) => void] {
  const [stored, setStored] = useStoredState<Record<string, boolean>>("disclosure", {});
  const [local, setLocal] = useState(initial);
  if (id === undefined) return [local, setLocal];
  return [stored[id] ?? initial, (v) => setStored({ ...stored, [id]: v })];
}

export function Disclosure({ title, children, defaultExpanded = false, isExpanded, onExpandedChange, id }: DisclosureProps) {
  const [own, setOwn] = useExpanded(id, defaultExpanded);
  const open = isExpanded ?? own;
  const panelId = useId();
  const toggle = () => {
    if (isExpanded === undefined) setOwn(!open);
    onExpandedChange?.(!open);
  };
  return (
    <div className="font-sans text-md text-fg">
      <Button
        aria-expanded={open}
        {...(open ? { "aria-controls": panelId } : {})}
        onPress={toggle}
        className={cx(buttonReset, "-mx-0.5 mb-1 flex h-6 max-w-full items-center gap-1 rounded-sm px-0.5 text-sm text-fg-3 data-hovered:text-fg-2", focusRing)}
      >
        <span className="min-w-0 truncate">{title}</span>
        <ChevronDown size={12} className={cx("shrink-0", !open && "-rotate-90")} />
      </Button>
      {open && (
        <div id={panelId} role="group" aria-label={title} className="pb-1.5">
          {children}
        </div>
      )}
    </div>
  );
}
