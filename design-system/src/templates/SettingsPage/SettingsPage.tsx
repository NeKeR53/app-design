/*
 * Gabarit des réglages. Spec : SettingsPage.spec.md (D-015, D-200 à D-209).
 * L'app décrit ses rubriques et ses réglages par des données ; le gabarit dessine les contrôles,
 * applique chaque changement tout de suite (D-007) et rétablit la valeur en cas d'échec.
 */
import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "../../components/Button/Button";
import { Code } from "../../components/Code/Code";
import type { FieldWidth } from "../../components/Field/Field";
import { IconButton } from "../../components/IconButton/IconButton";
import { SearchInput, type SearchCriteria } from "../../components/SearchInput/SearchInput";
import { Select, type SelectOption, type SelectSection } from "../../components/Select/Select";
import { Skeleton, SkeletonGroup } from "../../components/Skeleton/Skeleton";
import { Badge, type StatusTone } from "../../components/Badge/Badge";
import { Toggle } from "../../components/Toggle/Toggle";
import { TextInput } from "../../components/TextInput/TextInput";
import { ChevronLeft, ChevronRight, ExternalArrow } from "../../icons";
import { useConfirmFn } from "../../lib/confirm";
import { cx } from "../../lib/cx";
import { CenterMessage, RetryButton, norm } from "../../lib/results";
import { ActionBar, confirmRequest, type Action } from "../../patterns/ActionBar/ActionBar";
import { useMessages, useNotify, useStoredState } from "../../provider/SocleProvider";

/* ---------- Modèle (D-200) ---------- */

interface SettingBase {
  /** Identifiant stable, unique dans la section. */
  id: string;
  /** Ce que règle la ligne ; nom accessible du contrôle. */
  label: string;
  /** Une phrase sous le libellé. */
  description?: string;
  /** Contrôle désactivé (sans effet pour `item` et `info`). */
  isDisabled?: boolean;
}

/** Ce que rend `onChange` : une promesse qui rejette rétablit la valeur précédente (D-204). */
type Apply<T> = (value: T) => unknown;

export interface SwitchSetting extends SettingBase {
  type: "switch";
  value: boolean;
  onChange: Apply<boolean>;
}

export interface SelectSetting extends SettingBase {
  type: "select";
  value: string | null;
  options: SelectOption[] | SelectSection[];
  onChange: Apply<string>;
  /** Largeur du champ (D-133). Défaut : `md`. */
  width?: Exclude<FieldWidth, "full">;
}

export interface TextSetting extends SettingBase {
  type: "text";
  value: string;
  onChange: Apply<string>;
  /** `email` et `url` vérifient aussi le format. */
  inputType?: "text" | "email" | "url";
  isRequired?: boolean;
  /** Renvoie la phrase qui dit quoi corriger, ou rien (D-132). */
  validate?: (value: string) => string | null | undefined;
  /** Exemple de valeur. */
  placeholder?: string;
  /** Largeur du champ (D-133). Défaut : `md`. */
  width?: Exclude<FieldWidth, "full">;
}

export interface ActionSetting extends SettingBase {
  type: "action";
  /** L'action du bouton (D-110) ; `danger` ou `confirm` : confirmée (D-205). */
  action: Action;
}

export interface SettingTag {
  label: string;
  tone?: StatusTone;
}

export interface ItemSetting extends SettingBase {
  type: "item";
  /** Code court à côté du libellé. */
  code?: string;
  /** Étiquettes d'état, sous la description. */
  tags?: SettingTag[];
  /** Actions de la ligne : une icône, puis « … » (D-114, D-206). */
  actions?: Action[];
}

export interface InfoSetting extends SettingBase {
  type: "info";
  value: string;
  /** Valeur en `Code`. */
  isCode?: boolean;
}

/** Une ligne de réglage ; le type choisit le contrôle (D-200). */
export type Setting = SwitchSetting | SelectSetting | TextSetting | ActionSetting | ItemSetting | InfoSetting;

export interface SettingsSection {
  id: string;
  title?: string;
  description?: string;
  /** Actions de la section, à droite du titre (D-113, D-206). */
  actions?: Action[];
  settings?: Setting[];
  /** Phrase affichée quand la section n'a aucune ligne (D-206). */
  emptyMessage?: string;
  /** Contenu libre sous les lignes : un composant de Socle (`Table`, `List`). */
  content?: ReactNode;
}

/** Une rubrique de la navigation. */
export interface SettingsCategory {
  id: string;
  label: string;
  /** Icône de l'app, 16 px (D-011). */
  icon: ReactNode;
  /** Mots de plus pour la recherche (D-202). */
  keywords?: string[];
  sections: SettingsSection[];
  /** Squelettes à la place des sections (D-209). */
  isLoading?: boolean;
  /** Message d'erreur à la place des sections (D-209). */
  hasError?: boolean;
  onRetry?: () => void;
}

export interface SettingsGroup {
  id: string;
  title?: string;
  categories: SettingsCategory[];
}

export interface SettingsPageProps {
  groups: SettingsGroup[];
  /** Rubrique courante, si l'app la pilote. Défaut : la dernière ouverte, sinon la première. */
  selectedId?: string;
  onSelectionChange?: (id: string) => void;
  /** Lien externe en pied de navigation (nouvel onglet). */
  footerLink?: { label: string; href: string };
}

/* ---------- Règles pures ---------- */

/** Une rubrique reste si son libellé, ses mots-clés, un titre de section ou un libellé de réglage contient le texte (D-202). */
export function matchesCategory(category: SettingsCategory, text: string): boolean {
  const q = norm(text.trim());
  if (!q) return true;
  const words = [
    category.label,
    ...(category.keywords ?? []),
    ...category.sections.flatMap((s) => [s.title ?? "", ...(s.settings ?? []).map((r) => r.label)]),
  ];
  return words.some((w) => norm(w).includes(q));
}

/** Les groupes filtrés ; un groupe vide disparaît (D-202). */
export function filterGroups(groups: SettingsGroup[], text: string): SettingsGroup[] {
  return groups
    .map((g) => ({ ...g, categories: g.categories.filter((c) => matchesCategory(c, text)) }))
    .filter((g) => g.categories.length > 0);
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const URL_RE = /^https?:\/\/\S+$/;

function errorText(error: unknown): string | undefined {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return undefined;
}

/* ---------- Application immédiate (D-204) ---------- */

/** Valeur affichée : suit la valeur de l'app, change tout de suite, revient si l'enregistrement échoue. */
function useApplied<T>(value: T, onChange: Apply<T>) {
  const m = useMessages();
  const notify = useNotify();
  const [shown, setShown] = useState(value);
  const [source, setSource] = useState(value);
  // Dernière valeur enregistrée, et numéro du dernier envoi : les réponses peuvent
  // arriver dans le désordre quand l'utilisateur change vite plusieurs fois.
  const saved = useRef(value);
  const sent = useRef(0);
  const settled = useRef(0);
  if (!Object.is(value, source)) {
    setSource(value);
    saved.current = value;
    // Pendant un envoi, la valeur affichée reste celle que l'utilisateur a choisie.
    if (settled.current === sent.current) setShown(value);
  }
  const apply = async (next: T) => {
    const id = ++sent.current;
    setShown(next);
    try {
      await onChange(next);
      if (id === sent.current) saved.current = next;
    } catch (error) {
      // Seul l'échec du dernier envoi rétablit la dernière valeur enregistrée.
      if (id === sent.current) setShown(saved.current);
      const description = errorText(error);
      notify({ tone: "danger", title: m.settingNotSaved, ...(description ? { description } : {}) });
      return false;
    } finally {
      settled.current = Math.max(settled.current, id);
    }
    return true;
  };
  return [shown, apply] as const;
}

/* ---------- Lignes (D-203) ---------- */

function Row({
  setting,
  title,
  below,
  control,
  wraps,
  narrow,
}: {
  setting: Setting;
  title?: ReactNode;
  below?: ReactNode;
  control: ReactNode;
  /** Le contrôle passe sous le texte en petite largeur (`select`, `text`). */
  wraps?: boolean;
  narrow: boolean;
}) {
  const id = useId();
  return (
    <div
      data-setting={setting.id}
      className={cx(
        "flex items-center gap-4 border-b border-line py-(--setting-py)",
        wraps && narrow && "flex-wrap",
      )}
    >
      <div className="min-w-0 flex-1">
        <div id={`${id}-label`} className="flex flex-wrap items-center gap-1.5 text-md text-fg [overflow-wrap:anywhere]">
          {title ?? setting.label}
        </div>
        {setting.description && (
          <div id={`${id}-desc`} className="max-w-[72ch] text-sm text-fg-2">
            {setting.description}
          </div>
        )}
        {below}
      </div>
      <div className={cx("flex shrink-0 items-center", wraps && narrow && "w-full [&>*]:w-full")}>{control}</div>
    </div>
  );
}

function SwitchRow({ setting, narrow }: { setting: SwitchSetting; narrow: boolean }) {
  const [on, apply] = useApplied(setting.value, setting.onChange);
  return (
    <Row
      setting={setting}
      narrow={narrow}
      control={
        <Toggle hideLabel isSelected={on} onChange={(v) => void apply(v)} {...(setting.isDisabled ? { isDisabled: true } : {})}>
          {setting.label}
        </Toggle>
      }
    />
  );
}

function SelectRow({ setting, narrow }: { setting: SelectSetting; narrow: boolean }) {
  const [value, apply] = useApplied<string | null>(setting.value, setting.onChange as Apply<string | null>);
  return (
    <Row
      setting={setting}
      narrow={narrow}
      wraps
      control={
        <Select
          label={setting.label}
          hideLabel
          width={narrow ? "full" : (setting.width ?? "md")}
          options={setting.options}
          value={value}
          onChange={(id) => {
            if (id !== null && id !== value) void apply(id);
          }}
          {...(setting.isDisabled ? { isDisabled: true } : {})}
        />
      }
    />
  );
}

function TextRow({ setting, narrow }: { setting: TextSetting; narrow: boolean }) {
  const m = useMessages();
  const [saved, apply] = useApplied(setting.value, setting.onChange);
  const [draft, setDraft] = useState(saved);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState(saved);
  if (saved !== source) {
    setSource(saved);
    setDraft(saved);
    setError(null);
  }

  const check = (text: string): string | null => {
    if (!text) return setting.isRequired ? m.requiredField : null;
    if (setting.inputType === "email" && !EMAIL.test(text)) return m.invalidEmail;
    if (setting.inputType === "url" && !URL_RE.test(text)) return m.invalidUrl;
    return setting.validate?.(text) ?? null;
  };
  const commit = () => {
    const text = draft.trim();
    if (text === saved) {
      setDraft(saved);
      setError(null);
      return;
    }
    const problem = check(text);
    setError(problem);
    if (!problem) void apply(text);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape" && (draft !== saved || error)) {
      // Premier Échap : rétablit la valeur ; le suivant ferme la modale.
      e.stopPropagation();
      e.preventDefault();
      setDraft(saved);
      setError(null);
    }
  };
  return (
    <Row
      setting={setting}
      narrow={narrow}
      wraps
      control={
        <div onKeyDown={onKeyDown} className="flex">
          <TextInput
            label={setting.label}
            hideLabel
            width={narrow ? "full" : (setting.width ?? "md")}
            type={setting.inputType ?? "text"}
            value={draft}
            onChange={(v) => {
              setDraft(v);
              if (error) setError(null);
            }}
            onBlur={commit}
            {...(error ? { error } : {})}
            {...(setting.placeholder ? { placeholder: setting.placeholder } : {})}
            {...(setting.isDisabled ? { isDisabled: true } : {})}
          />
        </div>
      }
    />
  );
}

function ActionRow({ setting, narrow }: { setting: ActionSetting; narrow: boolean }) {
  const m = useMessages();
  const confirm = useConfirmFn();
  const notify = useNotify();
  const [pending, setPending] = useState(false);
  const { action } = setting;
  const run = async () => {
    if (pending || action.isDisabled) return;
    const request = confirmRequest(action, m.confirmQuestion);
    if (request && !(await confirm(request))) return;
    setPending(true);
    try {
      await action.onPress();
    } catch (error) {
      const description = errorText(error);
      notify({ tone: "danger", title: m.actionFailed, ...(description ? { description } : {}) });
    } finally {
      setPending(false);
    }
  };
  if (action.isHidden) return null;
  return (
    <Row
      setting={setting}
      narrow={narrow}
      control={
        <Button isPending={pending} isDisabled={Boolean(action.isDisabled || setting.isDisabled)} onPress={() => void run()} {...(action.icon ? { icon: action.icon } : {})}>
          {action.label}
        </Button>
      }
    />
  );
}

function ItemRow({ setting, narrow }: { setting: ItemSetting; narrow: boolean }) {
  const m = useMessages();
  const notify = useNotify();
  return (
    <Row
      setting={setting}
      narrow={narrow}
      title={
        <>
          <span>{setting.label}</span>
          {setting.code && <Code>{setting.code}</Code>}
        </>
      }
      below={
        setting.tags?.length ? (
          <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
            {setting.tags.map((t) => (
              <Badge key={t.label} tone={t.tone ?? "neutral"}>
                {t.label}
              </Badge>
            ))}
          </div>
        ) : undefined
      }
      control={
        setting.actions?.length ? (
          <ActionBar
            actions={setting.actions}
            zone="row"
            subject={setting.label}
            onError={(_a, error) => {
              const description = errorText(error);
              notify({ tone: "danger", title: m.actionFailed, ...(description ? { description } : {}) });
            }}
          />
        ) : null
      }
    />
  );
}

function InfoRow({ setting, narrow }: { setting: InfoSetting; narrow: boolean }) {
  return <Row setting={setting} narrow={narrow} control={setting.isCode ? <Code>{setting.value}</Code> : <span className="text-fg-2">{setting.value}</span>} />;
}

function SettingLine({ setting, narrow }: { setting: Setting; narrow: boolean }) {
  switch (setting.type) {
    case "switch":
      return <SwitchRow setting={setting} narrow={narrow} />;
    case "select":
      return <SelectRow setting={setting} narrow={narrow} />;
    case "text":
      return <TextRow setting={setting} narrow={narrow} />;
    case "action":
      return <ActionRow setting={setting} narrow={narrow} />;
    case "item":
      return <ItemRow setting={setting} narrow={narrow} />;
    case "info":
      return <InfoRow setting={setting} narrow={narrow} />;
  }
}

/* ---------- Contenu (D-207, D-209) ---------- */

function Section({ section, narrow }: { section: SettingsSection; narrow: boolean }) {
  const m = useMessages();
  const notify = useNotify();
  const settings = section.settings ?? [];
  const hasHead = Boolean(section.title || section.description || section.actions?.length);
  return (
    <section className="mt-7 first:mt-4" aria-label={section.title}>
      {hasHead && (
        <div className="flex items-start gap-3 border-b border-line pb-2">
          <div className="min-w-0 flex-1">
            {section.title && <h3 className="m-0 text-md font-heading text-fg">{section.title}</h3>}
            {section.description && <p className="m-0 mt-0.5 max-w-[72ch] text-sm text-fg-2">{section.description}</p>}
          </div>
          {section.actions?.length ? (
            <ActionBar
              actions={section.actions}
              zone="section"
              {...(section.title ? { subject: section.title } : {})}
              onError={(_a, error) => {
                const description = errorText(error);
                notify({ tone: "danger", title: m.actionFailed, ...(description ? { description } : {}) });
              }}
            />
          ) : null}
        </div>
      )}
      {settings.map((s) => (
        <SettingLine key={s.id} setting={s} narrow={narrow} />
      ))}
      {settings.length === 0 && section.emptyMessage && !section.content && (
        <p className="m-0 border-b border-line py-3 text-sm text-fg-3">{section.emptyMessage}</p>
      )}
      {section.content && <div className="mt-3">{section.content}</div>}
    </section>
  );
}

function CategoryBody({ category, narrow }: { category: SettingsCategory; narrow: boolean }) {
  const m = useMessages();
  if (category.hasError) {
    return (
      <div className="py-12">
        <CenterMessage alert title={m.settingsLoadError} text={m.settingsLoadErrorText} action={<RetryButton onRetry={category.onRetry} />} />
      </div>
    );
  }
  if (category.isLoading) {
    return (
      <div className="mt-4">
        <SkeletonGroup label={m.loadingSettings}>
          {[40, 70, 55, 65].map((w, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-line py-4">
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton width={`${w}%`} />
                <Skeleton width={`${w - 20}%`} height={8} />
              </div>
              <Skeleton shape="rect" width={120} height={20} />
            </div>
          ))}
        </SkeletonGroup>
      </div>
    );
  }
  return (
    <>
      {category.sections.map((s) => (
        <Section key={s.id} section={s} narrow={narrow} />
      ))}
    </>
  );
}

/* ---------- Navigation (D-201, D-202) ---------- */

const navItem = cx(
  "socle-btn flex h-(--row-h) w-full min-w-0 shrink-0 cursor-default items-center gap-2 rounded-md px-2 text-left text-md text-fg-2 outline-none select-none",
  "hover:bg-hover hover:text-fg aria-[current=page]:bg-selected aria-[current=page]:text-fg",
  "focus-visible:outline-2 focus-visible:-outline-offset-2 outline-focus focus-visible:outline-solid",
);

/** Largeur du gabarit : la requête de conteneur de D-208. */
function useNarrow(ref: React.RefObject<HTMLElement | null>, limit = 640) {
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      setNarrow(w > 0 && w < limit);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, limit]);
  return narrow;
}

/** Gabarit des réglages : navigation par rubriques et lignes à application immédiate (D-015, D-200). */
export function SettingsPage({ groups, selectedId, onSelectionChange, footerLink }: SettingsPageProps) {
  const m = useMessages();
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const narrow = useNarrow(rootRef);
  const [stored, setStored] = useStoredState<string | null>("settings:category", null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"nav" | "content">("nav");

  const all = groups.flatMap((g) => g.categories);
  const pick = (id: string | null | undefined) => (id ? all.find((c) => c.id === id) : undefined);
  const current = pick(selectedId) ?? pick(stored) ?? all[0];
  const shownGroups = filterGroups(groups, query);

  const open = (id: string) => {
    setView("content");
    if (id === current?.id) return;
    if (selectedId === undefined) setStored(id);
    onSelectionChange?.(id);
  };

  // Changer de rubrique remonte le contenu en haut (D-207).
  useEffect(() => {
    contentRef.current?.scrollTo?.({ top: 0 });
  }, [current?.id]);

  const onSearchKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" || !(e.target instanceof HTMLInputElement)) return;
    const first = filterGroups(groups, e.target.value)[0]?.categories[0];
    if (first) open(first.id);
  };

  const showNav = !narrow || view === "nav";
  const showContent = !narrow || view === "content";

  return (
    <div
      ref={rootRef}
      data-socle-immediate=""
      className={cx("socle-box flex h-full min-h-0 w-full font-sans text-md text-fg", !narrow && "grid grid-cols-[var(--settings-nav-w)_minmax(0,1fr)]")}
    >
      {showNav && (
        <nav
          aria-label={m.settingsSections}
          className={cx("socle-focus-scroll flex min-h-0 min-w-0 flex-col gap-0.5 overflow-auto px-2 py-3", narrow ? "w-full bg-surface" : "border-r border-line bg-surface-side")}
        >
          {/* La recherche prend la largeur de la navigation, pas ses 320 px de barre d'outils (D-202). */}
          <div className="mb-2.5 min-w-0 shrink-0 [&_[role=search]]:w-full" onKeyDown={onSearchKey}>
            <SearchInput label={m.settingsSearchScope} onChange={(c: SearchCriteria) => setQuery(c.text)} />
          </div>
          {shownGroups.length === 0 && <p className="m-0 px-2 py-1.5 text-sm text-fg-3">{m.noSettingsFound}</p>}
          {shownGroups.map((g, i) => (
            <Fragment key={g.id}>
              {i > 0 && <hr aria-hidden className="mx-2 my-2 shrink-0 border-0 border-t border-line" />}
              <div role="group" aria-label={g.title} className="flex flex-col gap-0.5">
                {g.title && <div className="px-2 pt-1.5 pb-0.5 text-sm font-medium text-fg-3">{g.title}</div>}
                {g.categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    data-category={c.id}
                    aria-current={c.id === current?.id && !narrow ? "page" : undefined}
                    onClick={() => open(c.id)}
                    className={cx(navItem, narrow && "h-11")}
                  >
                    <span aria-hidden className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
                      {c.icon}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{c.label}</span>
                    {narrow && <ChevronRight size={16} className="shrink-0 text-fg-3" />}
                  </button>
                ))}
              </div>
            </Fragment>
          ))}
          {footerLink && (
            <div className="mt-auto shrink-0 pt-2">
              <a href={footerLink.href} target="_blank" rel="noopener noreferrer" className={cx(navItem, "text-sm no-underline")}>
                <span className="min-w-0 flex-1 truncate">{footerLink.label}</span>
                <ExternalArrow size={14} className="shrink-0" />
              </a>
            </div>
          )}
        </nav>
      )}
      {showContent && current && (
        <section
          ref={contentRef}
          aria-labelledby={titleId}
          className={cx(
            "socle-focus-scroll min-h-0 min-w-0 flex-1 overflow-auto pb-8",
            narrow ? "px-4 pt-3" : "px-(--settings-pad) pt-5",
          )}
        >
          <h2 id={titleId} className="m-0 flex items-center gap-1.5 text-lg font-heading [overflow-wrap:anywhere]">
            {narrow && <IconButton icon={<ChevronLeft />} label={m.backToSections} onPress={() => setView("nav")} />}
            {current.label}
          </h2>
          <CategoryBody category={current} narrow={narrow} />
        </section>
      )}
    </div>
  );
}
