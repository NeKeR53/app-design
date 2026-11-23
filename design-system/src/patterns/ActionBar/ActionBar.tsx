/*
 * Modèle Action et ActionBar. Spec : ActionBar.spec.md (D-110 à D-118).
 * L'app décrit ses actions par des données ; la zone décide de leur forme.
 */
import { useRef, useState, type ReactNode } from "react";
import { Button } from "../../components/Button/Button";
import { IconButton } from "../../components/IconButton/IconButton";
import { Menu } from "../../components/Menu/Menu";
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
  /** L'action n'existe pas dans cet état : elle n'est pas rendue. */
  isHidden?: boolean;
}

/** Zone où se trouve la barre ; elle fixe la règle (D-111). */
export type ActionZone = "topbar" | "header" | "toolbar" | "section" | "row" | "empty";

export interface ArrangedActions {
  /** Action principale à texte (absente en `topbar` et en `row`). */
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

/** La règle seule, sans rendu (D-111 à D-114, D-117). */
export function arrangeActions(actions: ReadonlyArray<Action>, zone: ActionZone, options: { narrow?: boolean } = {}): ArrangedActions {
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
    // D-112 : l'action principale reste une icône, en premier ; sans icône, en tête de « … ».
    primary = undefined;
    if (main && !main.icon) lead = [main];
    const max = options.narrow ? 0 : maxIcons.topbar;
    const rest = safe.filter((a) => a.icon).slice(0, main?.icon ? Math.max(0, max - 1) : max);
    icons = main?.icon ? [main, ...rest] : rest;
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

function confirmRequest(action: Action, question: (label: string) => string): ConfirmRequest | null {
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
    if (action.isDisabled || running.current.has(action.id)) return;
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
  const { primary, icons, menu, danger } = arrangeActions(actions, zone, { narrow });

  if (zone === "empty") {
    return primary ? (
      <Button variant="primary" isDisabled={Boolean(primary.isDisabled)} isPending={pending.has(primary.id)} onPress={() => void run(primary)}>
        {primary.label}
      </Button>
    ) : null;
  }
  if (!primary && icons.length + menu.length + danger.length === 0) return null;

  const item = (a: Action) => (
    <Menu.Item
      key={a.id}
      id={a.id}
      label={a.label}
      onAction={() => void run(a)}
      {...(a.icon ? { icon: a.icon } : {})}
      {...(a.shortcut ? { shortcut: a.shortcut } : {})}
      {...(a.danger ? { danger: true } : {})}
      {...(a.isDisabled || pending.has(a.id) ? { isDisabled: true } : {})}
    />
  );

  return (
    <div role="group" aria-label={subject ? m.actionsOn(subject) : m.rowActions} className="flex shrink-0 items-center gap-0.5" data-zone={zone}>
      {icons.map((a) => (
        <IconButton
          key={a.id}
          icon={a.icon}
          label={a.label}
          onPress={() => void run(a)}
          isPending={pending.has(a.id)}
          {...(a.shortcut ? { shortcut: a.shortcut } : {})}
          {...(a.isDisabled ? { isDisabled: true } : {})}
        />
      ))}
      {menu.length + danger.length > 0 && (
        <Menu label={m.moreActions} placement="bottom end" trigger={<IconButton icon={<MoreHorizontal />} label={m.moreActions} />}>
          {menu.map(item)}
          {menu.length > 0 && danger.length > 0 && <Menu.Separator />}
          {danger.map(item)}
        </Menu>
      )}
      {primary && (
        <span className="ml-2 inline-flex">
          <Button
            variant={zone === "section" ? "secondary" : "primary"}
            size={zone === "section" ? "sm" : "md"}
            isDisabled={Boolean(primary.isDisabled)}
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
