/*
 * Lien texte. Spec : Link.spec.md. Décision : D-167.
 */
import type { ReactNode } from "react";
import { Link as RACLink } from "react-aria-components/Link";
import { Button } from "react-aria-components/Button";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { ExternalArrow } from "../../icons";
import { useMessages } from "../../provider/SocleProvider";

export interface LinkProps {
  children: ReactNode;
  /** Adresse. Sans `href`, le lien est un bouton à l'apparence de lien (`onPress` obligatoire). */
  href?: string;
  /** Action au clic. Avec `href`, appelée en plus de la navigation. */
  onPress?: () => void;
  /** Force l'ouverture hors de l'app. Défaut : vrai pour `http:` et `https:`. Sans effet pour `mailto:` et `tel:`. */
  external?: boolean;
}

const isExternalHref = (href: string) => /^https?:/i.test(href);
/** `mailto:` et `tel:` ouvrent la messagerie ou le téléphone : ni nouvel onglet, ni « navigateur ». */
const isAppHref = (href: string) => /^(mailto:|tel:)/i.test(href);

const LINK =
  "cursor-pointer rounded-[2px] text-accent-text underline decoration-1 underline-offset-2 data-hovered:decoration-2 " + focusRing;

/** Lien souligné en `--accent-text` (D-167). Externe : flèche et texte caché « S'ouvre dans le navigateur ». */
export function Link({ children, href, onPress, external }: LinkProps) {
  const m = useMessages();
  if (href === undefined)
    return (
      <Button {...(onPress ? { onPress } : {})} className={cx(buttonReset, "inline", LINK)}>
        {children}
      </Button>
    );
  const ext = !isAppHref(href) && (external ?? isExternalHref(href));
  return (
    <RACLink href={href} {...(onPress ? { onPress } : {})} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={LINK}>
      {children}
      {ext && (
        <>
          <ExternalArrow size={12} className="ml-0.5 inline shrink-0 align-[-1px]" />
          <span className="sr-only"> ({m.opensInBrowser})</span>
        </>
      )}
    </RACLink>
  );
}
