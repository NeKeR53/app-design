/*
 * Région des toasts, sur le Toast de React Aria (D-150). Spec : Toast.spec.md.
 * Rendue une seule fois par `SocleProvider` quand il reçoit `notifications`.
 */
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import {
  UNSTABLE_Toast as RACToast,
  UNSTABLE_ToastContent as RACToastContent,
  UNSTABLE_ToastRegion as RACToastRegion,
  Text,
} from "react-aria-components/Toast";
import { cx, focusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import type { SocleMessages } from "../../i18n/messages";
import { CircleAlert, CircleCheck, CircleInfo, AlertTriangle, X } from "../../icons";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import type { Notifications, NotificationTone } from "./notifications";

/** Icône et couleur de chaque ton (D-151, D-152). */
export function ToneIcon({ tone }: { tone: NotificationTone }) {
  const color = { success: "text-success", info: "text-info", warning: "text-warning", danger: "text-danger" }[tone];
  const Icon = { success: CircleCheck, info: CircleInfo, warning: AlertTriangle, danger: CircleAlert }[tone];
  return (
    <span className={cx("mt-0.5 inline-grid", color)}>
      <Icon />
    </span>
  );
}

/** Nom du ton, lu avant le titre (D-152). */
export function toneLabel(m: SocleMessages, tone: NotificationTone): string {
  return { success: m.toneSuccess, info: m.toneInfo, warning: m.toneWarning, danger: m.toneDanger }[tone];
}

/** Masqué à l'écran, lu par le lecteur d'écran. */
export function SrOnly({ children }: { children: ReactNode }) {
  return <span className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap [clip:rect(0,0,0,0)]">{children}</span>;
}

/** Carte : surface des menus, trait fin, rayon 12 px, ombre (D-151). */
const toastClass = cx(
  "socle-toast-in pointer-events-auto grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2.5 rounded-lg border border-line bg-surface-raised py-2.5 pr-1.5 pl-3 font-sans text-md text-fg shadow-lg",
  focusRing,
);

export function ToastRegion({ notifications }: { notifications: Notifications }) {
  const m = useMessages();
  const queue = notifications.toastQueue;
  const root = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);

  // La minuterie s'arrête quand la fenêtre perd le focus (D-153).
  // Au retour, elle ne repart pas si la souris ou le focus sont sur un toast :
  // React Aria la relancera quand ils le quitteront.
  useEffect(() => {
    const pause = () => queue.pauseAll();
    const resume = () => {
      const el = root.current;
      if (hovered.current || el?.contains(document.activeElement)) return;
      queue.resumeAll();
    };
    window.addEventListener("blur", pause);
    window.addEventListener("focus", resume);
    return () => {
      window.removeEventListener("blur", pause);
      window.removeEventListener("focus", resume);
    };
  }, [queue]);

  // Échap ferme le toast qui a le focus, même depuis son action ou sa croix
  // (les événements clavier remontent jusqu'ici). Sur la croix, un premier Échap
  // ferme d'abord son info-bulle (React Aria).
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Escape") return;
    const card = (e.target as HTMLElement).closest<HTMLElement>('[role="alertdialog"][data-key]');
    if (card?.dataset.key) {
      e.preventDefault();
      queue.close(card.dataset.key);
    }
  };

  return (
    <div
      ref={root}
      className="contents"
      onKeyDown={onKeyDown}
      onPointerOver={() => (hovered.current = true)}
      onPointerOut={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node | null)) hovered.current = false;
      }}
    >
    <RACToastRegion
      queue={queue}
      aria-label={m.notifications}
      // Le plus récent en bas (D-154) : la file met le plus récent en premier.
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[360px] flex-col-reverse gap-2 outline-none max-tablet:right-2 max-tablet:bottom-18 max-tablet:left-2 max-tablet:w-auto"
    >
      {({ toast }) => {
        const c = toast.content;
        return (
          <RACToast
            toast={toast}
            className={toastClass}
            data-tone={c.tone}
            data-key={toast.key}
          >
            <ToneIcon tone={c.tone} />
            <RACToastContent className="min-w-0 pt-px">
              <Text slot="title" className="block font-semibold break-words">
                <SrOnly>{`${toneLabel(m, c.tone)} : `}</SrOnly>
                {c.title}
              </Text>
              {c.description ? (
                <Text slot="description" className="mt-px block text-sm whitespace-pre-line text-fg-2 break-words">
                  {c.description}
                </Text>
              ) : null}
            </RACToastContent>
            <div className="flex items-center gap-0.5">
              {c.action ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    c.action?.onAction();
                    queue.close(toast.key);
                  }}
                >
                  {c.action.label}
                </Button>
              ) : null}
              <IconButton icon={<X size={14} />} label={m.closeNotification} tooltipPlacement="top" onPress={() => queue.close(toast.key)} />
            </div>
          </RACToast>
        );
      }}
    </RACToastRegion>
    </div>
  );
}
