/*
 * Nettoyage d'un HTML reçu, par liste blanche (D-317). Repris de HtmlContent d'Alfred.
 * Le HTML est lu dans un document inerte (DOMParser : rien ne s'y exécute), puis recopié.
 */

const ALLOWED_TAGS = new Set(
  (
    "a abbr address article aside b bdi bdo big blockquote br caption center cite code col colgroup dd del details dfn div dl dt em " +
    "figcaption figure font footer h1 h2 h3 h4 h5 h6 header hr i img ins kbd li main mark nav ol p pre q s samp section small span " +
    "strike strong style sub summary sup table tbody td tfoot th thead time tr tt u ul var wbr"
  ).split(" "),
);

/** Balises retirées avec tout leur contenu. */
const DROPPED_WITH_CONTENT = new Set(
  (
    "script noscript template iframe frame frameset object embed applet portal form select textarea button input option " +
    "svg math audio video canvas head title meta link base"
  ).split(" "),
);

const ALLOWED_ATTRIBUTES = new Set(
  (
    "align alt bgcolor border cellpadding cellspacing class color colspan dir face height href id lang rowspan size span src " +
    "start style summary title type valign width"
  ).split(" "),
);

/** Lien ouvrable : web ou courriel ; tout le reste (`javascript:`, `data:`, `file:`…) est retiré (D-319). */
export function safeLink(value: string): string | null {
  const url = value.trim();
  return /^(https?:|mailto:)/i.test(url) ? url : null;
}

/** Style en ligne sans chargement ni expression. */
export function safeStyle(value: string): string {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(";")
    .filter((rule) => !/url\s*\(|image-set\s*\(|expression\s*\(|@import|behavior\s*:|-moz-binding|javascript:/i.test(rule))
    .join(";");
}

/** Feuille de style du contenu, bornée à la racine fantôme ; mêmes retraits, plus les règles `:host`. */
export function safeSheet(value: string): string {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@import[^;]*;?/gi, "")
    .replace(/url\s*\([^)]*\)/gi, "none")
    .replace(/image-set\s*\([^)]*\)/gi, "none")
    .replace(/expression\s*\([^)]*\)/gi, "")
    .replace(/behavior\s*:[^;}]*/gi, "")
    .replace(/-moz-binding\s*:[^;}]*/gi, "")
    .replace(/:host(-context)?\b/gi, ":not(*)");
}

export interface SanitizedImage {
  element: HTMLImageElement;
  /** Adresse d'origine. */
  source: string;
  /** Adresse distante (http, https) : bloquée tant que les images ne sont pas permises (D-318). */
  remote: boolean;
}

/** Recopie un HTML par liste blanche. Rend les nœuds à poser dans la racine fantôme et les images à résoudre. */
export function sanitizeHtml(html: string, options: { links: boolean }): { nodes: Node[]; images: SanitizedImage[] } {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const images: SanitizedImage[] = [];

  const copy = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent ?? "");
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    const source = node as Element;
    const tag = source.localName.toLowerCase();
    if (DROPPED_WITH_CONTENT.has(tag)) return null;
    const children = () => [...source.childNodes].map(copy).filter((child): child is Node => child !== null);
    if (!ALLOWED_TAGS.has(tag) || (tag === "a" && !options.links)) {
      // Balise inconnue (`<o:p>`, `<html>`, `<body>`…) ou lien sans `onLink` : son contenu reste, pas elle.
      const fragment = document.createDocumentFragment();
      for (const child of children()) fragment.appendChild(child);
      return fragment;
    }
    if (tag === "style") {
      const style = document.createElement("style");
      style.textContent = safeSheet(source.textContent ?? "");
      return style;
    }
    const element = document.createElement(tag);
    for (const { name, value } of [...source.attributes]) {
      const attribute = name.toLowerCase();
      if (!ALLOWED_ATTRIBUTES.has(attribute) || attribute === "src") continue;
      if (attribute === "href") {
        const link = tag === "a" ? safeLink(value) : null;
        if (link) {
          element.setAttribute("data-href", link);
          element.setAttribute("title", link.replace(/^mailto:/i, ""));
          element.setAttribute("tabindex", "0");
          element.setAttribute("role", "link");
        }
        continue;
      }
      if (attribute === "title" && tag === "a") continue;
      element.setAttribute(attribute, attribute === "style" ? safeStyle(value) : value);
    }
    if (tag === "img") {
      const image = element as HTMLImageElement;
      const original = source.getAttribute("src")?.trim() ?? "";
      if (/^data:image\/(png|gif|jpe?g|webp|bmp|avif);base64,/i.test(original)) image.src = original;
      else if (original) images.push({ element: image, source: original, remote: /^https?:/i.test(original) });
    }
    for (const child of children()) element.appendChild(child);
    return element;
  };

  const root = parsed.body ?? parsed.documentElement;
  // Les feuilles de style d'un courriel sont souvent dans <head> : elles viennent aussi, nettoyées.
  const sheets = [...parsed.querySelectorAll("head style")].map((style) => {
    const sheet = document.createElement("style");
    sheet.textContent = safeSheet(style.textContent ?? "");
    return sheet;
  });
  const nodes = [...sheets, ...[...root.childNodes].map(copy).filter((n): n is Node => n !== null)];
  return { nodes, images };
}
