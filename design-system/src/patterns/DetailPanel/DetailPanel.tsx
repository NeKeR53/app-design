/*
 * Contenu du panneau de détail d'AppShell. Spec : DetailPanel.spec.md.
 * Décisions : D-057 à D-061. Switch adapté du starter Tailwind de React Aria (Apache 2.0).
 */
import { Children, createContext, isValidElement, useContext, useId, type ReactNode } from "react";
import { Button } from "react-aria-components/Button";
import { Switch } from "react-aria-components/Switch";
import { useMessages, useStoredState } from "../../provider/SocleProvider";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { ChevronDown, ChevronRight } from "../../icons";
import { Menu } from "../../components/Menu/Menu";
import { Tooltip } from "../../components/Tooltip/Tooltip";
import { OverflowTooltip } from "../../components/Tooltip/OverflowTooltip";

/** Une action à droite, parmi trois types (D-059). */
export type PropertyAction =
  | { type: "link"; label: string; onPress: () => void }
  | { type: "switch"; isSelected: boolean; onChange: (v: boolean) => void }
  | { type: "icon"; icon: ReactNode; label: string; onPress?: () => void; menu?: ReactNode };

export interface PropertyRowProps {
  /** Identifiant, pour mémoriser le dépliage d'une ligne qui s'ouvre. Défaut : le libellé. */
  id?: string;
  label: string;
  /** Valeur ; vide : « — » en gris. */
  value?: ReactNode;
  /** Icône facultative, alignée par section (D-057). */
  icon?: ReactNode;
  action?: PropertyAction;
  /** Contenu caché : la ligne s'ouvre sur place, avec « › » (D-060). */
  details?: ReactNode;
}

export interface DetailPanelSectionProps {
  id: string;
  title: string;
  /** Bouton à texte en pied de section (D-059). */
  footer?: ReactNode;
  children: ReactNode;
}

export interface DetailPanelProps {
  /** `DetailPanel.Section`. Sans contenu : « Sélectionnez un élément pour voir son détail. » */
  children?: ReactNode;
}

const IconColumn = createContext(false);

export function DetailPanel({ children }: DetailPanelProps) {
  const m = useMessages();
  if (!children || Children.count(children) === 0)
    return <p className="m-0 p-8 text-center text-fg-3">{m.detailEmpty}</p>;
  return <div className="font-sans text-md text-fg">{children}</div>;
}

/* ---------- Section : repliable, état mémorisé (D-061) ---------- */
function Section({ id, title, footer, children }: DetailPanelSectionProps) {
  const [closed, setClosed] = useStoredState<Record<string, boolean>>("detail:sections", {});
  const open = !closed[id];
  const headId = useId();
  const anyIcon = Children.toArray(children).some((c) => isValidElement<PropertyRowProps>(c) && Boolean(c.props.icon));
  return (
    <section aria-labelledby={headId} className="border-b border-line px-(--pad) pt-3 pb-2.5 last:border-b-0">
      <Button
        id={headId}
        aria-expanded={open}
        onPress={() => setClosed({ ...closed, [id]: open })}
        className={cx(buttonReset, "mb-1 flex h-6 items-center gap-1 rounded-sm text-sm text-fg-3 data-hovered:text-fg-2", focusRing)}
      >
        {title}
        <ChevronDown size={12} className={cx(!open && "-rotate-90")} />
      </Button>
      {open && (
        <>
          <IconColumn.Provider value={anyIcon}>
            <dl className="m-0">{children}</dl>
          </IconColumn.Provider>
          {footer && <div className="pt-1.5 pb-0.5">{footer}</div>}
        </>
      )}
    </section>
  );
}

/* ---------- Ligne de propriété : deux colonnes alignées (D-058) ---------- */
const actionBox = "flex h-[calc(4px+var(--fs-md)*var(--lh))] shrink-0 items-center"; // centré sur la 1re ligne (D-060)

function Action({ action, label }: { action: PropertyAction; label: string }) {
  if (action.type === "link")
    return (
      <Button onPress={action.onPress} aria-label={`${action.label} : ${label}`} className={cx(buttonReset, "rounded-sm px-1 text-sm text-accent-text data-hovered:underline", focusRing)}>
        {action.label}
      </Button>
    );
  if (action.type === "switch")
    return (
      <Switch isSelected={action.isSelected} onChange={action.onChange} aria-label={label} className={cx("group flex cursor-default items-center", focusRing, "rounded-full")}>
        <span className="relative h-[18px] w-[30px] rounded-full bg-selected transition-colors duration-[var(--dur-fast)] group-data-selected:bg-accent">
          <span className="absolute top-[2px] left-[2px] size-[14px] rounded-full bg-white shadow-sm transition-transform duration-[var(--dur-fast)] group-data-selected:translate-x-3" />
        </span>
      </Switch>
    );
  const button = (
    <Tooltip content={action.label}>
      <Button
        aria-label={action.label}
        {...(action.onPress ? { onPress: action.onPress } : {})}
        className={cx(buttonReset, "inline-grid size-[22px] place-items-center rounded-sm text-fg-2 data-hovered:bg-hover data-hovered:text-fg [&>svg]:size-3.5", focusRing)}
      >
        {action.icon}
      </Button>
    </Tooltip>
  );
  return action.menu ? (
    <Menu label={action.label} placement="bottom end" trigger={button}>
      {action.menu}
    </Menu>
  ) : (
    button
  );
}

export function PropertyRow({ id, label, value, icon, action, details }: PropertyRowProps) {
  const iconColumn = useContext(IconColumn);
  const [openRows, setOpenRows] = useStoredState<Record<string, boolean>>("detail:rows", {});
  const key = id ?? label;
  const expanded = Boolean(details) && Boolean(openRows[key]);
  const empty = value === undefined || value === null || value === "";
  // Dans un bouton, dt et dd ne sont pas permis : on garde des span.
  const Term = details ? "span" : "dt";
  const Def = details ? "span" : "dd";
  const cells = (
    <>
      {iconColumn && <span className="mt-[3px] inline-grid w-4 shrink-0 place-items-start self-start text-fg-2">{icon}</span>}
      <Term className="w-24 shrink-0 self-start pt-0.5 text-fg-2">{label}</Term>
      <Def className={cx("m-0 min-w-0 flex-1 self-start pt-0.5 break-words hyphens-auto", empty ? "text-fg-3" : "text-fg")}>
        {empty ? "—" : typeof value === "string" ? <OverflowTooltip text={value} textClass="line-clamp-3" /> : value}
      </Def>
    </>
  );
  if (details) {
    return (
      <div>
        <Button
          aria-expanded={expanded}
          onPress={() => setOpenRows({ ...openRows, [key]: !expanded })}
          className={cx(buttonReset, "-mx-2 flex min-h-(--row-h) w-[calc(100%+16px)] cursor-default items-start gap-2 rounded-md px-2 py-1 text-left data-hovered:bg-hover", focusRing)}
        >
          {cells}
          <span className={cx(actionBox, "text-fg-3")}>
            <ChevronRight size={14} className={cx(expanded && "rotate-90")} />
          </span>
        </Button>
        {expanded && <div className="ml-6 pb-1.5 text-sm text-fg-2">{details}</div>}
      </div>
    );
  }
  return (
    <div className="flex min-h-(--row-h) items-start gap-2 py-1">
      {cells}
      {action && (
        <span className={actionBox}>
          <Action action={action} label={label} />
        </span>
      )}
    </div>
  );
}

DetailPanel.Section = Section;
DetailPanel.Row = PropertyRow;
