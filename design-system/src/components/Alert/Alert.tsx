/*
 * Encart de message dans le contenu. Spec : Alert.spec.md.
 * Validation : docs/validation/components/Nouveaux-P1-v1.html (A1 à A3, options A).
 * Décisions : D-151 (couleur sur l'icône seulement), D-159 (jamais de bandeau pleine largeur).
 */
import type { ReactNode } from "react";
import { useMessages } from "../../provider/SocleProvider";
import { cx } from "../../lib/cx";
import { X } from "../../icons";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { SrOnly, ToneIcon, toneLabel } from "../Toast/Toast";
import type { NotificationTone } from "../Toast/notifications";

export type AlertTone = NotificationTone;

export interface AlertAction {
  /** Verbe de l'action : « Commander », « Réessayer ». */
  label: string;
  onPress: () => void;
}

export interface AlertProps {
  /** Ton : seule l'icône prend sa couleur (D-151). Défaut : `info`. */
  tone?: AlertTone;
  /** Titre court, facultatif. */
  title?: string;
  /** Texte : une ou deux phrases ; un lien est permis. */
  children: ReactNode;
  /** Une seule action, en bouton secondaire `sm`, sous le texte. */
  action?: AlertAction;
  /** Croix de fermeture. Sans effet sur le ton `danger` : une erreur ne se ferme pas, on la corrige. */
  onDismiss?: () => void;
  /**
   * L'encart apparaît après une action : il est annoncé (`role="status"`, `role="alert"` pour `danger`).
   * Sans lui, c'est un simple bloc, présent au chargement (D-355).
   */
  announce?: boolean;
}

export function Alert({ tone = "info", title, children, action, onDismiss, announce = false }: AlertProps) {
  const m = useMessages();
  const dismissible = Boolean(onDismiss) && tone !== "danger";
  const role = announce ? (tone === "danger" ? "alert" : "status") : undefined;
  return (
    <div
      {...(role ? { role } : {})}
      data-tone={tone}
      className={cx(
        "socle-box grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2.5 rounded-md border border-line bg-surface py-2.5 pl-3 font-sans text-md text-fg",
        dismissible ? "pr-1.5" : "pr-3",
      )}
    >
      <ToneIcon tone={tone} />
      <div className="min-w-0 pt-px">
        {title ? (
          <p className="m-0 font-semibold break-words">
            <SrOnly>{`${toneLabel(m, tone)} : `}</SrOnly>
            {title}
          </p>
        ) : (
          <SrOnly>{`${toneLabel(m, tone)} : `}</SrOnly>
        )}
        <div className={cx("text-sm break-words", title ? "mt-px text-fg-2" : "text-fg")}>{children}</div>
        {action && (
          <div className="mt-2">
            <Button variant="secondary" size="sm" onPress={action.onPress}>
              {action.label}
            </Button>
          </div>
        )}
      </div>
      {dismissible ? <IconButton icon={<X size={14} />} label={m.closeAlert} tooltipPlacement="top" onPress={() => onDismiss?.()} /> : <span />}
    </div>
  );
}
