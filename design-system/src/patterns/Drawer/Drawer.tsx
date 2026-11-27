/*
 * Contenu du panneau de détail d'AppShell. Spec : Drawer.spec.md.
 * Décisions : D-057 à D-061. Interrupteur : composant Toggle (D-136).
 * Forme déclarative : D-180 à D-185.
 */
import { Children, createContext, isValidElement, useContext, useId, useMemo, useState, type ReactNode } from "react";
import { useReorder } from "../../lib/reorder";
import { ActionBar, type Action } from "../ActionBar/ActionBar";
import { Badge, type StatusTone } from "../../components/Badge/Badge";
import { Skeleton, SkeletonGroup } from "../../components/Skeleton/Skeleton";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { CenterMessage, ErrorBanner, ReloadBar, RetryButton } from "../../lib/results";
import { useFieldValue } from "./value";
import { isEmptyValue, type ValueFormat } from "../../components/FormattedValue/FormattedValue";
import { Button } from "react-aria-components/Button";
import { Button as SocleButton } from "../../components/Button/Button";
import { useMessages, useStoredState } from "../../provider/SocleProvider";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { ChevronDown, ChevronRight, GripVertical } from "../../icons";
import { DropdownMenu } from "../../components/DropdownMenu/DropdownMenu";
import { Tooltip } from "../../components/Tooltip/Tooltip";
import { OverflowTooltip } from "../../components/Tooltip/OverflowTooltip";
import { Toggle } from "../../components/Toggle/Toggle";

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

/** État court d'une section, lisible même repliée (D-183). */
export type SectionSummary = string | { label: string; tone?: StatusTone };

export interface DrawerSectionProps {
  id: string;
  title: string;
  /** Bouton à texte en pied de section (D-059). */
  footer?: ReactNode;
  /** État court après le chevron, lisible même repliée : « 2 en retard » (D-183). */
  summary?: SectionSummary;
  /** Actions de la section, à droite du titre, règle de la zone `section` (D-113, D-183). */
  actions?: ReadonlyArray<Action>;
  /** Repliée tant que l'utilisateur ne l'a pas ouverte ; son choix est mémorisé (D-183). */
  defaultCollapsed?: boolean;
  children?: ReactNode;
}

/** En-tête de l'objet montré (D-181). */
export interface DetailHeader {
  /** Nom de l'objet ; deux lignes au plus. */
  title: string;
  /** Une ligne de contexte. */
  subtitle?: string;
  /** État de l'objet, en Badge. */
  status?: { label: string; tone?: StatusTone };
  /** Actions sur l'objet, règle de la zone `section`. */
  actions?: ReadonlyArray<Action>;
}

/** Une ligne de la forme déclarative : valeur brute, mise en forme selon son type (D-182). */
export interface DetailField extends ValueFormat {
  /** Identifiant de la ligne. Défaut : le libellé. */
  id?: string;
  label: string;
  value: unknown;
  /** Ligne masquée si la valeur est vide, au lieu de « — ». */
  hideEmpty?: boolean;
  icon?: ReactNode;
  action?: PropertyAction;
  details?: ReactNode;
}

/** Une section de la forme déclarative (D-183). */
export interface DetailSection {
  id: string;
  title: string;
  fields?: ReadonlyArray<DetailField>;
  /** Contenu libre, sous les champs. Un texte devient un paragraphe. */
  content?: ReactNode;
  /** Texte quand il n'y a ni champ visible ni contenu. Défaut : « Aucune information ». */
  empty?: string;
  actions?: ReadonlyArray<Action>;
  summary?: SectionSummary;
  defaultCollapsed?: boolean;
}

interface DetailPanelCommon {
  /** Phrase quand rien n'est sélectionné. */
  emptyMessage?: string;
}

/** Forme à composants : `Drawer.Section` et `PropertyRow`. */
export interface DrawerComposedProps extends DetailPanelCommon {
  /** `Drawer.Section`. Sans contenu : « Sélectionnez un élément pour voir son détail. » */
  children?: ReactNode;
  header?: never;
  sections?: never;
}

/** Forme déclarative (D-180) : le panneau dessine l'en-tête, les sections et les états. */
export interface DrawerDeclarativeProps extends DetailPanelCommon {
  children?: never;
  header?: DetailHeader;
  sections?: ReadonlyArray<DetailSection>;
  /** Chargement : squelettes sans données, barre fine avec données (D-184). */
  isLoading?: boolean;
  /** Échec du chargement : message, ou bandeau au-dessus des anciennes données (D-184). */
  hasError?: boolean;
  onRetry?: () => void;
  /** L'élément n'existe plus (D-184). */
  isNotFound?: boolean;
  /** L'utilisateur n'a pas le droit de voir l'élément : cadenas, « Vous n'avez pas accès à cet élément » (D-351). */
  isForbidden?: boolean;
  /** Textes de l'accès refusé, à la place des textes par défaut. */
  forbidden?: { title?: string; description?: string };
  /** Avec `isForbidden` : bouton « Demander l'accès ». */
  onRequestAccess?: () => void;
  /** Après la réussite d'une action de l'en-tête ou d'une section. */
  onActionDone?: (action: Action) => void;
  /** Une action a échoué ; l'app affiche la notification (D-116). */
  onActionError?: (action: Action, error: unknown) => void;
  /**
   * L'utilisateur range les sections à sa main : une poignée devant chaque titre, au survol, à glisser ; ou les flèches
   * haut et bas sur la poignée (D-399). L'ordre est mémorisé sous `orderKey`.
   */
  reorderable?: boolean;
  /** Clé de mémoire de l'ordre des sections (par exemple le type d'objet) ; défaut : un ordre commun à l'app. */
  orderKey?: string;
}

export type DrawerProps = DrawerComposedProps | DrawerDeclarativeProps;

const IconColumn = createContext(false);
const ActionHandlers = createContext<{ onDone?: (a: Action) => void; onError?: (a: Action, e: unknown) => void }>({});

export function Drawer(props: DrawerProps) {
  const m = useMessages();
  if (props.header !== undefined || props.sections !== undefined || "isLoading" in props || "hasError" in props || "isNotFound" in props || "isForbidden" in props)
    return <Declarative {...(props as DrawerDeclarativeProps)} />;
  const { children, emptyMessage } = props as DrawerComposedProps;
  if (!children || Children.count(children) === 0)
    return <p className="m-0 p-8 text-center text-fg-3">{emptyMessage ?? m.detailEmpty}</p>;
  return <div className="font-sans text-md text-fg">{children}</div>;
}

/* ---------- Forme déclarative (D-180 à D-184) ---------- */
function Declarative({ header, sections, isLoading, hasError, onRetry, isNotFound, isForbidden, forbidden, onRequestAccess, emptyMessage, onActionDone, onActionError, reorderable = false, orderKey }: DrawerDeclarativeProps) {
  const m = useMessages();
  // Ordre des sections choisi par l'utilisateur (D-399) : les sections connues dans cet ordre, les nouvelles à leur place.
  const [order, setOrder] = useStoredState<string[]>(`detail:order:${orderKey ?? "default"}`, []);
  const sorted = useMemo(() => {
    const list = [...(sections ?? [])];
    if (!reorderable || !order.length) return list;
    const rank = new Map(order.map((id, index) => [id, index]));
    return list
      .map((section, index) => ({ section, index }))
      .sort((a, b) => (rank.get(a.section.id) ?? a.index + order.length) - (rank.get(b.section.id) ?? b.index + order.length))
      .map(({ section }) => section);
  }, [sections, order, reorderable]);
  const [moved, setMoved] = useState("");
  const { scope, ordered, draggedId, startDrag, move } = useReorder(sorted, reorderable ? (ids) => setOrder(ids) : undefined, (id, list) => {
    const section = list.find((s) => s.id === id);
    if (section) setMoved(m.sectionMoved(section.title, list.findIndex((s) => s.id === id) + 1, list.length));
  });
  // Accès refusé : passe avant tout autre état, sans montrer de donnée (D-351).
  if (isForbidden)
    return (
      <div className="font-sans">
        <EmptyState
          size="compact"
          variant="forbidden"
          title={forbidden?.title ?? m.forbiddenItem}
          description={forbidden?.description ?? m.forbiddenText}
          {...(onRequestAccess ? { action: <SocleButton size="sm" onPress={onRequestAccess}>{m.requestAccess}</SocleButton> } : {})}
        />
      </div>
    );
  const hasData = header !== undefined || sections !== undefined;
  if (hasError && !hasData)
    return <CenterMessage alert title={m.detailLoadErrorTitle} text={m.detailLoadErrorText} action={<RetryButton onRetry={onRetry} />} />;
  if (isLoading && !hasData) return <DetailSkeleton />;
  if (isNotFound)
    return (
      <div className="font-sans">
        <EmptyState size="compact" title={m.detailNotFoundTitle} description={m.detailNotFoundText} />
      </div>
    );
  if (!hasData) return <p className="m-0 p-8 text-center font-sans text-fg-3">{emptyMessage ?? m.detailEmpty}</p>;
  const handlers = { ...(onActionDone ? { onDone: onActionDone } : {}), ...(onActionError ? { onError: onActionError } : {}) };
  return (
    <ActionHandlers.Provider value={handlers}>
      <div className="font-sans text-md text-fg">
        {isLoading && <ReloadBar />}
        {header && <Header header={header} />}
        {hasError && (
          <div className="px-(--pad)">
            <ErrorBanner onRetry={onRetry} message={m.detailNotUpdated} />
          </div>
        )}
        {ordered.map((s, index) => (
          <DeclarativeSection
            key={s.id}
            section={s}
            {...(reorderable && ordered.length > 1
              ? {
                  sortable: {
                    scope,
                    dragged: draggedId === s.id,
                    handle: (
                      <button
                        type="button"
                        aria-label={m.sectionMove(s.title, index + 1, ordered.length)}
                        aria-keyshortcuts="ArrowUp ArrowDown"
                        className="socle-btn -mr-1 inline-grid size-5 shrink-0 cursor-grab touch-none place-items-center rounded-sm text-fg-3 opacity-0 group-hover/section:opacity-100 hover:text-fg focus-visible:opacity-100 focus-visible:outline-2 focus-visible:-outline-offset-2 outline-focus focus-visible:outline-solid"
                        onPointerDown={(event) => {
                          const frame = event.currentTarget.closest<HTMLElement>("section");
                          if (frame) startDrag(event, s.id, frame);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                          event.preventDefault();
                          move(s.id, event.key === "ArrowUp" ? -1 : 1);
                        }}
                      >
                        <GripVertical size={14} />
                      </button>
                    ),
                  },
                }
              : {})}
          />
        ))}
        {reorderable && (
          <span role="status" className="sr-only">
            {moved}
          </span>
        )}
      </div>
    </ActionHandlers.Provider>
  );
}

function DetailSkeleton() {
  const widths = ["70%", "45%", "85%", "60%", "40%", "75%"];
  return (
    <SkeletonGroup>
      <div className="px-(--pad) pt-4 pb-2">
        <Skeleton width="70%" height={14} />
        <div className="mt-4 flex flex-col">
          {widths.map((w, i) => (
            <div key={i} className="flex h-(--row-h) items-center gap-2">
              <span className="w-24 shrink-0">
                <Skeleton width={72} />
              </span>
              <Skeleton width={w} />
            </div>
          ))}
        </div>
      </div>
    </SkeletonGroup>
  );
}

function Header({ header }: { header: DetailHeader }) {
  const { onDone, onError } = useContext(ActionHandlers);
  const { title, subtitle, status, actions } = header;
  return (
    <div className="sticky top-0 z-[2] border-b border-line bg-surface px-(--pad) pt-3 pb-2.5">
      <div className="flex items-start gap-2">
        <h2 className="m-0 min-w-0 flex-1 text-lg leading-snug font-heading break-words">
          <OverflowTooltip text={title} textClass="line-clamp-2" />
        </h2>
        {actions && actions.length > 0 && (
          <ActionBar actions={actions} zone="section" subject={title} {...(onDone ? { onDone } : {})} {...(onError ? { onError } : {})} />
        )}
      </div>
      {(status || subtitle) && (
        <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-fg-2">
          {status && <Badge {...(status.tone ? { tone: status.tone } : {})}>{status.label}</Badge>}
          {subtitle && <OverflowTooltip text={subtitle} textClass="truncate" />}
        </div>
      )}
    </div>
  );
}

interface Sortable {
  scope: string;
  dragged: boolean;
  handle: ReactNode;
}

function DeclarativeSection({ section, sortable }: { section: DetailSection; sortable?: Sortable }) {
  const m = useMessages();
  const fieldValue = useFieldValue();
  const { id, title, fields, content, empty, actions, summary, defaultCollapsed } = section;
  const rows = (fields ?? []).filter((f) => !(f.hideEmpty && isEmptyValue(f.value)));
  const hasContent = content !== undefined && content !== null && content !== "" && content !== false;
  return (
    <SectionFrame
      id={id}
      title={title}
      {...(sortable ? { sortable } : {})}
      {...(actions ? { actions } : {})}
      {...(summary !== undefined ? { summary } : {})}
      {...(defaultCollapsed ? { defaultCollapsed } : {})}
      after={
        <>
          {hasContent && (typeof content === "string" ? <p className="m-0 py-1 break-words whitespace-pre-line text-fg">{content}</p> : <div className="py-1">{content}</div>)}
          {rows.length === 0 && !hasContent && <p className="m-0 py-1 text-fg-3">{empty ?? m.detailSectionEmpty}</p>}
        </>
      }
    >
      {rows.map((f) => (
        <PropertyRow
          key={f.id ?? f.label}
          {...(f.id ? { id: f.id } : {})}
          label={f.label}
          value={isEmptyValue(f.value) ? undefined : fieldValue(f)}
          {...(f.icon ? { icon: f.icon } : {})}
          {...(f.action ? { action: f.action } : {})}
          {...(f.details ? { details: f.details } : {})}
        />
      ))}
    </SectionFrame>
  );
}

/* ---------- Section : repliable, état mémorisé (D-061, D-183) ---------- */
function Section(props: DrawerSectionProps) {
  return <SectionFrame {...props} />;
}

/** `after` : contenu libre et texte vide de la forme déclarative, hors de la liste `dl`. */
function SectionFrame({ id, title, footer, summary, actions, defaultCollapsed = false, children, after, sortable }: DrawerSectionProps & { after?: ReactNode; sortable?: Sortable }) {
  const [closed, setClosed] = useStoredState<Record<string, boolean>>("detail:sections", {});
  const { onDone, onError } = useContext(ActionHandlers);
  const open = !(closed[id] ?? defaultCollapsed);
  const headId = useId();
  const bodyId = useId();
  const anyIcon = Children.toArray(children).some((c) => isValidElement<PropertyRowProps>(c) && Boolean(c.props.icon));
  const sum = typeof summary === "string" ? { label: summary } : summary;
  return (
    <section
      aria-labelledby={headId}
      {...(sortable ? { "data-sortable-id": id, "data-sortable-scope": sortable.scope } : {})}
      className={cx("group/section border-b border-line px-(--pad) pt-3 pb-2.5 last:border-b-0", sortable?.dragged && "opacity-40")}
    >
      <div className="mb-1 flex h-6 min-w-0 items-center gap-1.5">
        {/* En-tête d'accordéon (APG) : le bouton est dans un titre de niveau 3, sous le titre de l'objet (h2). */}
        <h3 className="m-0 flex min-w-0 text-[length:inherit] leading-[inherit] font-[inherit]">
          <Button
            id={headId}
            aria-expanded={open}
            aria-controls={bodyId}
            onPress={() => setClosed({ ...closed, [id]: open })}
            className={cx(buttonReset, "flex h-6 min-w-0 items-center gap-1 rounded-sm text-sm text-fg-3 data-hovered:text-fg-2", focusRing)}
          >
            <span className="truncate">{title}</span>
            <ChevronDown size={12} className={cx("shrink-0", !open && "-rotate-90")} />
          </Button>
        </h3>
        {sum && <Badge {...(sum.tone ? { tone: sum.tone } : {})}>{sum.label}</Badge>}
        {/* Actions puis poignée de rangement, au bord droit : le titre reste aligné à gauche (D-399). */}
        {((actions && actions.length > 0) || sortable) && (
          <span className="ml-auto flex items-center gap-1">
            {actions && actions.length > 0 && (
              <ActionBar actions={actions} zone="section" subject={title} {...(onDone ? { onDone } : {})} {...(onError ? { onError } : {})} />
            )}
            {sortable?.handle}
          </span>
        )}
      </div>
      {/* Toujours présent, pour que `aria-controls` vise un élément ; vide quand la section est repliée. */}
      <div id={bodyId} hidden={!open}>
        {open && (
          <>
            {Children.count(children) > 0 && (
              <IconColumn.Provider value={anyIcon}>
                <dl className="m-0">{children}</dl>
              </IconColumn.Provider>
            )}
            {after}
            {footer && <div className="pt-1.5 pb-0.5">{footer}</div>}
          </>
        )}
      </div>
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
      <Toggle hideLabel isSelected={action.isSelected} onChange={action.onChange}>
        {label}
      </Toggle>
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
    <DropdownMenu label={action.label} placement="bottom end" trigger={button}>
      {action.menu}
    </DropdownMenu>
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

Drawer.Section = Section;
Drawer.Row = PropertyRow;
