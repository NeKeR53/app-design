/*
 * Page composée et bloc titré. Spec : Page.spec.md. Décisions : D-213 à D-218.
 */
import { useId, type ReactNode } from "react";
import { cx } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { ActionBar, type Action } from "../../patterns/ActionBar/ActionBar";
import { Button } from "../../components/Button/Button";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { Skeleton, SkeletonGroup } from "../../components/Skeleton/Skeleton";

/** Largeur de la colonne (D-214). */
export type PageWidth = "full" | "text";

/** Colonne commune aux zones d'une page : marges `--pad`, 760 px centrée en `text` (D-214). Usage interne. */
export function PageColumn({ width, layout, children }: { width: PageWidth; layout?: string; children: ReactNode }) {
  return <div className={cx("mx-auto box-border w-full px-(--pad)", width === "text" && "max-w-[calc(760px+2*var(--pad))]", layout)}>{children}</div>;
}

/** Squelettes de deux blocs (D-165). Usage interne. */
export function PageSkeleton({ label, divided }: { label?: string | undefined; divided?: boolean }) {
  const block = (w: string) => (
    <div className={cx("flex flex-col gap-2.5", divided ? "py-5 [&+&]:border-t [&+&]:border-line" : "")}>
      <Skeleton width={w} height={14} />
      <Skeleton />
      <Skeleton width="75%" />
    </div>
  );
  return (
    <SkeletonGroup {...(label ? { label } : {})}>
      <div className={cx("flex flex-col", divided ? "" : "gap-6 py-(--pad)")}>
        {block("28%")}
        {block("36%")}
      </div>
    </SkeletonGroup>
  );
}

/** Message d'échec centré avec « Réessayer » (D-085, D-215). Usage interne. */
export function PageError({ onRetry, compact }: { onRetry?: (() => void) | undefined; compact?: boolean }) {
  const m = useMessages();
  return (
    <div role="alert">
      <EmptyState
        size={compact ? "compact" : "default"}
        title={compact ? m.sectionLoadError : m.pageLoadErrorTitle}
        {...(compact ? {} : { description: m.pageLoadErrorText })}
        action={
          <Button size={compact ? "sm" : "md"} {...(onRetry ? { onPress: onRetry } : {})}>
            {m.retry}
          </Button>
        }
      />
    </div>
  );
}

/** État vide décrit par des données ; l'action suit la zone `empty` (D-111). */
export interface PageEmpty {
  title: string;
  description?: string;
  /** Icône de l'app, 32 px (ignorée dans une section, compacte). */
  icon?: ReactNode;
  action?: Action;
}

export function PageEmptyState({ empty, compact }: { empty: PageEmpty; compact?: boolean }) {
  return (
    <EmptyState
      size={compact ? "compact" : "default"}
      title={empty.title}
      {...(empty.description ? { description: empty.description } : {})}
      {...(empty.icon && !compact ? { icon: empty.icon } : {})}
      {...(empty.action ? { action: <ActionBar actions={[{ ...empty.action, primary: true }]} zone="empty" /> } : {})}
    />
  );
}

export interface PageSectionProps {
  /** Titre du bloc, en `h2` (D-213). */
  title: string;
  /** Une phrase sous le titre. */
  description?: string;
  /** Actions du bloc, zone `section` : bouton secondaire `sm`, 2 icônes, « … » (D-113). */
  actions?: ReadonlyArray<Action>;
  /** État de la section, quand elle charge ses données à part (D-216). */
  state?: "ready" | "loading" | "error";
  onRetry?: () => void;
  /** Donné, il remplace le contenu par un état vide compact (D-216). */
  empty?: PageEmpty;
  children?: ReactNode;
}

/** Bloc titré de Page et DetailPage (D-213). Ne se replie pas. */
export function PageSection({ title, description, actions, state = "ready", onRetry, empty, children }: PageSectionProps) {
  const id = useId();
  const body =
    state === "loading" ? (
      <SkeletonGroup>
        <div className="flex flex-col gap-2.5 py-1">
          <Skeleton />
          <Skeleton width="60%" />
        </div>
      </SkeletonGroup>
    ) : state === "error" ? (
      <PageError compact onRetry={onRetry} />
    ) : empty ? (
      <PageEmptyState empty={empty} compact />
    ) : (
      children
    );
  return (
    <section aria-labelledby={id} className="socle-page-section min-w-0">
      <div className="mb-2.5 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 id={id} className="m-0 text-lg leading-snug font-heading text-fg">
            {title}
          </h2>
          {description && <p className="m-0 mt-0.5 text-sm text-fg-2">{description}</p>}
        </div>
        {actions && actions.length > 0 && state === "ready" && <ActionBar actions={actions} zone="section" subject={title} />}
      </div>
      {body}
    </section>
  );
}

/** Barre d'outils d'une ligne : contenu libre à gauche, actions en zone `toolbar` à droite (D-217). Usage interne (Page, ChatPage). */
export function PageToolbar({
  width,
  toolbar,
  actions,
  actionsLabel,
  onActionError,
  onActionDone,
}: {
  width: PageWidth;
  toolbar?: ReactNode;
  actions?: ReadonlyArray<Action> | undefined;
  actionsLabel?: string | undefined;
  onActionError?: ((action: Action, error: unknown) => void) | undefined;
  onActionDone?: ((action: Action) => void) | undefined;
}) {
  return (
    <div role="toolbar" {...(actionsLabel ? { "aria-label": actionsLabel } : {})} className="shrink-0 border-b border-line">
      <PageColumn width={width} layout="flex items-center gap-2 py-2.5">
        <div data-page-toolbar className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:thin] [&>*]:shrink-0">
          {toolbar}
        </div>
        {actions && actions.length > 0 && (
          <ActionBar
            actions={actions}
            zone="toolbar"
            {...(actionsLabel ? { subject: actionsLabel } : {})}
            {...(onActionError ? { onError: onActionError } : {})}
            {...(onActionDone ? { onDone: onActionDone } : {})}
          />
        )}
      </PageColumn>
    </div>
  );
}

export interface PageProps {
  /** Contenu libre de la barre d'outils, à gauche (filtres, période). Une ligne (D-217). */
  toolbar?: ReactNode;
  /** Actions de la barre, zone `toolbar`, à droite. */
  actions?: ReadonlyArray<Action>;
  /** Sujet des actions, pour leur nom accessible. */
  actionsLabel?: string;
  onActionError?: (action: Action, error: unknown) => void;
  onActionDone?: (action: Action) => void;
  /** Pied fixe : total, sélection, pagination. */
  footer?: ReactNode;
  /** Défaut `full` ; `text` : colonne de 760 px centrée (D-214). */
  width?: PageWidth;
  /** Le contenu remplit la hauteur sans défiler (D-218). */
  fill?: boolean;
  /** État de la page (D-215). */
  state?: "ready" | "loading" | "error";
  onRetry?: () => void;
  loadingLabel?: string;
  children: ReactNode;
}

/** Page composée : barre d'outils, contenu, pied (D-217). */
export function Page({
  toolbar,
  actions,
  actionsLabel,
  onActionError,
  onActionDone,
  footer,
  width = "full",
  fill = false,
  state = "ready",
  onRetry,
  loadingLabel,
  children,
}: PageProps) {
  const hasBar = toolbar !== undefined || (actions && actions.length > 0);
  const content = state === "loading" ? <PageSkeleton label={loadingLabel} /> : state === "error" ? <PageError onRetry={onRetry} /> : children;
  return (
    <div className="socle-page flex h-full min-h-0 flex-col bg-surface font-sans text-md text-fg">
      {hasBar && (
        <PageToolbar
          width={width}
          toolbar={toolbar}
          actions={actions}
          actionsLabel={actionsLabel}
          onActionError={onActionError}
          onActionDone={onActionDone}
        />
      )}
      <div data-page-content className={cx("min-h-0 flex-1", fill && state === "ready" ? "flex flex-col overflow-hidden" : "overflow-auto")}>
        <PageColumn width={width} layout={cx(fill && state === "ready" ? "flex min-h-0 flex-1 flex-col pt-(--pad) [&>*]:min-h-0 [&>*]:flex-1" : "flex flex-col gap-6 py-(--pad)")}>
          {content}
        </PageColumn>
      </div>
      {footer !== undefined && (
        <footer className="shrink-0 border-t border-line text-sm text-fg-3 tabular-nums">
          <PageColumn width={width} layout="py-2">
            {footer}
          </PageColumn>
        </footer>
      )}
    </div>
  );
}

Page.Section = PageSection;
