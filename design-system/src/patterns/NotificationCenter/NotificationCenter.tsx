/*
 * Centre de notifications : cloche de la barre du haut, compteur et panneau.
 * Spec : NotificationCenter.spec.md. Il lit la file passée à `SocleProvider`.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Dialog as AriaDialog, DialogTrigger, Heading } from "react-aria-components/Dialog";
import { GridList, GridListHeader, GridListItem, GridListSection } from "react-aria-components/GridList";
import { Modal } from "react-aria-components/Modal";
import { Popover } from "react-aria-components/Popover";
import { cx, focusRing } from "../../lib/cx";
import { useMessages, useNotifications } from "../../provider/SocleProvider";
import { Bell, ChevronLeft, X } from "../../icons";
import { Button } from "../../components/Button/Button";
import { IconButton } from "../../components/IconButton/IconButton";
import { SrOnly, ToneIcon, toneLabel } from "../../components/Toast/Toast";
import { groupByDay, type NotificationRecord, type Notifications } from "../../components/Toast/notifications";

const EMPTY: NotificationRecord[] = [];
const noop = () => () => {};

function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return match;
}

function useItems(n: Notifications | null): NotificationRecord[] {
  return useSyncExternalStore(n ? n.subscribe : noop, n ? n.getItems : () => EMPTY, n ? n.getItems : () => EMPTY);
}

/** Pastille du nombre de non-lus, « 9+ » au-delà de 9 (D-157). */
export function unreadBadge(n: number): string {
  return n > 9 ? "9+" : String(n);
}

const time = (at: number) => new Date(at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
const date = (at: number) => new Date(at).toLocaleDateString(undefined, { day: "numeric", month: "long" });

export function NotificationCenter() {
  const m = useMessages();
  const notifications = useNotifications();
  const items = useItems(notifications);
  const isMobile = useMedia("(max-width: 640px)");
  const [isOpen, setOpen] = useState(false);
  // Lignes non lues à l'ouverture : leur point reste jusqu'à la fermeture (D-157).
  const unreadAtOpen = useRef<Set<string>>(new Set());
  const unread = items.filter((i) => !i.read).length;

  const onOpenChange = (open: boolean) => {
    if (open && notifications) {
      unreadAtOpen.current = new Set(items.filter((i) => !i.read).map((i) => i.id));
      notifications.markAllRead();
    }
    if (!open) unreadAtOpen.current = new Set();
    setOpen(open);
  };

  const bell = (
    <IconButton
      label={unread ? m.notificationsUnread(unread) : m.notifications}
      icon={
        <span className="relative inline-grid">
          <Bell />
          {unread ? (
            <span
              aria-hidden="true"
              data-testid="notification-count"
              className="absolute -top-1.5 -right-2 h-[15px] min-w-[15px] rounded-full bg-accent px-1 text-center text-[10px] leading-[15px] font-semibold text-accent-fg shadow-[0_0_0_2px_var(--surface)]"
            >
              {unreadBadge(unread)}
            </span>
          ) : null}
        </span>
      }
    />
  );

  const panel = (
    <AriaDialog aria-label={m.notifications} className="flex max-h-[inherit] min-h-0 flex-col outline-none max-tablet:h-full">
      {({ close }) => (
        <>
          <div className="flex items-center gap-2 border-b border-line py-2 pr-2 pl-3.5 max-tablet:pl-2">
            {isMobile ? <IconButton icon={<ChevronLeft />} label={m.closeNotificationCenter} onPress={close} /> : null}
            <Heading slot="title" className="m-0 flex-1 text-md font-heading">
              {m.notifications}
            </Heading>
            {items.length ? (
              <Button variant="subtle" size="sm" onPress={() => notifications?.clear()}>
                {m.clearAll}
              </Button>
            ) : null}
          </div>
          <Rows
            items={items}
            unreadAtOpen={unreadAtOpen.current}
            onOpenItem={(item) => {
              item.onOpen?.();
              close();
            }}
            onRemove={(id) => notifications?.remove(id)}
          />
        </>
      )}
    </AriaDialog>
  );

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      {bell}
      {isMobile ? (
        <Modal className="fixed inset-0 z-50 flex flex-col bg-surface-raised font-sans text-md text-fg outline-none">{panel}</Modal>
      ) : (
        <Popover
          placement="bottom end"
          offset={4}
          containerPadding={8}
          className="flex w-[380px] max-w-[calc(100vw-16px)] flex-col overflow-hidden rounded-lg border border-line bg-surface-raised font-sans text-md text-fg shadow-md outline-none"
        >
          {panel}
        </Popover>
      )}
    </DialogTrigger>
  );
}

function Rows({
  items,
  unreadAtOpen,
  onOpenItem,
  onRemove,
}: {
  items: NotificationRecord[];
  unreadAtOpen: Set<string>;
  onOpenItem: (item: NotificationRecord) => void;
  onRemove: (id: string) => void;
}) {
  const m = useMessages();
  const groups = groupByDay(items, { today: m.today, yesterday: m.yesterday, date });
  const byId = new Map(items.map((i) => [i.id, i]));
  return (
    <GridList
      aria-label={m.notifications}
      autoFocus="first"
      onAction={(key) => {
        const item = byId.get(String(key));
        if (item?.onOpen) onOpenItem(item);
      }}
      className="min-h-0 flex-1 overflow-auto px-1 pt-1 pb-1.5 outline-none"
      renderEmptyState={() => (
        <div className="px-4 py-8 text-center text-fg-2">
          <span className="mb-1.5 inline-grid text-fg-3">
            <Bell size={24} />
          </span>
          <span className="block font-medium text-fg">{m.noNotifications}</span>
          <span className="text-sm">{m.noNotificationsHint}</span>
        </div>
      )}
    >
      {groups.map((g) => (
        <GridListSection key={g.id} id={g.id} aria-label={g.title}>
          <GridListHeader className="px-2.5 pt-2 pb-1 text-xs font-medium text-fg-3">{g.title}</GridListHeader>
          {g.items.map((item) => {
            const isUnread = unreadAtOpen.has(item.id);
            return (
              <GridListItem
                key={item.id}
                id={item.id}
                textValue={item.title}
                className={cx(
                  "group relative grid cursor-default grid-cols-[auto_minmax(0,1fr)_auto] gap-x-2.5 rounded-md py-2 pr-2 pl-2.5",
                  "data-hovered:bg-hover data-focused:bg-hover",
                  focusRing,
                )}
              >
                {isUnread ? <span aria-hidden="true" data-unread className="absolute top-[15px] left-0.5 size-1.5 rounded-full bg-highlight" /> : null}
                <ToneIcon tone={item.tone} />
                <div className="min-w-0">
                  <span className="block font-medium break-words">
                    <SrOnly>{`${toneLabel(m, item.tone)}${isUnread ? `, ${m.unreadNotification}` : ""} : `}</SrOnly>
                    {item.title}
                  </span>
                  {item.description ? <span className="block text-sm whitespace-pre-line text-fg-2 break-words">{item.description}</span> : null}
                  <span className="mt-0.5 block text-xs text-fg-3">
                    {time(item.at)}
                    {item.source ? ` · ${item.source}` : ""}
                  </span>
                </div>
                <span className="opacity-0 group-focus-within:opacity-100 group-data-focused:opacity-100 group-data-hovered:opacity-100 pointer-coarse:opacity-100">
                  <IconButton icon={<X size={14} />} label={m.removeNotification} tooltipPlacement="start" onPress={() => onRemove(item.id)} />
                </span>
              </GridListItem>
            );
          })}
        </GridListSection>
      ))}
    </GridList>
  );
}
