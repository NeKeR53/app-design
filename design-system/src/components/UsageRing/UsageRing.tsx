/*
 * Jauge d'usage en anneau, qui ouvre le volet des limites. Spec : UsageRing.spec.md. Décision : D-378.
 * Moteur : Meter, Button, DialogTrigger, Popover et Dialog de React Aria.
 * Le volet reprend la forme de Popover (D-328, D-329), placé au-dessus, côté fin.
 */
import { useCallback, useId, useState, type ReactNode } from "react";
import { Button } from "react-aria-components/Button";
import { Dialog, DialogTrigger } from "react-aria-components/Dialog";
import { Link as RACLink } from "react-aria-components/Link";
import { Meter } from "react-aria-components/Meter";
import { Popover as AriaPopover } from "react-aria-components/Popover";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { Tooltip } from "../Tooltip/Tooltip";
import { USAGE_DANGER_AT, USAGE_STROKE, USAGE_WARN_AT, clampPercent, usageText, usageTone, type UsageTone } from "./usage";

/** Lien d'en-tête du volet : « Tout voir → ». */
export interface UsageRingAction {
  /** Texte du lien. Défaut : « Tout voir » (i18n) ; la flèche est ajoutée. */
  label?: string;
  /** Adresse de la page des limites. */
  href?: string;
  /** Action au clic, sans adresse ou en plus de la navigation. */
  onPress?: () => void;
}

export interface UsageRingProps {
  /** Part utilisée, en pour cent (0 à 100). */
  value: number;
  /** Ce qui est mesuré. Défaut : « Contexte utilisé » (i18n). */
  label?: string;
  /** Seuil d'alerte, en pour cent. Défaut : 80. */
  warnAt?: number;
  /** Seuil critique, en pour cent. Défaut : 95. */
  dangerAt?: number;
  /** Contenu du volet, le plus souvent des `UsageMeter`. Sans contenu, l'anneau est une simple jauge. */
  children?: ReactNode;
  /** Titre de l'en-tête du volet : « Limites d'usage ». */
  title?: string;
  /** Lien de l'en-tête du volet. */
  action?: UsageRingAction;
  /** Ouverture pilotée par l'app, avec `onOpenChange`. */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const R = 7;
const C = 2 * Math.PI * R;

/** Anneau de 16 px, trait de 2 px : rail `--line-strong`, valeur en accent ou en alerte. */
function Ring({ value, tone }: { value: number; tone: UsageTone }) {
  return (
    <svg data-usage-ring data-tone={tone} viewBox="0 0 16 16" width="16" height="16" aria-hidden className="block shrink-0 -rotate-90">
      <circle cx="8" cy="8" r={R} fill="none" strokeWidth="2" className="stroke-line-strong" />
      {value > 0 && (
        <circle
          data-usage-value
          cx="8"
          cy="8"
          r={R}
          fill="none"
          strokeWidth="2"
          strokeDasharray={`${(C * value) / 100} ${C}`}
          className={cx("transition-[stroke-dasharray] duration-(--dur-slow) ease-standard", USAGE_STROKE[tone])}
        />
      )}
    </svg>
  );
}

/** Bouton à texte, sans contour, comme les déclencheurs d'options du chat ; fond `--hover` au survol et à l'ouverture. */
const TRIGGER = cx(
  buttonReset,
  "inline-flex h-(--btn-h-sm) shrink-0 cursor-default items-center justify-center rounded-md px-1.5 text-fg-2",
  "transition-colors duration-[var(--dur-fast)] ease-standard",
  "data-hovered:bg-hover data-pressed:bg-selected aria-expanded:bg-hover",
  focusRing,
);

const ACTION =
  "cursor-pointer rounded-[2px] text-sm text-fg no-underline data-hovered:underline underline-offset-2 " + focusRing;

export function UsageRing({
  value,
  label,
  warnAt = USAGE_WARN_AT,
  dangerAt = USAGE_DANGER_AT,
  children,
  title,
  action,
  isOpen,
  onOpenChange,
}: UsageRingProps) {
  const m = useMessages();
  const id = useId();
  const [ownOpen, setOwnOpen] = useState(false);
  const open = isOpen ?? ownOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (isOpen === undefined) setOwnOpen(next);
      onOpenChange?.(next);
    },
    [isOpen, onOpenChange],
  );

  const bounded = clampPercent(value);
  const tone = usageTone(bounded, warnAt, dangerAt);
  const { valueText } = usageText(bounded, tone, m);
  const name = label ?? m.usageContext;
  const text = m.usageRingName(name, valueText);

  // Sans contenu : une jauge seule, sans bouton ni volet.
  if (children === undefined || children === null || children === false)
    return (
      <Meter aria-label={name} value={bounded} minValue={0} maxValue={100} valueLabel={valueText} className="inline-flex shrink-0">
        <Ring value={bounded} tone={tone} />
      </Meter>
    );

  const actionLabel = (
    <>
      {action?.label ?? m.usageSeeAll}
      <span aria-hidden> →</span>
    </>
  );

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      <Tooltip content={text} placement="top">
        {/* L'info-bulle répète le nom : pas de description, sinon le nom serait lu deux fois (comme IconButton). */}
        <Button aria-label={text} aria-describedby="" className={TRIGGER}>
          <Ring value={bounded} tone={tone} />
        </Button>
      </Tooltip>
      <AriaPopover
        placement="top end"
        offset={4}
        containerPadding={8}
        className="socle-box flex max-h-[calc(100vh-16px)] w-[440px] max-w-[calc(100vw-16px)] flex-col overflow-hidden rounded-lg border border-line bg-surface-raised font-sans text-md text-fg shadow-md outline-none"
      >
        <Dialog
          {...(title ? { "aria-labelledby": `${id}-title` } : { "aria-label": m.usagePanel })}
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-3 py-2.5 outline-none"
        >
          {(title || action) && (
            <header className="flex shrink-0 items-baseline gap-2">
              {title && (
                <h2 id={`${id}-title`} className="m-0 min-w-0 flex-1 truncate text-sm font-normal text-fg-2">
                  {title}
                </h2>
              )}
              {action &&
                (action.href !== undefined ? (
                  <RACLink href={action.href} {...(action.onPress ? { onPress: action.onPress } : {})} className={cx(ACTION, "ml-auto shrink-0")}>
                    {actionLabel}
                  </RACLink>
                ) : (
                  <Button {...(action.onPress ? { onPress: action.onPress } : {})} className={cx(buttonReset, ACTION, "ml-auto shrink-0")}>
                    {actionLabel}
                  </Button>
                ))}
            </header>
          )}
          <div className="flex flex-col gap-2.5">{children}</div>
        </Dialog>
      </AriaPopover>
    </DialogTrigger>
  );
}
