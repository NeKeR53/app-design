/*
 * HTML reçu de l'extérieur (corps d'un courriel, page), nettoyé et isolé.
 * Spec : HtmlContent.spec.md (D-317 à D-319). Repris de HtmlContent d'Alfred.
 */
import { useEffect, useRef, useState } from "react";
import { cx } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { Button } from "../Button/Button";
import { sanitizeHtml } from "./sanitize";

export interface HtmlContentProps {
  /** HTML reçu ; le composant le nettoie. */
  html: string;
  /** Nom accessible de la zone : « Message de Paul ». */
  label: string;
  /** Lien cliqué (http, https, mailto). Sans lui, les liens sont du texte (D-319). */
  onLink?: (url: string) => void;
  /**
   * Adresse affichable d'une image : `cid:` (pièce jointe) ou distante (proxy de l'app).
   * Rendre `null` la laisse masquée. Une image distante n'est demandée que si les images sont permises (D-318).
   */
  resolveImage?: (source: string) => string | null | Promise<string | null>;
  /** Images distantes permises (contrôlé). */
  imagesAllowed?: boolean;
  /** Valeur de départ, non contrôlé. Défaut : `false`. */
  defaultImagesAllowed?: boolean;
  /** « Afficher les images » pressé. */
  onImagesAllowedChange?: (allowed: boolean) => void;
  /** `paper` (défaut) : fond blanc dans les deux modes ; `theme` : couleurs du thème (D-319). */
  surface?: "paper" | "theme";
}

/** Styles de la racine fantôme : seulement des tokens Socle, sans couleur de repli (D-315). */
const BASE_STYLE = `
:host { display: block; overflow-wrap: anywhere; contain: content; }
.socle-html { max-width: 100%; overflow-x: auto; }
img { max-width: 100%; height: auto; }
img[data-hidden-image] { display: inline-block; min-width: 16px; min-height: 16px; vertical-align: middle; background: color-mix(in srgb, currentColor 8%, transparent); }
a[data-href] { text-decoration: underline; cursor: pointer; }
:host([data-surface="paper"]) a[data-href] { color: var(--paper-link); }
:host([data-surface="theme"]) a[data-href] { color: var(--accent-text); }
a[data-href]:focus-visible { outline: var(--focus-w) solid var(--focus); outline-offset: var(--focus-offset); border-radius: var(--radius-sm); }
table { border-collapse: collapse; max-width: 100%; }
pre { white-space: pre-wrap; }
`;

export function HtmlContent({
  html,
  label,
  onLink,
  resolveImage,
  imagesAllowed,
  defaultImagesAllowed = false,
  onImagesAllowedChange,
  surface = "paper",
}: HtmlContentProps) {
  const m = useMessages();
  const host = useRef<HTMLDivElement>(null);
  const [ownAllowed, setOwnAllowed] = useState(defaultImagesAllowed);
  const allowed = imagesAllowed ?? ownAllowed;
  const [blocked, setBlocked] = useState(0);
  const onLinkRef = useRef(onLink);
  onLinkRef.current = onLink;
  const resolveRef = useRef(resolveImage);
  resolveRef.current = resolveImage;
  const links = onLink !== undefined;

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const shadow = element.shadowRoot ?? element.attachShadow({ mode: "open" });
    const { nodes, images } = sanitizeHtml(html, { links });
    const style = document.createElement("style");
    style.textContent = BASE_STYLE;
    const body = document.createElement("div");
    body.className = "socle-html";
    for (const node of nodes) body.appendChild(node);
    shadow.replaceChildren(style, body);

    let alive = true;
    let hiddenRemote = 0;
    for (const { element: image, source, remote } of images) {
      image.setAttribute("data-hidden-image", "");
      if (remote && !allowed) {
        hiddenRemote += 1;
        continue;
      }
      const resolve = resolveRef.current;
      const pending = resolve ? Promise.resolve(resolve(source)).catch(() => null) : Promise.resolve(remote ? source : null);
      void pending.then((resolved) => {
        if (!alive || !resolved || !/^(https?:|data:image\/|blob:)/i.test(resolved)) return;
        if (/^https?:/i.test(resolved) && !allowed) return;
        image.src = resolved;
        image.removeAttribute("data-hidden-image");
      });
    }
    setBlocked(hiddenRemote);

    const open = (event: Event) => {
      const link = (event.target as Element | null)?.closest?.("[data-href]");
      if (!link) return;
      if (event instanceof KeyboardEvent && event.key !== "Enter") return;
      event.preventDefault();
      const url = link.getAttribute("data-href");
      if (url) onLinkRef.current?.(url);
    };
    shadow.addEventListener("click", open);
    shadow.addEventListener("keydown", open);
    return () => {
      alive = false;
      shadow.removeEventListener("click", open);
      shadow.removeEventListener("keydown", open);
    };
  }, [html, allowed, links]);

  const allow = () => {
    if (imagesAllowed === undefined) setOwnAllowed(true);
    onImagesAllowedChange?.(true);
  };

  return (
    <div className="socle-box min-w-0 font-sans">
      {blocked > 0 && (
        <div role="status" className="mb-2 flex items-center gap-2.5 rounded-md border border-line py-1.5 pr-1.5 pl-2.5 text-sm text-fg-2">
          <span className="mr-auto">{m.imagesHidden(blocked)}</span>
          <Button size="sm" onPress={allow}>
            {m.showImages}
          </Button>
        </div>
      )}
      <div
        ref={host}
        role="document"
        aria-label={label}
        data-surface={surface}
        className={cx(surface === "paper" ? "rounded-md bg-paper p-4 text-paper-fg" : "text-fg")}
      />
    </div>
  );
}
