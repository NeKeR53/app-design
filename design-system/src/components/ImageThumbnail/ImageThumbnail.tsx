/*
 * Vignette d'image cliquable et galerie de vignettes (D-383). Spec : ImageThumbnail.spec.md.
 * Un clic ouvre la vue agrandie : une Modal `xl` avec DocumentViewer, et la suite d'images parcourue
 * avec précédente / suivante et ← →. Chargement, erreur et « Réessayer » dans la tuile.
 */
import { useEffect, useRef, useState } from "react";
import { Button as RACButton } from "react-aria-components/Button";
import { ChevronLeft, ChevronRight, ImageOff } from "../../icons";
import { buttonReset, cx, focusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { Button } from "../Button/Button";
import { DocumentViewer } from "../DocumentViewer/DocumentViewer";
import { EmptyState } from "../EmptyState/EmptyState";
import { IconButton } from "../IconButton/IconButton";
import { Modal } from "../Modal/Modal";
import { Skeleton, SkeletonGroup } from "../Skeleton/Skeleton";
import { OverflowTooltip } from "../Tooltip/OverflowTooltip";

/** `wide` : 360 px, 4:3, image entière ; `square` : 160 px, carrée, recadrée ; `page` : 160 px, 16:10, haut de l'image. */
export type ImageShape = "wide" | "square" | "page";

export interface ImageSource {
  /** Adresse de l'image (`blob:`, `data:`, `https:`). Absente : l'app la lit encore (chargement). */
  src?: string | undefined;
  /** Texte de remplacement, et titre de la vue agrandie : « maquette.png ». */
  alt: string;
  /** Légende sous la vignette, sur une ligne, coupée avec info-bulle. */
  caption?: string | undefined;
  /** État imposé par l'app : `loading` pendant qu'elle lit l'image, `error` si la lecture a échoué. */
  status?: "loading" | "error" | undefined;
  /** « Réessayer » : l'app relit l'image. Sans lui, seule une image qui ne s'affiche pas se réessaie. */
  onRetry?: (() => void) | undefined;
}

export interface ImageThumbnailProps extends ImageSource {
  /** Forme de la vignette. Défaut : `wide`. */
  shape?: ImageShape;
  /** « Télécharger » dans la vue agrandie ; l'app crée le fichier. */
  onDownload?: () => void;
}

const WIDTH: Record<ImageShape, string> = { wide: "w-90", square: "w-40", page: "w-40" };
const RATIO: Record<ImageShape, string> = { wide: "aspect-[4/3]", square: "aspect-square", page: "aspect-[16/10]" };
const FIT: Record<ImageShape, string> = { wide: "object-contain", square: "object-cover", page: "object-cover object-top" };
const TILE = "socle-box relative grid w-full place-items-center overflow-hidden rounded-md border border-line bg-surface-side";

/** Tuile de la vignette : chargement, image (bouton qui agrandit) ou erreur avec « Réessayer ». */
function ImageTile({ image, shape, onOpen }: { image: ImageSource; shape: ImageShape; onOpen: () => void }) {
  const m = useMessages();
  const { src, alt, status, onRetry } = image;
  const [failedSrc, setFailedSrc] = useState<string>();
  const [loadedSrc, setLoadedSrc] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const failed = status === "error" || (!!src && failedSrc === src);
  const loaded = !!src && loadedSrc === src && status !== "loading";

  if (failed) {
    // Une image qui ne s'affiche pas se réessaie toujours ; une lecture de l'app, si elle donne `onRetry`.
    const canRetry = status === "error" ? !!onRetry : true;
    return (
      <div className={cx(TILE, RATIO[shape])} data-image-state="error">
        <div className="flex flex-col items-center gap-1.5 p-2 text-center font-sans text-sm text-fg-2">
          <ImageOff aria-hidden />
          <span>{m.imageUnavailable}</span>
          {canRetry && (
            <Button
              size="sm"
              aria-label={m.imageRetry(alt)}
              onPress={() => {
                setFailedSrc(undefined);
                setAttempt((value) => value + 1);
                onRetry?.();
              }}
            >
              {m.retry}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const img = src && status !== "loading" && (
    <img
      key={`${src}:${attempt}`}
      ref={(el) => {
        // Image déjà en cache : `load` a pu passer avant le branchement de l'écouteur.
        if (el?.complete && el.naturalWidth > 0 && loadedSrc !== src) setLoadedSrc(src);
      }}
      src={src}
      alt={alt}
      decoding="async"
      referrerPolicy="no-referrer"
      onLoad={() => setLoadedSrc(src)}
      onError={() => setFailedSrc(src)}
      className={cx("block size-full", FIT[shape], !loaded && "opacity-0")}
    />
  );

  if (!loaded)
    return (
      <div className={cx(TILE, RATIO[shape])} data-image-state="loading">
        {img}
        <span className="absolute inset-0 [&>div]:size-full">
          <SkeletonGroup label={m.imageLoading(alt)}>
            <Skeleton shape="rect" width="100%" height="100%" />
          </SkeletonGroup>
        </span>
      </div>
    );

  return (
    <RACButton
      aria-label={m.imageEnlarge(alt)}
      onPress={onOpen}
      data-image-state="ready"
      className={cx(
        buttonReset,
        TILE,
        RATIO[shape],
        "cursor-zoom-in p-0 transition-colors duration-[var(--dur-fast)] ease-standard data-hovered:border-line-strong",
        focusRing,
      )}
    >
      {img}
    </RACButton>
  );
}

/** Vignette et sa légende, à la largeur de la forme (jamais plus large que son conteneur). */
function Thumb({ image, shape, onOpen }: { image: ImageSource; shape: ImageShape; onOpen: () => void }) {
  const tile = <ImageTile image={image} shape={shape} onOpen={onOpen} />;
  if (!image.caption) return <div className={cx("max-w-full", WIDTH[shape])}>{tile}</div>;
  return (
    <figure className={cx("socle-box m-0 flex max-w-full flex-col gap-1", WIDTH[shape])}>
      {tile}
      <figcaption className="flex min-w-0 font-sans text-sm text-fg-2">
        <OverflowTooltip text={image.caption} textClass="block min-w-0 truncate" />
      </figcaption>
    </figure>
  );
}

/** Le champ ou la zone qui défile en largeur garde ses flèches. */
function keepsArrows(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest("input, textarea, select, [contenteditable='true']")) return true;
  const zone = target.closest<HTMLElement>("[role='document']");
  return !!zone && zone.scrollWidth > zone.clientWidth;
}

/** Flèches du clavier dans toute la modale : le focus est d'abord sur le × de l'en-tête. */
function useArrowKeys(active: boolean, handler: (event: KeyboardEvent) => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!active) return;
    const listener = (event: KeyboardEvent) => ref.current(event);
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [active]);
}

interface ImageViewerProps {
  images: ReadonlyArray<ImageSource>;
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  onDownload?: ((index: number) => void) | undefined;
  /** L'image montrée n'a pas d'adresse : l'app la lit. */
  onView?: ((index: number) => void) | undefined;
}

/** Vue agrandie : Modal `xl`, DocumentViewer, et précédente · « n / N » · suivante dans le pied. */
function ImageViewer({ images, index, onIndex, onClose, onDownload, onView }: ImageViewerProps) {
  const m = useMessages();
  const at = Math.min(Math.max(index, 0), images.length - 1);
  const current = images[at]!;
  const several = images.length > 1;
  const go = (step: number) => {
    const next = at + step;
    if (next >= 0 && next < images.length) onIndex(next);
  };
  const missing = !current.src && current.status !== "error";
  const onViewRef = useRef(onView);
  onViewRef.current = onView;
  useEffect(() => {
    if (missing) onViewRef.current?.(at);
  }, [at, missing]);

  // À une borne, le bouton pressé se désactive : le focus passe à l'autre, sinon Échap ne fermerait plus.
  const nav = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const active = document.activeElement;
    const lost = !active || active === document.body || (active instanceof HTMLButtonElement && active.disabled);
    if (!lost || !nav.current) return;
    nav.current.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }, [at]);

  useArrowKeys(several, (event) => {
    if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (keepsArrows(event.target)) return;
    event.preventDefault();
    go(event.key === "ArrowLeft" ? -1 : 1);
  });

  return (
    <Modal
      isOpen
      onOpenChange={(open) => !open && onClose()}
      title={current.alt}
      size="xl"
      footer={
        several ? (
          <div ref={nav} className="flex items-center justify-center gap-1">
            <IconButton icon={<ChevronLeft />} label={m.imagePrevious} onPress={() => go(-1)} isDisabled={at === 0} />
            <span aria-live="polite" className="min-w-14 text-center font-sans text-sm text-fg-2 tabular-nums">
              {m.imagePosition(at + 1, images.length)}
            </span>
            <IconButton icon={<ChevronRight />} label={m.imageNext} onPress={() => go(1)} isDisabled={at === images.length - 1} />
          </div>
        ) : undefined
      }
    >
      <div className="flex h-full min-h-0 flex-col p-(--dlg-pad)" data-image-viewer="">
        {current.src && current.status !== "error" ? (
          <DocumentViewer
            key={current.src}
            label={current.alt}
            name={current.alt}
            src={current.src}
            height="fill"
            {...(onDownload ? { onDownload: () => onDownload(at) } : {})}
          />
        ) : current.status === "error" ? (
          <EmptyState
            size="compact"
            title={m.imageUnavailable}
            description={current.alt}
            {...(current.onRetry ? { action: <Button size="sm" aria-label={m.imageRetry(current.alt)} onPress={current.onRetry}>{m.retry}</Button> } : {})}
          />
        ) : (
          <SkeletonGroup label={m.imageLoading(current.alt)}>
            <Skeleton shape="rect" height={360} />
          </SkeletonGroup>
        )}
      </div>
    </Modal>
  );
}

/** Vignette d'image : un clic l'agrandit dans une Modal `xl` avec DocumentViewer (D-383). */
export function ImageThumbnail({ shape = "wide", onDownload, ...image }: ImageThumbnailProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Thumb image={image} shape={shape} onOpen={() => setOpen(true)} />
      {open && (
        <ImageViewer images={[image]} index={0} onIndex={() => {}} onClose={() => setOpen(false)} onDownload={onDownload ? () => onDownload() : undefined} />
      )}
    </>
  );
}

export interface ImageGalleryItem extends ImageSource {
  /** Identifiant stable de l'image. */
  id: string;
}

export interface ImageGalleryGroup {
  /** Identifiant stable du groupe. */
  id: string;
  /** Nom du groupe : « exemple.com ». Il nomme la liste et la tuile « + N ». */
  label: string;
  /** Images, de la plus ancienne à la plus récente. */
  images: ReadonlyArray<ImageGalleryItem>;
}

type GallerySource =
  | { images: ReadonlyArray<ImageGalleryItem>; groups?: never }
  | { groups: ReadonlyArray<ImageGalleryGroup>; images?: never };

export type ImageGalleryProps = GallerySource & {
  /** Nom de la galerie : « Captures de l'agent ». */
  label: string;
  /** Forme des vignettes. Défaut : `square`. */
  shape?: ImageShape;
  /** Vignettes visibles par groupe, les plus récentes ; les autres derrière « + N ». Défaut : toutes. */
  visible?: number;
  /** « Télécharger » dans la vue agrandie. */
  onDownload?: (image: ImageGalleryItem) => void;
  /** La vue agrandie montre une image sans `src` : l'app la lit, puis passe `src`. */
  onView?: (image: ImageGalleryItem) => void;
};

/** Galerie : vignettes en groupes, légendes, « + N » pour les plus anciennes ; ← → parcourent un groupe (D-383). */
export function ImageGallery(props: ImageGalleryProps) {
  const { label, shape = "square", visible, onDownload, onView } = props;
  const m = useMessages();
  const grouped = !!props.groups;
  const groups: ReadonlyArray<ImageGalleryGroup> = props.groups ?? [{ id: "", label, images: props.images ?? [] }];
  const [open, setOpen] = useState<{ group: string; index: number }>();
  const openGroup = open && groups.find((group) => group.id === open.group);

  const lists = groups
    .filter((group) => group.images.length)
    .map((group) => {
      const count = visible === undefined ? group.images.length : Math.max(0, Math.min(visible, group.images.length));
      const hidden = group.images.length - count;
      return (
        <ul key={group.id} aria-label={group.label} className="m-0 flex min-w-0 list-none flex-wrap items-start gap-2 p-0">
          {hidden > 0 && (
            <li className={cx("max-w-full", WIDTH[shape])}>
              <RACButton
                aria-label={m.imageMoreLabel(hidden, group.label)}
                onPress={() => setOpen({ group: group.id, index: hidden - 1 })}
                data-image-more=""
                className={cx(
                  buttonReset,
                  TILE,
                  RATIO[shape],
                  "cursor-default p-0 font-sans text-md text-fg-2 transition-colors duration-[var(--dur-fast)] ease-standard data-hovered:border-line-strong data-hovered:text-fg",
                  focusRing,
                )}
              >
                {m.imageMore(hidden)}
              </RACButton>
            </li>
          )}
          {group.images.slice(hidden).map((image, position) => (
            <li key={image.id} className="max-w-full min-w-0">
              <Thumb image={image} shape={shape} onOpen={() => setOpen({ group: group.id, index: hidden + position })} />
            </li>
          ))}
        </ul>
      );
    });
  if (!lists.length) return null;

  return (
    <>
      {grouped ? (
        <div role="group" aria-label={label} className="flex min-w-0 flex-wrap items-start gap-3">
          {lists}
        </div>
      ) : (
        lists[0]
      )}
      {open && openGroup && openGroup.images.length > 0 && (
        <ImageViewer
          images={openGroup.images}
          index={open.index}
          onIndex={(index) => setOpen({ group: openGroup.id, index })}
          onClose={() => setOpen(undefined)}
          onDownload={onDownload ? (index) => openGroup.images[index] && onDownload(openGroup.images[index]) : undefined}
          onView={onView ? (index) => openGroup.images[index] && onView(openGroup.images[index]) : undefined}
        />
      )}
    </>
  );
}
