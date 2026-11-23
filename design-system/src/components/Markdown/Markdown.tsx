/*
 * Rendu de Markdown (GFM) en lecture. Spec : Markdown.spec.md. Décisions : D-300 à D-304.
 * Exporté par la sous-entrée `socle-ui/markdown` (D-300) : react-markdown et remark-gfm sont
 * des dépendances facultatives, installées par l'app qui s'en sert.
 */
import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Code } from "../Code/Code";
import { Separator } from "../Separator/Separator";
import { IconButton } from "../IconButton/IconButton";
import { Link } from "../Link/Link";
import { Check, Copy } from "../../icons";
import { cx, focusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";

export type MarkdownHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface MarkdownProps {
  /** Texte Markdown (GFM). */
  children: string;
  /** Niveau HTML de `#` ; `##` vaut le niveau suivant, jusqu'à 6 (D-302). Défaut : 2. */
  headingLevel?: MarkdownHeadingLevel;
  /** Reçoit l'adresse de chaque lien ; la navigation du navigateur est alors annulée (D-303). */
  onLinkPress?: (href: string) => void;
  /** Affiche une image. Sans lui, une image devient un lien vers son adresse (D-303). */
  renderImage?: (src: string, alt: string) => ReactNode;
  /** Rendu propre d'un bloc de code d'un langage (un schéma) ; `undefined` garde le bloc (D-304). */
  renderCode?: (language: string, text: string) => ReactNode | undefined;
}

/** Extensions de lecture : GFM seulement (D-309). */
const plugins = [remarkGfm];

/** Durée du retour « Bloc copié » (D-304). */
const COPY_FEEDBACK_MS = 2000;

/** Nœud hast minimal : react-markdown passe `node` à chaque composant. */
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const textOf = (node: HastNode | undefined): string =>
  !node ? "" : node.type === "text" ? (node.value ?? "") : (node.children ?? []).map(textOf).join("");

/** Bloc de code avec « Copier le bloc » (D-304). */
function CodeBlock({ text }: { text: string }) {
  const m = useMessages();
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const label = state === "copied" ? m.blockCopied : state === "failed" ? m.copyFailed : m.copyBlock;
  return (
    <div className="group/code relative mb-3">
      <Code block>{text}</Code>
      <span
        className={cx(
          "absolute top-1 right-1 rounded-md bg-field transition-opacity duration-[var(--dur-fast)]",
          state === "idle" && "opacity-0 group-hover/code:opacity-100 group-focus-within/code:opacity-100 [@media(hover:none)]:opacity-100",
        )}
      >
        <IconButton
          icon={state === "copied" ? <Check /> : <Copy />}
          label={label}
          onPress={() => {
            clearTimeout(timer.current);
            navigator.clipboard.writeText(text).then(
              () => setState("copied"),
              () => setState("failed"),
            );
            timer.current = setTimeout(() => setState("idle"), COPY_FEEDBACK_MS);
          }}
        />
      </span>
    </div>
  );
}

/** Tailles des titres (D-301) : elles ne dépendent que du nombre de `#`. */
const headingSize = ["text-[1.25em]", "text-[1.125em]", "text-[1em]", "text-[1em]", "text-[1em]", "text-[1em]"];

const alignClass = (align: unknown) => (align === "right" ? "text-end" : align === "center" ? "text-center" : "text-start");

/** Texte Markdown avec la typographie de Socle (D-301). Le HTML écrit dans le texte est ignoré (D-303). */
export const Markdown = memo(function Markdown({ children, headingLevel = 2, onLinkPress, renderImage, renderCode }: MarkdownProps) {
  const m = useMessages();
  const components = useMemo<Components>(() => {
    const heading = (depth: number) =>
      function Heading({ children: content }: { children?: ReactNode }) {
        const Tag = `h${Math.min(6, headingLevel + depth - 1)}` as "h2";
        return <Tag className={cx("mt-5 mb-2 font-semibold leading-[1.35] text-fg", headingSize[depth - 1])}>{content}</Tag>;
      };
    // Avec `onLinkPress`, le clic est intercepté plus haut, sur la racine (D-303).
    const link = (href: string, label: ReactNode) => <Link href={href}>{label}</Link>;
    return {
      h1: heading(1),
      h2: heading(2),
      h3: heading(3),
      h4: heading(4),
      h5: heading(5),
      h6: heading(6),
      p: ({ children: content }) => <p className="m-0 mb-3">{content}</p>,
      strong: ({ children: content }) => <strong className="font-semibold">{content}</strong>,
      a: ({ href, children: content }) => (href ? link(href, content) : <>{content}</>),
      code: ({ children: content }) => <Code>{content}</Code>,
      pre: ({ node }) => {
        const code = (node as HastNode | undefined)?.children?.find((c) => c.tagName === "code");
        const className = code?.properties?.className;
        const language = (Array.isArray(className) ? className : [className]).map(String).find((c) => c.startsWith("language-"))?.slice(9) ?? "";
        // Le rendu Markdown ajoute un retour final au contenu du bloc.
        const text = textOf(code).replace(/\n$/, "");
        const custom = language ? renderCode?.(language, text) : undefined;
        return custom !== undefined ? <div className="mb-3">{custom}</div> : <CodeBlock text={text} />;
      },
      blockquote: ({ children: content }) => (
        <blockquote className="m-0 mb-3 border-l-[3px] border-line-strong pl-3 text-fg-2 [&>:last-child]:mb-0">{content}</blockquote>
      ),
      hr: () => <Separator />,
      ul: ({ children: content, className }) => (
        <ul className={cx("m-0 mb-3 [li>&]:mb-0 [li>&]:mt-0.5", String(className ?? "").includes("contains-task-list") ? "list-none pl-0" : "list-disc pl-6")}>{content}</ul>
      ),
      ol: ({ children: content, start }) => (
        <ol start={start} className="m-0 mb-3 list-decimal pl-6 [li>&]:mt-0.5 [li>&]:mb-0">
          {content}
        </ol>
      ),
      li: ({ children: content, className, node }) => {
        const task = String(className ?? "").includes("task-list-item");
        const input = task ? (node as HastNode | undefined)?.children?.find((c) => c.tagName === "input") : undefined;
        const done = Boolean(input?.properties?.checked);
        return (
          <li className={cx("my-0.5 [&>p]:mb-1", task && "relative list-none pl-[22px]", done && "text-fg-2")}>{content}</li>
        );
      },
      input: ({ checked, type }) =>
        type === "checkbox" ? (
          // Case statique (D-304) : le texte ne change pas d'un clic.
          <span
            role="img"
            aria-label={checked ? m.taskDone : m.taskTodo}
            className={cx(
              "absolute top-[0.3em] left-0 grid size-3.5 place-items-center rounded-sm border",
              checked ? "border-fg bg-fg text-surface" : "border-line-strong bg-surface",
            )}
          >
            {checked && <Check size={11} style={{ strokeWidth: 2.4 }} />}
          </span>
        ) : null,
      table: ({ children: content }) => (
        <div role="region" aria-label={m.table} tabIndex={0} className={cx("mb-3 max-w-full overflow-auto rounded-sm", focusRing)}>
          <table className="min-w-full border-separate border-spacing-0">{content}</table>
        </div>
      ),
      th: ({ children: content, style }) => (
        <th className={cx("border-b border-line px-2.5 py-1.5 align-bottom text-sm font-medium whitespace-nowrap text-fg-2", alignClass(style?.textAlign))}>{content}</th>
      ),
      td: ({ children: content, style }) => (
        <td className={cx("border-b border-line px-2.5 py-1.5 align-top", alignClass(style?.textAlign))}>{content}</td>
      ),
      img: ({ src, alt }) => {
        const address = typeof src === "string" ? src : "";
        const text = alt || m.image;
        // Une image ne se charge jamais d'elle-même (D-303).
        if (address && renderImage) return <>{renderImage(address, alt ?? "")}</>;
        return address ? link(address, text) : <>{text}</>;
      },
    };
  }, [headingLevel, renderImage, renderCode, m]);

  // Un lien ne navigue pas quand l'app le reçoit (D-303) : clic, Entrée, clic du milieu compris.
  const root = useRef<HTMLDivElement>(null);
  const press = useRef(onLinkPress);
  press.current = onLinkPress;
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const intercept = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a || !press.current || !el.contains(a)) return;
      e.preventDefault();
      if (e.type === "click") press.current(a.getAttribute("href") ?? "");
    };
    el.addEventListener("click", intercept);
    el.addEventListener("auxclick", intercept);
    return () => {
      el.removeEventListener("click", intercept);
      el.removeEventListener("auxclick", intercept);
    };
  }, []);

  return (
    <div ref={root} className="socle-box min-w-0 font-sans text-md leading-[1.6] [overflow-wrap:anywhere] text-fg [&>:first-child]:mt-0 [&>:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={plugins} components={components} skipHtml>
        {children}
      </ReactMarkdown>
    </div>
  );
});
