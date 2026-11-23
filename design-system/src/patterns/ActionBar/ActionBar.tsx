/*
 * Modèle Action et ActionBar. Spec : ActionBar.spec.md (D-110 à D-118, D-220 à D-222).
 * L'app décrit ses actions par des données ; la zone décide de leur forme.
 */
import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Button } from "../../components/Button/Button";
import { IconButton } from "../../components/IconButton/IconButton";
import { DropdownMenu } from "../../components/DropdownMenu/DropdownMenu";
import { MoreHorizontal } from "../../icons";
import { useConfirmFn, type ConfirmRequest } from "../../lib/confirm";
import { useMedia } from "../../lib/media";
import { useMessages } from "../../provider/SocleProvider";

/** Une action, décrite par ce qu'elle fait (D-110). */
export interface Action {
  /** Identifiant stable, unique dans la barre. */
  id: string;
  /** Verbe à l'infinitif, et objet si le contexte ne le donne pas. */
  label: string;
  /** Ce que fait l'action. Une promesse déclenche l'attente (D-116). */
  onPress: () => unknown;
  /** Icône de l'app (D-011). Sans icône, l'action va dans « … », sauf l'action principale à texte. */
  icon?: ReactNode;
  /** L'action attendue de la zone. Une seule : la première compte. */
  primary?: boolean;
  /** Action destructrice : dans « … », en rouge, en dernier, toujours confirmée (D-115). */
  danger?: boolean;
  /** Question de confirmation ; le texte seul est le titre. */
  confirm?: string | { title: string; message?: string; confirmLabel?: string };
  /** Raccourci affiché, par exemple "Mod+E" (D-032, D-048). L'app le déclare elle-même. */
  shortcut?: string;
  isDisabled?: boolean;
  /**
   * Inactive avec une raison : le contrôle garde le focus, un clic ne fait rien, la raison est
   * dans l'info-bulle (bouton) ou sous le libellé (menu « … »). Prime sur `isDisabled`.
   */
  disabledReason?: string;
  /** L'action n'existe pas dans cet état : elle n'est pas rendue. */
  isHidden?: boolean;
}

/** Zone où se trouve la barre ; elle fixe la règle (D-111). */
export type ActionZone = "topbar" | "header" | "toolbar" | "section" | "row" | "empty";

export interface ArrangedActions {
  /** Action principale à texte (absente en `row` ; en `topbar`, seulement sans icône, D-220). */
  primary: Action | undefined;
  /** Actions en bouton-icône, dans l'ordre. */
  icons: Action[];
  /** Entrées du menu « … », avant le séparateur. */
  menu: Action[];
  /** Actions danger, en dernier dans « … » (D-115). */
  danger: Action[];
}

const maxIcons: Record<ActionZone, number> = { topbar: 3, header: 3, toolbar: 3, section: 2, row: 1, empty: 0 };
const collapsesWhenNarrow = new Set<ActionZone>(["topbar", "header", "toolbar"]);

/** Repli selon la place, en zone `topbar` (D-221) : ce qui tient encore dans la barre. */
export interface ActionFit {
  /** Icônes visibles au plus ; les suivantes passent dans « … », avant les autres entrées. */
  icons: number;
  /** Faux : l'action principale à texte passe en tête de « … ». */
  primary: boolean;
}

/** La règle seule, sans rendu (D-111 à D-114, D-117, D-220, D-221). */
export function arrangeActions(actions: ReadonlyArray<Action>, zone: ActionZone, options: { narrow?: boolean; fit?: ActionFit } = {}): ArrangedActions {
  const shown = actions.filter((a) => !a.isHidden);
  const main = zone === "row" ? undefined : shown.find((a) => a.primary && !a.danger);
  if (zone === "empty") return { primary: main, icons: [], menu: [], danger: [] };

  const others = shown.filter((a) => a !== main);
  const danger = others.filter((a) => a.danger);
  const safe = others.filter((a) => !a.danger);
  let primary: Action | undefined = main;
  let icons: Action[];
  let lead: Action[] = [];

  if (zone === "topbar") {
    // D-112 : l'action principale à icône reste une icône, en premier.
    // D-220 : sans icône, elle devient un bouton à texte, tout à droite.
    if (main?.icon) primary = undefined;
    const max = options.narrow ? 0 : maxIcons.topbar;
    const rest = safe.filter((a) => a.icon).slice(0, main?.icon ? Math.max(0, max - 1) : max);
    const all = main?.icon ? [main, ...rest] : rest;
    // D-221 : quand la place manque, les icônes partent depuis la fin, puis le bouton à texte.
    const fit = options.fit;
    icons = fit ? all.slice(0, Math.max(0, fit.icons)) : all;
    const folded = all.filter((a) => !icons.includes(a));
    if (primary && fit && !fit.primary) {
      lead = [primary, ...folded];
      primary = undefined;
    } else lead = folded;
  } else if (zone === "row") {
    // D-114 : deux contrôles au plus ; deux icônes seulement si la ligne n'a rien d'autre.
    const allIcons = danger.length === 0 && safe.length <= 2 && safe.every((a) => a.icon);
    icons = allIcons ? safe : safe.filter((a) => a.icon).slice(0, 1);
  } else {
    const max = options.narrow && collapsesWhenNarrow.has(zone) ? 0 : maxIcons[zone];
    icons = safe.filter((a) => a.icon).slice(0, max);
  }
  const menu = [...lead, ...safe.filter((a) => !icons.includes(a) && !lead.includes(a))];
  return { primary, icons, menu, danger };
}

export function confirmRequest(action: Action, question: (label: string) => string): ConfirmRequest | null {
  if (!action.danger && !action.confirm) return null;
  const c = typeof action.confirm === "string" ? { title: action.confirm } : action.confirm;
  return {
    title: c?.title ?? question(action.label),
    ...(c && "message" in c && c.message ? { message: c.message } : {}),
    confirmLabel: (c && "confirmLabel" in c && c.confirmLabel) || action.label,
    danger: Boolean(action.danger),
  };
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return typeof value === "object" && value !== null && typeof (value as { then?: unknown }).then === "function";
}

export interface ActionBarProps {
  /** Les actions, dans l'ordre voulu. */
  actions: ReadonlyArray<Action>;
  /** La zone, qui fixe la règle (D-111). */
  zone: ActionZone;
  /** Objet des actions, dans le nom du groupe : « Actions sur Rapport trimestriel ». */
  subject?: string;
  /** Appelé si `onPress` lève une erreur ou rejette sa promesse (D-116). */
  onError?: (action: Action, error: unknown) => void;
  /** Appelé après la réussite d'une action. */
  onDone?: (action: Action) => void;
}

/**
 * Lance une action selon D-115 et D-116 : confirmation, attente pendant la promesse, `onDone` ou `onError`.
 * Usage interne (ActionBar, actions de ligne des gabarits).
 */
export function useActionRunner({ onError, onDone }: { onError?: ActionBarProps["onError"] | undefined; onDone?: ActionBarProps["onDone"] | undefined } = {}) {
  const m = useMessages();
  const confirm = useConfirmFn();
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());
  const running = useRef(new Set<string>());
  const run = async (action: Action) => {
    if (action.isDisabled || action.disabledReason || running.current.has(action.id)) return;
    const request = confirmRequest(action, m.confirmQuestion);
    if (request && !(await confirm(request))) return;
    let result: unknown;
    try {
      result = action.onPress();
    } catch (error) {
      onError?.(action, error);
      return;
    }
    if (!isThenable(result)) {
      onDone?.(action);
      return;
    }
    running.current.add(action.id);
    setPending(new Set(running.current));
    try {
      await result;
      onDone?.(action);
    } catch (error) {
      onError?.(action, error);
    } finally {
      running.current.delete(action.id);
      setPending(new Set(running.current));
    }
  };
  return { run, pending };
}

/** Barre d'actions dessinée d'après des `Action` : icônes, « … », action principale à droite. */
export function ActionBar({ actions, zone, subject, onError, onDone }: ActionBarProps) {
  const m = useMessages();
  const narrow = useMedia("(max-width: 640px)");
  const { run, pending } = useActionRunner({ onError, onDone });
  const group = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  const full = arrangeActions(actions, zone, { narrow });
  const fit = useTopbarFit(zone === "topbar", group, measure, full);
  const { primary, icons, menu, danger } = fit ? arrangeActions(actions, zone, { narrow, fit }) : full;

  if (zone === "empty") {
    return primary ? (
      <Button variant="primary" isDisabled={Boolean(primary.isDisabled)} {...reasonOf(primary)} isPending={pending.has(primary.id)} onPress={() => void run(primary)}>
        {primary.label}
      </Button>
    ) : null;
  }
  if (!primary && icons.length + menu.length + danger.length === 0) return null;

  const item = (a: Action) => (
    <DropdownMenu.Item
      key={a.id}
      id={a.id}
      label={a.label}
      onAction={() => void run(a)}
      {...(a.icon ? { icon: a.icon } : {})}
      {...(a.shortcut ? { shortcut: a.shortcut } : {})}
      {...(a.danger ? { danger: true } : {})}
      {...(a.isDisabled || pending.has(a.id) ? { isDisabled: true } : {})}
      {...reasonOf(a)}
    />
  );
  // Une action du menu « … » en cours : le bouton « … » montre l'attente et ignore les clics (D-116).
  const menuPending = [...menu, ...danger].some((a) => pending.has(a.id));

  return (
    <div ref={group} role="group" aria-label={subject ? m.actionsOn(subject) : m.rowActions} className="relative flex shrink-0 items-center gap-0.5" data-zone={zone}>
      {zone === "topbar" && (
        // Gabarit invisible : largeur d'un bouton-icône et du bouton à texte, pour le repli (D-221).
        <span ref={measure} aria-hidden inert className="pointer-events-none invisible absolute top-0 right-0 flex items-center">
          <IconButton icon={<MoreHorizontal />} label="" />
          {full.primary && (
            <Button variant="primary" isDisabled={Boolean(full.primary.isDisabled)} isPending={pending.has(full.primary.id)}>
              {full.primary.label}
            </Button>
          )}
        </span>
      )}
      {icons.map((a) => (
        <IconButton
          key={a.id}
          icon={a.icon}
          label={a.label}
          onPress={() => void run(a)}
          isPending={pending.has(a.id)}
          {...(a.shortcut ? { shortcut: a.shortcut } : {})}
          {...(a.isDisabled ? { isDisabled: true } : {})}
          {...reasonOf(a)}
        />
      ))}
      {menu.length + danger.length > 0 && (
        <DropdownMenu label={m.moreActions} placement="bottom end" trigger={<IconButton icon={<MoreHorizontal />} label={m.moreActions} isPending={menuPending} />}>
          {menu.map(item)}
          {menu.length > 0 && danger.length > 0 && <DropdownMenu.Separator />}
          {danger.map(item)}
        </DropdownMenu>
      )}
      {primary && (
        <span className={zone === "topbar" ? "ml-1.5 inline-flex" : "ml-2 inline-flex"}>
          <Button
            variant={zone === "section" ? "secondary" : "primary"}
            size={zone === "section" ? "sm" : "md"}
            isDisabled={Boolean(primary.isDisabled)}
            {...reasonOf(primary)}
            isPending={pending.has(primary.id)}
            onPress={() => void run(primary)}
          >
            {primary.label}
          </Button>
        </span>
      )}
    </div>
  );
}

/** `disabledReason` d'une action, à passer au contrôle qui la dessine. */
function reasonOf(a: Action): { disabledReason?: string } {
  return a.disabledReason ? { disabledReason: a.disabledReason } : {};
}

/** Écart entre deux boutons de la barre (gap-0.5) et avant le bouton à texte en `topbar` (ml-1.5). */
const GAP = 2;
const TEXT_GAP = 6;

/**
 * Repli selon la place (D-221) : seulement dans la barre du haut d'AppShell, qui marque le slot
 * `data-socle-fit`. La largeur disponible est celle du slot, moins ses autres enfants (la cloche…).
 * Le slot a une largeur qui ne dépend pas de son contenu : le calcul ne boucle pas.
 */
function useTopbarFit(
  enabled: boolean,
  group: RefObject<HTMLDivElement | null>,
  measure: RefObject<HTMLSpanElement | null>,
  full: ArrangedActions,
): ActionFit | undefined {
  const [fit, setFit] = useState<ActionFit | undefined>(undefined);
  const iconCount = full.icons.length;
  const restCount = full.menu.length + full.danger.length;
  const hasText = Boolean(full.primary);
  useLayoutEffect(() => {
    const el = group.current;
    const slot = el?.parentElement;
    if (!enabled || !el || !slot || !slot.hasAttribute("data-socle-fit")) {
      setFit(undefined);
      return;
    }
    const compute = () => {
      const parts = measure.current?.children;
      const iconW = (parts?.[0] as HTMLElement | undefined)?.offsetWidth ?? 0;
      const textW = hasText ? ((parts?.[1] as HTMLElement | undefined)?.offsetWidth ?? 0) : 0;
      if (!iconW) return;
      const style = getComputedStyle(slot);
      const slotGap = parseFloat(style.columnGap) || 0;
      let avail = slot.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
      for (const child of Array.from(slot.children)) if (child !== el) avail -= (child as HTMLElement).offsetWidth + slotGap;
      const need = (icons: number, text: boolean) => {
        const inMenu = restCount + (iconCount - icons) + (hasText && !text ? 1 : 0);
        const buttons = icons + (inMenu > 0 ? 1 : 0);
        return buttons * iconW + Math.max(0, buttons - 1) * GAP + (text ? textW + (buttons ? TEXT_GAP : 0) : 0);
      };
      // Largeur minimale du slot : ses autres enfants et « … », tout replié.
      const others = slot.clientWidth - avail;
      const folded = iconCount + restCount + (hasText ? 1 : 0) > 0 ? iconW : 0;
      slot.style.setProperty("--socle-fit-min", `${Math.ceil(others + folded)}px`);
      let icons = iconCount;
      let text = hasText;
      while (icons > 0 && need(icons, text) > avail) icons--;
      if (text && need(0, true) > avail) text = false;
      setFit((prev) => (prev && prev.icons === icons && prev.primary === text ? prev : { icons, primary: text }));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(slot);
    if (measure.current) ro.observe(measure.current);
    for (const child of Array.from(slot.children)) if (child !== el) ro.observe(child);
    return () => {
      ro.disconnect();
      slot.style.removeProperty("--socle-fit-min");
    };
  }, [enabled, group, measure, iconCount, restCount, hasText]);
  return enabled ? fit : undefined;
}
