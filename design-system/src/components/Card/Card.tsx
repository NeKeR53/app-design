/*
 * Carte : conteneur neutre, variante chiffre clé, carte cliquable. Spec : Card.spec.md.
 * Validation : docs/validation/components/Nouveaux-P2-P3-v1.html (C1 et C2, options A).
 */
import type { ReactNode } from "react";
import { Button as RACButton } from "react-aria-components/Button";
import { Link as RACLink } from "react-aria-components/Link";
import { buttonReset, cx } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { ArrowDown, ArrowUp, Minus } from "../../icons";
import { ActionBar, type Action } from "../../patterns/ActionBar/ActionBar";

export type CardHeadingLevel = 2 | 3 | 4 | 5 | 6;
export type CardDeltaTone = "positive" | "negative" | "neutral";

/** Évolution d'un chiffre clé : texte et ton, jamais la couleur seule (icône et texte). */
export interface CardDelta {
  /** Texte complet : « +12 % sur 30 jours ». */
  text: string;
  /** Lecture de l'évolution : favorable, défavorable ou neutre. Défaut : `neutral`. */
  tone?: CardDeltaTone;
  /** Sens de la flèche. Défaut : selon le ton (favorable : haut, défavorable : bas, neutre : trait). */
  trend?: "up" | "down" | "flat";
}

interface CardCommonProps {
  /** Niveau du titre (`h2` à `h6`). Défaut : 3. */
  headingLevel?: CardHeadingLevel;
  /** Carte lien : toute la carte mène à cette adresse. Le nom du lien est le titre (ou le libellé). */
  href?: string;
  /** Carte bouton : toute la carte lance cette action. Avec `href`, appelée en plus de la navigation. */
  onPress?: () => void;
  /**
   * Actions de la carte. Carte simple : pied d'actions (zone `section`). Carte cliquable :
   * toutes dans « … », placé hors du lien.
   */
  actions?: ReadonlyArray<Action>;
}

export interface CardDefaultProps extends CardCommonProps {
  variant?: "default";
  /** Titre. Obligatoire pour une carte cliquable : c'est le nom de la cible. */
  title?: string;
  /** Contenu libre. */
  children?: ReactNode;
}

export interface CardMetricProps extends CardCommonProps {
  variant: "metric";
  /** Ce qui est compté : « Commandes ». Titre de la carte. */
  label: string;
  /** La valeur, déjà formatée (`FormattedValue` ou texte) ; chiffres à chasse fixe. */
  value: ReactNode;
  /** Évolution facultative. */
  delta?: CardDelta;
}

export type CardProps = CardDefaultProps | CardMetricProps;

const TONE: Record<CardDeltaTone, string> = {
  positive: "text-success",
  negative: "text-danger",
  neutral: "text-fg-3",
};
const TREND_OF_TONE = { positive: "up", negative: "down", neutral: "flat" } as const;
const TREND_ICON = { up: ArrowUp, down: ArrowDown, flat: Minus } as const;

/**
 * Surface, trait fin, rayon 12 px, sans ombre (D-001, D-040). Cliquable : survol `--hover`, anneau `--focus` autour de la carte.
 * Le fondu ne vaut que pendant le survol (D-424) : au repos, un changement de thème passe le fond d'un coup, en même
 * temps que les textes ; un fond en fondu sous des textes déjà changés passait sous le contraste minimal.
 */
const ROOT = cx(
  "socle-box relative flex min-w-0 flex-col gap-2 rounded-lg border border-line bg-surface p-(--pad) font-sans text-md text-fg",
  "has-[[data-card-target][data-hovered]]:transition-colors has-[[data-card-target][data-hovered]]:duration-[var(--dur-fast)] has-[[data-card-target][data-hovered]]:ease-standard",
  "has-[[data-card-target][data-hovered]]:bg-hover",
  "has-[[data-card-target][data-pressed]]:bg-selected",
  "has-[[data-card-target][data-focus-visible]]:outline-2 has-[[data-card-target][data-focus-visible]]:outline-solid has-[[data-card-target][data-focus-visible]]:outline-focus has-[[data-card-target][data-focus-visible]]:outline-offset-1",
);

/** La cible couvre toute la carte par un pseudo-élément ; le texte garde l'aspect d'un titre. */
const TARGET = cx(
  buttonReset,
  "cursor-pointer text-left text-inherit no-underline outline-none",
  "after:absolute after:inset-0 after:rounded-lg after:content-['']",
);

/** Action sans icône ni rôle principal : en zone `row`, elle va dans « … ». */
function menuOnly(action: Action): Action {
  const copy = { ...action };
  delete copy.icon;
  delete copy.primary;
  return copy;
}

function Delta({ delta }: { delta: CardDelta }) {
  const m = useMessages();
  const tone = delta.tone ?? "neutral";
  const Icon = TREND_ICON[delta.trend ?? TREND_OF_TONE[tone]];
  return (
    <span data-tone={tone} className={cx("inline-flex items-center gap-1 text-sm", TONE[tone])}>
      <Icon size={14} />
      <span>{delta.text}</span>
      {tone !== "neutral" && <span className="sr-only"> ({m.cardDeltaTone(tone)})</span>}
    </span>
  );
}

export function Card(props: CardProps) {
  const { headingLevel = 3, href, onPress, actions } = props;
  const metric = props.variant === "metric";
  const name = metric ? props.label : props.title;
  const clickable = Boolean(href || onPress) && Boolean(name);
  const Heading = `h${headingLevel}` as const;

  const target = !clickable ? (
    name
  ) : href ? (
    <RACLink href={href} {...(onPress ? { onPress } : {})} data-card-target="" className={TARGET}>
      {name}
    </RACLink>
  ) : (
    <RACButton {...(onPress ? { onPress } : {})} data-card-target="" className={TARGET}>
      {name}
    </RACButton>
  );

  const heading = name ? (
    <Heading className={cx("m-0 min-w-0 leading-snug", metric ? "text-sm font-normal text-fg-3" : "text-md font-heading text-fg")}>{target}</Heading>
  ) : null;

  // Carte cliquable : les actions passent toutes dans « … », hors du lien (icônes retirées : zone `row`, aucune icône visible).
  const menu =
    clickable && actions && actions.length > 0 ? (
      <div className="relative z-10 -my-1 -mr-1 shrink-0">
        <ActionBar zone="row" actions={actions.map(menuOnly)} {...(name ? { subject: name } : {})} />
      </div>
    ) : null;

  return (
    <div className={ROOT} {...(clickable ? { "data-clickable": "" } : {})}>
      {(heading || menu) && (
        <div className="flex min-w-0 items-start justify-between gap-2">
          {heading}
          {menu}
        </div>
      )}
      {metric ? (
        <>
          <div className="text-2xl leading-tight font-semibold text-fg tabular-nums">{props.value}</div>
          {props.delta && <Delta delta={props.delta} />}
        </>
      ) : (
        props.children !== undefined && <div className="min-w-0">{props.children}</div>
      )}
      {!clickable && actions && actions.length > 0 && (
        <div className="mt-1 flex justify-end">
          <ActionBar zone="section" actions={actions} {...(name ? { subject: name } : {})} />
        </div>
      )}
    </div>
  );
}
