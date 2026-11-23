/**
 * File de notifications de Socle (Toast.spec.md, NotificationCenter.spec.md).
 * Une seule file par app, créée par `createNotifications()` et passée à `SocleProvider`.
 * Elle alimente les toasts (moteur React Aria, D-150) et le centre de notifications (D-156).
 * Elle s'utilise aussi hors de React : `notifications.notify({...})`.
 */
import { UNSTABLE_ToastQueue as ToastQueue } from "react-aria-components/Toast";

export type NotificationTone = "success" | "info" | "warning" | "danger";

export interface NotificationAction {
  /** Libellé court : « Annuler », « Réessayer ». */
  label: string;
  onAction: () => void;
}

export interface NotifyOptions {
  title: string;
  /** Texte sous le titre ; les retours à la ligne sont conservés. */
  description?: string;
  /** Ton (D-152). Défaut : `info`. */
  tone?: NotificationTone;
  /** Action unique du toast ; la choisir ferme le toast (D-155). Elle n'est pas reprise dans le centre (D-156). */
  action?: NotificationAction;
  /** Durée en ms, 5 000 au minimum ; `null` : jusqu'à fermeture. Défaut : 5 000, 8 000 avec action, `null` pour `danger` (D-153). */
  duration?: number | null;
  /** `false` : ligne du centre seule, sans toast (D-156). */
  toast?: boolean;
  /** `false` : toast seul, hors du centre (D-156). */
  history?: boolean;
  /** Origine, affichée dans le centre. */
  source?: string;
  /** Ouvre l'élément lié depuis le centre (D-156). */
  onOpen?: () => void;
}

/** Une ligne du centre de notifications. */
export interface NotificationRecord {
  id: string;
  title: string;
  description?: string;
  tone: NotificationTone;
  source?: string;
  /** Date de la notification, en ms depuis l'époque Unix. */
  at: number;
  read: boolean;
  onOpen?: () => void;
}

/** Contenu d'un toast dans la file React Aria. */
export interface ToastContent {
  id: string;
  title: string;
  description?: string;
  tone: NotificationTone;
  action?: NotificationAction;
}

export interface NotificationsOptions {
  /** Notifications restaurées au démarrage (D-158). */
  initial?: NotificationRecord[];
  /** Appelé à chaque changement de la liste du centre, pour la persister (D-158). */
  onChange?: (items: NotificationRecord[]) => void;
}

export interface Notifications {
  /** Montre un toast et ajoute une ligne au centre ; renvoie l'identifiant. */
  notify(options: NotifyOptions): string;
  /** Ferme le toast, s'il est affiché. La ligne du centre reste. */
  dismiss(id: string): void;
  /** Retire une ligne du centre. */
  remove(id: string): void;
  /** Vide le centre. */
  clear(): void;
  /** Marque toutes les lignes comme lues. */
  markAllRead(): void;
  /** Lignes du centre, la plus récente en premier. */
  getItems(): NotificationRecord[];
  /** Suit les changements du centre ; renvoie la fonction de désabonnement. */
  subscribe(listener: () => void): () => void;
  /** @internal File React Aria des toasts. */
  readonly toastQueue: ToastQueue<ToastContent>;
}

/** Toasts visibles en même temps (D-154). */
export const MAX_VISIBLE_TOASTS = 3;
/** Lignes gardées dans le centre (D-158). */
export const MAX_HISTORY = 100;
/** Durée minimale d'un toast (D-153). */
export const MIN_DURATION = 5_000;

/** Durée d'un toast selon D-153 ; `null` : jusqu'à fermeture. */
export function toastDuration(tone: NotificationTone, hasAction: boolean, duration?: number | null): number | null {
  if (duration === null) return null;
  if (duration !== undefined) return Math.max(MIN_DURATION, duration);
  if (tone === "danger") return null;
  return hasAction ? 8_000 : MIN_DURATION;
}

let counter = 0;

export function createNotifications(options: NotificationsOptions = {}): Notifications {
  const toastQueue = new ToastQueue<ToastContent>({ maxVisibleToasts: MAX_VISIBLE_TOASTS });
  let items: NotificationRecord[] = (options.initial ?? []).slice(0, MAX_HISTORY);
  const listeners = new Set<() => void>();
  /** Toasts ouverts, du plus ancien au plus récent : identifiant → clé React Aria. */
  const open = new Map<string, string>();

  const setItems = (next: NotificationRecord[]) => {
    items = next;
    options.onChange?.(items);
    for (const l of listeners) l();
  };

  return {
    toastQueue,
    notify(o) {
      const id = `n${Date.now().toString(36)}-${(counter++).toString(36)}`;
      const tone = o.tone ?? "info";
      if (o.history !== false) {
        const record: NotificationRecord = { id, title: o.title, tone, at: Date.now(), read: false };
        if (o.description !== undefined) record.description = o.description;
        if (o.source !== undefined) record.source = o.source;
        if (o.onOpen) record.onOpen = o.onOpen;
        setItems([record, ...items].slice(0, MAX_HISTORY));
      }
      if (o.toast !== false) {
        const content: ToastContent = { id, title: o.title, tone };
        if (o.description !== undefined) content.description = o.description;
        if (o.action) content.action = o.action;
        const timeout = toastDuration(tone, Boolean(o.action), o.duration);
        const key = toastQueue.add(content, {
          ...(timeout === null ? {} : { timeout }),
          onClose: () => open.delete(id),
        });
        open.set(id, key);
        // Pile limitée : au-delà de trois, le plus ancien se ferme (D-154).
        while (open.size > MAX_VISIBLE_TOASTS) {
          const [oldest, oldestKey] = open.entries().next().value as [string, string];
          open.delete(oldest);
          toastQueue.close(oldestKey);
        }
      }
      return id;
    },
    dismiss(id) {
      const key = open.get(id);
      if (key) toastQueue.close(key);
    },
    remove(id) {
      setItems(items.filter((i) => i.id !== id));
    },
    clear() {
      setItems([]);
    },
    markAllRead() {
      if (items.some((i) => !i.read)) setItems(items.map((i) => (i.read ? i : { ...i, read: true })));
    },
    getItems: () => items,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Groupe les lignes par jour : « Aujourd'hui », « Hier », puis la date (D-158). */
export function groupByDay(
  list: NotificationRecord[],
  labels: { today: string; yesterday: string; date: (at: number) => string },
  now: number = Date.now(),
): { id: string; title: string; items: NotificationRecord[] }[] {
  const startOfDay = (t: number) => {
    const d = new Date(t);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };
  const today = startOfDay(now);
  const groups: { id: string; title: string; items: NotificationRecord[] }[] = [];
  for (const item of list) {
    const day = startOfDay(item.at);
    const diff = Math.round((today - day) / 86_400_000);
    const title = diff <= 0 ? labels.today : diff === 1 ? labels.yesterday : labels.date(item.at);
    const id = `d${day}`;
    const last = groups[groups.length - 1];
    if (last && last.id === id) last.items.push(item);
    else groups.push({ id, title, items: [item] });
  }
  return groups;
}
