/*
 * Question ou autorisation de l'agent, au-dessus de la zone de saisie. Spec : ChoicePrompt.spec.md. Décision : D-377.
 * Reprise de la carte de question de l'app de référence : options numérotées, touches 1 à 9, « Autre réponse… ».
 * Les options sont des actions immédiates : `ListBox` de React Aria sans sélection, avec `onAction`.
 */
import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { ListBox, ListBoxItem } from "react-aria-components/ListBox";
import { Button as RACButton } from "react-aria-components/Button";
import { Button } from "../Button/Button";
import { buttonReset, cx } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";

export interface ChoiceOption {
  id: string;
  label: string;
  /** Précision sous le libellé, en `--fg-2`. */
  description?: string;
}

/** Réponse : une option choisie, ou un texte libre (« Autre réponse… »). */
export type ChoicePromptAnswer = { id: string } | { text: string };

export interface ChoicePromptProps {
  /** Question posée par l'agent, ou action à autoriser. */
  question: string;
  /** `question` (défaut) : « Question de l'agent » ; `permission` : « Autorisation demandée ». */
  kind?: "question" | "permission";
  /** Détail en police à chasse fixe : la commande à autoriser, par exemple. */
  detail?: string;
  /** Options numérotées ; les 9 premières répondent aux touches 1 à 9. */
  options: ChoiceOption[];
  /** Ajoute « Autre réponse… », qui s'ouvre en champ de texte. Défaut : `true` pour une question, `false` pour une autorisation. */
  allowOther?: boolean;
  /** Reçoit l'option choisie ou le texte saisi. */
  onChoose: (answer: ChoicePromptAnswer) => void;
  /** Réponse impossible pour l'instant (l'agent écrit encore). */
  isDisabled?: boolean;
}

/** Ligne d'option : 32 px au moins, rayon 8 px, survol `--surface-side` (mesures de l'app de référence). */
const optionRow = "flex min-h-8 w-full cursor-default items-center gap-2 rounded-md px-2 py-1 text-start text-md";
/** Anneau de focus à l'intérieur de la ligne. */
const insetFocus = "outline-none data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-focus data-focus-visible:-outline-offset-2";

export function ChoicePrompt({ question, kind = "question", detail, options, allowOther, onChoose, isDisabled = false }: ChoicePromptProps) {
  const m = useMessages();
  const headingId = useId();
  const [other, setOther] = useState<string | null>(null);
  const otherButton = useRef<HTMLButtonElement>(null);
  const withOther = allowOther ?? kind === "question";
  const kindLabel = kind === "permission" ? m.choicePermission : m.choiceQuestion;

  // Touches 1 à 9 : seulement quand le focus est dans la carte, pas dans le champ libre.
  // Phase de capture : la recherche au clavier de la liste ne les reçoit pas.
  const onKeyDownCapture = (e: KeyboardEvent<HTMLElement>) => {
    if (isDisabled || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const target = e.target as HTMLElement;
    if (target.closest("textarea, input")) return;
    if (!/^[1-9]$/.test(e.key)) return;
    const option = options[Number(e.key) - 1];
    if (!option) return;
    e.preventDefault();
    e.stopPropagation();
    onChoose({ id: option.id });
  };

  return (
    <section
      aria-labelledby={headingId}
      onKeyDownCapture={onKeyDownCapture}
      className="socle-box flex flex-col gap-2 rounded-lg border border-line bg-surface py-2.5 ps-3 pe-2.5 font-sans text-fg"
    >
      <header className="flex items-center gap-2 text-sm text-fg-2">
        <span aria-hidden="true" className="grid size-4 shrink-0 place-items-center rounded-full bg-accent text-sm leading-none font-bold text-accent-fg forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]">
          {kind === "permission" ? "!" : "?"}
        </span>
        <span>{kindLabel}</span>
      </header>
      <p id={headingId} className="m-0 text-lg leading-[1.5] text-fg">
        {question}
      </p>
      {detail && <pre className="m-0 overflow-auto rounded-md bg-surface-side px-3 py-2 font-mono text-sm whitespace-pre-wrap text-fg [overflow-wrap:anywhere]">{detail}</pre>}
      {options.length > 0 && (
        <ListBox
          aria-label={m.choiceOptions}
          aria-describedby={headingId}
          selectionMode="none"
          disabledKeys={isDisabled ? options.map((o) => o.id) : []}
          onAction={(key) => onChoose({ id: String(key) })}
          className="m-0 flex flex-col gap-0.5 p-0 outline-none"
        >
          {options.map((option, index) => (
            <ListBoxItem
              key={option.id}
              id={option.id}
              textValue={option.label}
              // React Aria filtre aria-keyshortcuts : posé directement sur l'option (comme Tooltip).
              ref={(el: HTMLElement | null) => {
                if (el && index < 9) el.setAttribute("aria-keyshortcuts", String(index + 1));
              }}
              className={cx(
                optionRow,
                insetFocus,
                "text-fg data-hovered:bg-surface-side data-focused:bg-surface-side data-disabled:opacity-40",
              )}
            >
              <kbd aria-hidden="true" className={cx("grid size-5 shrink-0 place-items-center rounded-md border border-line bg-surface font-sans text-sm text-fg-2", index >= 9 && "invisible")}>
                {index + 1}
              </kbd>
              <span className="flex min-w-0 flex-col">
                <span>{option.label}</span>
                {option.description && <span className="text-sm text-fg-2">{option.description}</span>}
              </span>
            </ListBoxItem>
          ))}
        </ListBox>
      )}
      {withOther &&
        (other === null ? (
          <RACButton
            ref={otherButton}
            isDisabled={isDisabled}
            onPress={() => setOther("")}
            className={cx(buttonReset, optionRow, "text-fg-2 data-hovered:bg-surface-side data-disabled:opacity-40", insetFocus)}
          >
            {options.length ? m.choiceOther : m.choiceReply}
          </RACButton>
        ) : (
          <OtherAnswer
            value={other}
            onChange={setOther}
            isDisabled={isDisabled}
            onCancel={() => {
              setOther(null);
              requestAnimationFrame(() => otherButton.current?.focus());
            }}
            onSend={() => {
              if (!other.trim()) return;
              onChoose({ text: other.trim() });
            }}
          />
        ))}
    </section>
  );
}

/** « Autre réponse… » ouvert : champ de texte, Entrée envoie, Maj+Entrée va à la ligne, Échap referme. */
function OtherAnswer({
  value,
  onChange,
  onCancel,
  onSend,
  isDisabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onSend: () => void;
  isDisabled: boolean;
}) {
  const m = useMessages();
  const field = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => field.current?.focus(), []);
  useLayoutEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <div className="flex flex-col gap-2">
      <textarea
        ref={field}
        aria-label={m.choiceAnswer}
        value={value}
        rows={1}
        readOnly={isDisabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        className={cx(
          "socle-box block max-h-[40vh] w-full resize-none overflow-auto rounded-md border border-line-strong bg-field px-3 py-1.5 font-sans text-md leading-[1.5] text-fg",
          "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus focus-visible:outline-offset-1",
        )}
      />
      <div className="flex justify-end gap-2">
        <Button size="sm" onPress={onCancel}>
          {m.choiceCancel}
        </Button>
        <Button size="sm" variant="primary" onPress={onSend} isDisabled={isDisabled || !value.trim()}>
          {m.choiceSend}
        </Button>
      </div>
    </div>
  );
}
