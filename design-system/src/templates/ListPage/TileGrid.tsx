/*
 * Grille de vignettes de ListPage (`layout="grid"`, D-414) : un catalogue, des documents.
 * Chaque élément est une vignette : aperçu 4:3 (image recadrée, ou icône du type de fichier), titre, sous-titre,
 * méta et statut. Mêmes états que List ; les flèches suivent la grille à l'écran (GridList `layout="grid"`).
 */
import type { ReactNode } from "react";
import type { Key, Selection } from "react-aria-components";
import { GridList, GridListItem } from "react-aria-components/GridList";
import { Checkbox } from "react-aria-components/Checkbox";
import { cx, insetFocusRing } from "../../lib/cx";
import { ErrorBanner, highlight, LoadError, NoResults, ReloadBar, type ResultsStateProps } from "../../lib/results";
import { Check, File, FileArchive, FileImage, FileText } from "../../icons";
import { useRowMenu } from "../../components/DropdownMenu/DropdownMenu";
import { Badge, type StatusTone } from "../../components/Badge/Badge";
import { ItemActions } from "../../components/List/List";
import { Skeleton as Bar, SkeletonGroup } from "../../components/Skeleton/Skeleton";
import { OverflowTooltip } from "../../components/Tooltip/OverflowTooltip";
import type { TableRowAction } from "../../components/Table/Table";

/** Aperçu d'un élément : une image, ou le type de fichier quand il n'y en a pas (D-414). */
export interface ListPageThumbnail {
  /** Adresse de l'image (`blob:`, `data:`, `https:`) : photo du produit, première page du document. */
  src?: string;
  /** Type de fichier, sans point : « pdf », « docx », « png ». Montré sur l'aperçu, sans image. */
  type?: string;
}

export interface TileData {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  status?: { label: string; tone: StatusTone };
  thumbnail?: ListPageThumbnail;
}

interface TileGridProps extends ResultsStateProps {
  label: string;
  items: TileData[];
  selectionMode?: "single" | "multiple";
  selectedKeys?: Iterable<Key>;
  onSelectionChange?: (keys: Set<Key>) => void;
  onAction?: (id: string) => void;
  itemActions?: (item: TileData) => TableRowAction[];
}

const IMAGE = /^(png|jpe?g|gif|webp|avif|svg|heic|bmp|tiff?)$/;
const TEXT = /^(pdf|docx?|odt|rtf|txt|md|pages)$/;
const ARCHIVE = /^(zip|rar|7z|tar|gz|tgz|bz2)$/;

/** Icône du type de fichier : texte, image, archive, ou fichier. */
function typeIcon(type: string | undefined) {
  const t = (type ?? "").toLowerCase().replace(/^\./, "");
  if (IMAGE.test(t)) return <FileImage />;
  if (TEXT.test(t)) return <FileText />;
  if (ARCHIVE.test(t)) return <FileArchive />;
  return <File />;
}

/** Aperçu 4:3 : l'image recadrée par le haut, ou l'icône du type et son nom en capitales. */
export function TilePreview({ thumbnail, size = "tile" }: { thumbnail: ListPageThumbnail | undefined; size?: "tile" | "row" }) {
  const type = thumbnail?.type?.replace(/^\./, "").slice(0, 5).toUpperCase();
  if (thumbnail?.src) return <img src={thumbnail.src} alt="" decoding="async" loading="lazy" draggable={false} className="block size-full object-cover object-top" />;
  // Ni image ni type (une photo qui manque) : l'aperçu reste vide, sans icône trompeuse.
  if (!type) return null;
  if (size === "row") return <span className="inline-grid size-full place-items-center text-fg-3 [&>svg]:size-5">{typeIcon(type)}</span>;
  return (
    <span className="flex size-full flex-col items-center justify-center gap-1.5 text-fg-3">
      <span className="[&>svg]:size-8">{typeIcon(type)}</span>
      {type && <span className="text-xs font-medium tracking-wide">{type}</span>}
    </span>
  );
}

export function TileGrid({ label, items, selectionMode = "single", selectedKeys, onSelectionChange, onAction, itemActions, isLoading, hasError, onRetry, searchTerms, onClearSearch }: TileGridProps) {
  const terms = searchTerms?.filter(Boolean) ?? [];
  const firstLoad = isLoading && items.length === 0;
  const empty = !isLoading && !hasError && items.length === 0 && terms.length > 0;
  // Clic droit ou appui long : le menu « … » de la vignette (D-066).
  const { rowMenuProps } = useRowMenu();

  const renderTile = (it: TileData) => (
    <GridListItem
      key={it.id}
      id={it.id}
      textValue={it.title}
      className={cx(
        "group/item relative flex min-w-0 cursor-default flex-col overflow-hidden rounded-lg border border-line bg-surface outline-none",
        "data-hovered:border-line-strong data-selected:border-line-strong data-selected:bg-selected",
        insetFocusRing,
      )}
    >
      <span aria-hidden data-tile-preview="" className="relative block aspect-[4/3] overflow-hidden border-b border-line bg-surface-side">
        <TilePreview thumbnail={it.thumbnail} />
      </span>
      {selectionMode === "multiple" && (
        <span className="absolute top-2 left-2">
          <Checkbox slot="selection" className="group/cb invisible inline-grid size-4 shrink-0 place-items-center rounded-sm border-[1.5px] border-fg-3 bg-surface text-accent-fg group-data-hovered/item:visible group-data-focus-visible/item:visible data-selected:visible data-selected:border-accent data-selected:bg-accent pointer-coarse:visible">
            {({ isSelected }) => isSelected && <Check size={12} />}
          </Checkbox>
        </span>
      )}
      {itemActions && (
        <span className="absolute top-1.5 right-1.5 rounded-md bg-surface">
          <ItemActions actions={itemActions(it).slice(0, 2)} />
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-0.5 px-3 pt-2 pb-2.5">
        <OverflowTooltip text={it.title} textClass="min-w-0 truncate font-medium text-fg">
          {highlight(it.title, terms)}
        </OverflowTooltip>
        {it.subtitle && (
          <OverflowTooltip text={it.subtitle} textClass="min-w-0 truncate text-sm text-fg-2">
            {highlight(it.subtitle, terms)}
          </OverflowTooltip>
        )}
        {(it.meta || it.status) && (
          <span className="mt-1 flex min-h-5 min-w-0 items-center gap-2 text-sm">
            {it.meta && <span className="min-w-0 flex-1 truncate text-fg-2 tabular-nums">{it.meta}</span>}
            {it.status && (
              <span className="ml-auto shrink-0">
                <Badge tone={it.status.tone}>{it.status.label}</Badge>
              </span>
            )}
          </span>
        )}
      </span>
    </GridListItem>
  );

  return (
    <div className="socle-box relative flex min-h-0 flex-1 flex-col font-sans text-md text-fg" {...rowMenuProps}>
      {isLoading && items.length > 0 && <ReloadBar />}
      {hasError && items.length > 0 && <ErrorBanner onRetry={onRetry} />}
      {hasError && items.length === 0 ? (
        <LoadError onRetry={onRetry} />
      ) : firstLoad ? (
        <TileSkeleton />
      ) : empty ? (
        <NoResults terms={terms} onClearSearch={onClearSearch} />
      ) : (
        <GridList
          aria-label={label}
          aria-busy={isLoading || undefined}
          layout="grid"
          selectionMode={selectionMode}
          selectionBehavior="replace"
          {...(selectedKeys ? { selectedKeys } : {})}
          {...(onSelectionChange ? { onSelectionChange: (k: Selection) => onSelectionChange(k === "all" ? new Set(items.map((i) => i.id)) : k) } : {})}
          {...(onAction ? { onAction: (k: Key) => onAction(String(k)) } : {})}
          data-tile-grid=""
          className="grid min-h-0 flex-1 auto-rows-max grid-cols-[repeat(auto-fill,minmax(200px,1fr))] content-start gap-3 overflow-auto p-1.5 outline-none"
        >
          {items.map(renderTile)}
        </GridList>
      )}
    </div>
  );
}

function TileSkeleton(): ReactNode {
  return (
    <SkeletonGroup delay={0}>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 p-1.5">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-lg border border-line">
            <span className="block aspect-[4/3] bg-surface-side" />
            <span className="flex flex-col gap-2 px-3 py-3">
              <Bar width={`${50 + ((i * 7) % 30)}%`} />
              <Bar width={`${30 + ((i * 3) % 15)}%`} />
            </span>
          </div>
        ))}
      </div>
    </SkeletonGroup>
  );
}
