/*
 * Gabarit d'un élément ouvert en entier. Spec : DetailPage.spec.md. Décisions : D-210 à D-216.
 */
import { Fragment, type ReactNode } from "react";
import { Link as RACLink } from "react-aria-components/Link";
import { Button as RACButton } from "react-aria-components/Button";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { ChevronLeft } from "../../icons";
import { useMessages } from "../../provider/SocleProvider";
import { ActionBar, type Action } from "../../patterns/ActionBar/ActionBar";
import { Badge, type StatusTone } from "../../components/Badge/Badge";
import { Skeleton, SkeletonGroup } from "../../components/Skeleton/Skeleton";
import { PageColumn, PageEmptyState, PageError, PageSection, PageSkeleton, type PageEmpty, type PageWidth } from "../Page/Page";

export interface DetailPageBack {
  /** Nom de la vue principale où mène le lien : « Demandes ». */
  label: string;
  onPress?: () => void;
  href?: string;
}

export interface DetailPageProps {
  /** Nom de l'élément, en `h1` (D-212). Facultatif pendant le chargement. */
  title?: string;
  /** Lien de retour vers la vue principale (D-211). */
  back?: DetailPageBack;
  /** Statut, en `Badge` après le titre. */
  status?: { label: string; tone?: StatusTone };
  /** Éléments de la ligne de méta, séparés par « · ». */
  meta?: ReadonlyArray<ReactNode>;
  /** Actions sur l'élément, zone `header` (D-111). */
  actions?: ReadonlyArray<Action>;
  onActionError?: (action: Action, error: unknown) => void;
  onActionDone?: (action: Action) => void;
  /** Défaut `text` : colonne de 760 px centrée ; `full` : toute la largeur (D-214). */
  width?: PageWidth;
  /** État de la page (D-215). */
  state?: "ready" | "loading" | "error" | "not-found";
  onRetry?: () => void;
  /** État `not-found` : titre, phrase, action (zone `empty`). */
  notFound?: PageEmpty;
  /** Les sections : `DetailPage.Section`. */
  children?: ReactNode;
}

const BACK = "inline-flex items-center gap-0.5 -ml-0.5 mb-1.5 rounded-sm px-0.5 text-sm text-fg-2 no-underline data-hovered:text-fg data-hovered:underline " + focusRing;

function BackLink({ back }: { back: DetailPageBack }) {
  const m = useMessages();
  const inner = (
    <>
      <ChevronLeft size={14} />
      {back.label}
    </>
  );
  const common = { "aria-label": m.backTo(back.label), ...(back.onPress ? { onPress: back.onPress } : {}) };
  return back.href !== undefined ? (
    <RACLink href={back.href} {...common} className={BACK}>
      {inner}
    </RACLink>
  ) : (
    <RACButton {...common} className={cx(buttonReset, BACK)}>
      {inner}
    </RACButton>
  );
}

/** Élément ouvert : en-tête fixe, sections séparées par des traits (D-210). */
export function DetailPage({
  title,
  back,
  status,
  meta,
  actions,
  onActionError,
  onActionDone,
  width = "text",
  state = "ready",
  onRetry,
  notFound,
  children,
}: DetailPageProps) {
  const m = useMessages();
  const ready = state === "ready";
  const showTitle = title !== undefined && title !== "";
  const content =
    state === "loading" ? (
      <PageSkeleton divided />
    ) : state === "error" ? (
      <div className="py-(--pad)">
        <PageError onRetry={onRetry} />
      </div>
    ) : state === "not-found" ? (
      <div className="py-(--pad)">
        <PageEmptyState empty={notFound ?? { title: m.notFoundTitle }} />
      </div>
    ) : (
      children
    );
  return (
    <div className="socle-detail-page flex h-full min-h-0 flex-col bg-surface font-sans text-md text-fg">
      <header className="shrink-0 border-b border-line">
        <PageColumn width={width} layout="pt-(--pad) pb-[calc(var(--pad)-2px)]">
          {back && <BackLink back={back} />}
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              {showTitle ? (
                <>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <h1 className="m-0 text-xl leading-tight font-heading [overflow-wrap:anywhere] text-fg">{title}</h1>
                    {status && ready && <Badge tone={status.tone ?? "neutral"}>{status.label}</Badge>}
                  </div>
                  {meta && meta.length > 0 && ready && (
                    <p className="m-0 mt-1 flex flex-wrap items-center text-sm text-fg-2">
                      {meta.map((item, i) => (
                        <Fragment key={i}>
                          {i > 0 && (
                            <span aria-hidden className="mx-1.5 text-fg-3">
                              ·
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">{item}</span>
                        </Fragment>
                      ))}
                    </p>
                  )}
                </>
              ) : state === "loading" ? (
                <SkeletonGroup>
                  <div className="flex flex-col gap-2 py-1">
                    <Skeleton width="55%" height={16} />
                    <Skeleton width="35%" />
                  </div>
                </SkeletonGroup>
              ) : null}
            </div>
            {ready && actions && actions.length > 0 && (
              <ActionBar
                actions={actions}
                zone="header"
                {...(title ? { subject: title } : {})}
                {...(onActionError ? { onError: onActionError } : {})}
                {...(onActionDone ? { onDone: onActionDone } : {})}
              />
            )}
          </div>
        </PageColumn>
      </header>
      <div data-page-content className="min-h-0 flex-1 overflow-auto">
        <PageColumn width={width} layout="[&>section]:py-5 [&>section+section]:border-t [&>section+section]:border-line">
          {content}
        </PageColumn>
      </div>
    </div>
  );
}

DetailPage.Section = PageSection;
