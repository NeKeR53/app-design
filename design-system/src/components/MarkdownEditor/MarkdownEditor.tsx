/*
 * Éditeur de Markdown, au format des champs. Spec : MarkdownEditor.spec.md. Décisions : D-300, D-305 à D-309 ;
 * D-343 (limite dépassable).
 * Exporté par la sous-entrée `socle-ui/markdown-editor` (D-300). CodeMirror 6 se charge à la première
 * ouverture d'un éditeur (editorView.ts, par `import()`).
 */
import { useDeferredValue, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { LabelContext } from "react-aria-components/Label";
import { Toolbar } from "react-aria-components/Toolbar";
import type { EditorView } from "@codemirror/view";
import { Separator } from "../Separator/Separator";
import { CharCount, FieldLabel, ReadOnlyLock, fieldBox, fieldRoot, type FieldBaseProps } from "../Field/Field";
import { IconButton } from "../IconButton/IconButton";
import { Markdown } from "../Markdown/Markdown";
import { Bold, CodeIcon, Eye, Heading1, Heading2, Heading3, Italic, LinkIcon, ListDetail, ListOrdered, TextQuote } from "../../icons";
import { cx, nativeInsetFocusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import type { SocleMessages } from "../../i18n/messages";
import { COMMAND_SHORTCUTS, type MarkdownCommand } from "./commands";
import type { EditorCallbacks, EditorSettings, PastedImage } from "./editorView";

export type { PastedImage } from "./editorView";

type EditorModule = typeof import("./editorView");

/** Une seule demande pour tous les éditeurs : CodeMirror arrive à la première ouverture (D-300). */
let editorModule: Promise<EditorModule> | undefined;
const loadEditor = () => (editorModule ??= import("./editorView"));

export interface MarkdownEditorProps extends Omit<FieldBaseProps, "isRequired" | "requiredMessage"> {
  /** Champ obligatoire : sans « (facultatif) » ; la vérification reste à l'app (`error`). */
  isRequired?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  /** Lecture seule (D-131, D-305). */
  isReadOnly?: boolean;
  placeholder?: string;
  /**
   * Longueur maximale, dépassable ; affiche le compteur (D-343). Au-delà : compteur en erreur ;
   * en quittant le champ ou à l'envoi du formulaire, « Saisissez n caractères au plus. » et envoi refusé.
   */
  maxLength?: number;
  /** Hauteur de départ, en lignes (D-305). Défaut : 6. */
  minRows?: number;
  /** Hauteur maximale, en lignes ; au-delà, le texte défile (D-305). Défaut : 20. */
  maxRows?: number;
  /** Occupe la hauteur du conteneur (page d'édition d'une note). */
  fill?: boolean;
  /** Aperçu (D-309) : `"toggle"` ajoute le bouton « Aperçu » ; `"split"` met l'aperçu à côté du texte. */
  preview?: "toggle" | "split";
  /** Image collée ou déposée : l'app la range et rend son adresse (D-308). Sans elle, coller une image ne fait rien. */
  onPasteImage?: (file: File) => Promise<string | PastedImage>;
  /** Liens de l'aperçu, comme `Markdown`. */
  onLinkPress?: (href: string) => void;
  /** Images de l'aperçu, comme `Markdown`. */
  renderImage?: (src: string, alt: string) => ReactNode;
}

interface Tool {
  command: MarkdownCommand;
  icon: ReactNode;
  label: (m: SocleMessages) => string;
}

/** Trois groupes séparés par un trait (D-307). */
const GROUPS: Tool[][] = [
  [
    { command: "heading1", icon: <Heading1 />, label: (m) => m.heading(1) },
    { command: "heading2", icon: <Heading2 />, label: (m) => m.heading(2) },
    { command: "heading3", icon: <Heading3 />, label: (m) => m.heading(3) },
  ],
  [
    { command: "bold", icon: <Bold />, label: (m) => m.bold },
    { command: "italic", icon: <Italic />, label: (m) => m.italic },
    { command: "code", icon: <CodeIcon />, label: (m) => m.inlineCode },
    { command: "link", icon: <LinkIcon />, label: (m) => m.link },
  ],
  [
    { command: "bulletList", icon: <ListDetail />, label: (m) => m.bulletList },
    { command: "orderedList", icon: <ListOrdered />, label: (m) => m.orderedList },
    { command: "quote", icon: <TextQuote />, label: (m) => m.quote },
  ],
];

/** Champ Markdown : libellé, barre de mise en forme, texte coloré, aide ou erreur, compteur (D-305). */
export function MarkdownEditor({
  label,
  hideLabel,
  description,
  error,
  isRequired,
  isDisabled = false,
  isReadOnly = false,
  width,
  name,
  value,
  defaultValue,
  onChange,
  onBlur,
  placeholder,
  maxLength,
  minRows = 6,
  maxRows = 20,
  fill = false,
  preview,
  onPasteImage,
  onLinkPress,
  renderImage,
}: MarkdownEditorProps) {
  const m = useMessages();
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | undefined>(undefined);
  const mod = useRef<EditorModule | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [doc, setDoc] = useState(value ?? defaultValue ?? "");
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imageError, setImageError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  // Limite dépassée : le message s'affiche en quittant le champ ou à l'envoi, jamais pendant la frappe.
  const [limitShown, setLimitShown] = useState(false);
  const validity = useRef<HTMLInputElement>(null);
  const over = maxLength !== undefined && doc.length > maxLength;
  const limitError = over && limitShown ? m.tooLong(maxLength) : "";
  const shownError = error || limitError;
  const labelId = useId();
  const descId = useId();
  const errId = useId();
  const countId = useId();

  const texts = { imageUploading: m.imageUploading, image: m.image, linkText: m.linkTextPlaceholder, linkUrl: m.linkUrlPlaceholder };
  // Les callbacks changent à chaque rendu : l'éditeur lit toujours les derniers.
  const latest = useRef<EditorCallbacks>(null as unknown as EditorCallbacks);
  latest.current = {
    onChange: (text) => {
      setDoc(text);
      setImageError("");
      if (maxLength === undefined || text.length <= maxLength) setLimitShown(false);
      onChange?.(text);
    },
    onFocusChange: (has) => {
      setFocused(has);
      if (!has && maxLength !== undefined && view.current && view.current.state.doc.length > maxLength) setLimitShown(true);
      if (!has) onBlur?.();
    },
    onPasteImage,
    onImageError: (file) => setImageError(m.imageNotAdded(file.name || m.image)),
    texts,
  };

  const help = shownError ? errId : description ? descId : undefined;
  const settings: EditorSettings = {
    attributes: {
      "aria-labelledby": labelId,
      ...(help || maxLength ? { "aria-describedby": [help, maxLength ? countId : undefined].filter(Boolean).join(" ") } : {}),
      ...(shownError ? { "aria-invalid": "true" } : {}),
      ...(isReadOnly ? { "aria-readonly": "true" } : {}),
      ...(isRequired ? { "aria-required": "true" } : {}),
      ...(isDisabled ? { "aria-disabled": "true" } : {}),
    },
    placeholder,
    isReadOnly,
    isDisabled,
  };
  const settingsRef = useRef(settings);
  // Dans un <form>, une limite dépassée refuse l'envoi : un champ caché porte l'erreur (D-343).
  useEffect(() => {
    validity.current?.setCustomValidity(over && maxLength !== undefined ? m.tooLong(maxLength) : "");
  }, [over, maxLength, m]);
  settingsRef.current = settings;
  const initial = useRef(doc);

  useEffect(() => {
    let cancelled = false;
    void loadEditor().then((loaded) => {
      if (cancelled || !host.current) return;
      mod.current = loaded;
      view.current = loaded.createEditor(host.current, loaded.createState(initial.current, settingsRef.current, () => latest.current));
      setReady(true);
    });
    return () => {
      cancelled = true;
      view.current?.destroy();
      view.current = undefined;
    };
    // L'éditeur se crée une fois ; les changements passent par les effets suivants.
  }, []);

  // Un texte venu de l'app qui n'est pas celui de l'éditeur (autre note ouverte) : nouvel historique.
  useLayoutEffect(() => {
    if (value === undefined) return;
    initial.current = value;
    const current = view.current;
    const loaded = mod.current;
    if (!current || !loaded || current.state.doc.toString() === value) return;
    current.setState(loaded.createState(value, settingsRef.current, () => latest.current));
    setDoc(value);
  }, [value]);

  // Libellé, aide, erreur, lecture seule, limite : mêmes texte et historique, réglages à jour.
  const settingsKey = JSON.stringify(settings);
  useEffect(() => {
    if (view.current && mod.current) mod.current.updateSettings(view.current, settingsRef.current);
  }, [settingsKey, ready]);

  const run = (command: MarkdownCommand) => {
    const current = view.current;
    if (!current || !mod.current) return;
    mod.current.runCommand(current, command, texts);
    current.focus();
  };

  const deferred = useDeferredValue(doc);
  const previewOn = preview === "toggle" && showPreview;
  const toolsOff = !ready || isDisabled || previewOn;
  const editorHidden = previewOn;
  const rendered = deferred.trim() ? (
    <Markdown {...(onLinkPress ? { onLinkPress } : {})} {...(renderImage ? { renderImage } : {})}>
      {deferred}
    </Markdown>
  ) : (
    <p className="m-0 text-md text-fg-3">{m.nothingToPreview}</p>
  );
  const sizes = {
    "--md-min-rows": String(minRows),
    "--md-max-height": fill ? "none" : `calc(${maxRows} * 1.6em + 16px)`,
  } as CSSProperties;

  return (
    <div
      className={cx(fieldRoot(width), fill && "h-full min-h-0")}
      {...(isDisabled ? { "data-disabled": "true" } : {})}
      {...(shownError ? { "data-invalid": "true" } : {})}
    >
      <LabelContext.Provider value={{ id: labelId, onClick: () => view.current?.focus() }}>
        <FieldLabel isRequired={isRequired} hidden={hideLabel}>
          {label}
        </FieldLabel>
      </LabelContext.Provider>
      <div
        style={sizes}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        {...(focused ? { "data-focused": "true" } : {})}
        {...(hovered && !isDisabled ? { "data-hovered": "true" } : {})}
        {...(shownError ? { "data-invalid": "true" } : {})}
        className={cx(fieldBox({ isReadOnly }), "@container relative flex flex-col overflow-hidden p-0", fill && "min-h-0 flex-1")}
      >
        {!isReadOnly && (
          <Toolbar aria-label={m.formatting} className="flex flex-none flex-wrap items-center gap-0.5 border-b border-line px-1 py-(--focus-room)">
            {GROUPS.map((group, i) => (
              <span key={i} className="contents">
                {i > 0 && <Separator orientation="vertical" />}
                {group.map((tool) => (
                  <IconButton key={tool.command} icon={tool.icon} label={tool.label(m)} shortcut={COMMAND_SHORTCUTS[tool.command]} isDisabled={toolsOff} onPress={() => run(tool.command)} />
                ))}
              </span>
            ))}
            {preview === "toggle" && (
              <span className="ml-auto">
                <IconButton icon={<Eye />} label={m.preview} isSelected={showPreview} onChange={setShowPreview} isDisabled={isDisabled} />
              </span>
            )}
          </Toolbar>
        )}
        <div className={cx("grid min-h-0 flex-1 grid-cols-1", preview === "split" && "grid-cols-2 @max-[560px]:grid-cols-1")}>
          <div className={cx("relative min-h-0 min-w-0 text-sm", fill && "h-full")} hidden={editorHidden}>
            <div ref={host} className={cx("h-full", !ready && "hidden")} />
            {!ready && (
              // CodeMirror arrive : le texte s'affiche tel quel, dans la même police.
              <pre className="m-0 min-h-[calc(var(--md-min-rows)*1.6em+16px)] px-3 py-2 font-mono leading-[1.6] break-words whitespace-pre-wrap text-fg">
                {doc || <span className="text-fg-3">{placeholder}</span>}
              </pre>
            )}
            {isReadOnly && <ReadOnlyLock />}
          </div>
          {preview === "split" && (
            <div className="relative min-w-0 border-l border-line @max-[560px]:static @max-[560px]:border-t @max-[560px]:border-l-0">
              <div
                role="region"
                aria-label={m.preview}
                tabIndex={0}
                className={cx("absolute inset-0 overflow-auto px-3 py-2 @max-[560px]:static @max-[560px]:max-h-(--md-max-height)", nativeInsetFocusRing)}
              >
                {rendered}
              </div>
            </div>
          )}
          {previewOn && (
            <div
              role="region"
              aria-label={m.preview}
              tabIndex={0}
              className={cx("max-h-(--md-max-height) min-h-[calc(var(--md-min-rows)*1.6em+16px)] overflow-auto px-3 py-2", nativeInsetFocusRing)}
            >
              {rendered}
            </div>
          )}
        </div>
      </div>
      {(description || shownError || imageError || maxLength) && (
        <div className="flex gap-2 text-sm">
          {shownError ? (
            <span id={errId} className="text-danger">
              {shownError}
            </span>
          ) : description ? (
            <span id={descId} className="text-fg-3">
              {description}
            </span>
          ) : null}
          <span role="status" className="text-danger">
            {imageError}
          </span>
          {maxLength !== undefined && <CharCount id={countId} length={doc.length} max={maxLength} />}
        </div>
      )}
      {maxLength !== undefined ? (
        <input
          ref={validity}
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          {...(name !== undefined ? { name } : {})}
          value={doc}
          onChange={() => {}}
          onInvalid={(e) => {
            // Pas de bulle du navigateur : le message s'affiche sous le champ, le focus va au texte s'il est le premier en erreur.
            e.preventDefault();
            setLimitShown(true);
            const form = e.currentTarget.form;
            const first = form ? Array.from(form.elements).find((el) => "validity" in el && !(el as HTMLInputElement).validity.valid) : e.currentTarget;
            if (first === e.currentTarget) view.current?.focus();
          }}
        />
      ) : (
        name !== undefined && <input type="hidden" name={name} value={doc} />
      )}
    </div>
  );
}
