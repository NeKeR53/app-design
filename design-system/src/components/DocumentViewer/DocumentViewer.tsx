/*
 * Aperçu d'un document : PDF (pdf.js, fourni par l'app) ou image.
 * Spec : DocumentViewer.spec.md (D-310 à D-316, D-412). Repris de DocumentViewer d'Alfred.
 */
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { Toolbar } from "react-aria-components/Toolbar";
import { Download, FitWidth, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "../../icons";
import { cx } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { ActionBar, type Action } from "../../patterns/ActionBar/ActionBar";
import { Button } from "../Button/Button";
import { Separator } from "../Separator/Separator";
import { EmptyState } from "../EmptyState/EmptyState";
import { IconButton } from "../IconButton/IconButton";
import { Skeleton, SkeletonGroup } from "../Skeleton/Skeleton";
import { extensionOf, loadDocument, type DocumentData, type LoadedDocument } from "./documentSource";
import { DocumentError, openPdf, renderPdfPage, type PdfDocumentHandle, type PdfEngine, type PdfPageSize } from "./pdf";

type Source = { src: string; data?: never } | { data: DocumentData; src?: never };

export type DocumentViewerProps = Source & {
  /** Nom accessible du document : « Facture F-2026-114 ». */
  label: string;
  /** Nom du fichier : affiché dans la barre, il sert aussi à reconnaître le format. */
  name?: string;
  /** Type MIME, quand la source ne le dit pas. */
  type?: string;
  /** Charge pdf.js : `() => import("pdfjs-dist")`. Sans lui, un PDF est en erreur (D-311). */
  loadPdf?: () => Promise<PdfEngine>;
  /** Affiche « Télécharger » ; l'app crée le fichier (D-312). */
  onDownload?: () => void;
  /** Actions de l'app, à la fin de la barre (zone `toolbar`). */
  actions?: ReadonlyArray<Action>;
  /** `fixed` : hauteur bornée entre 360 et 720 px ; `fill` : remplit son conteneur flex. */
  height?: "fixed" | "fill";
  /** Page à montrer (PDF, à partir de 1) : à l'ouverture, puis à chaque nouvelle valeur, la zone y défile. Bornée au nombre de pages (D-412). */
  page?: number;
};

type Shown =
  | { state: "loading" }
  | { state: "failed"; kind: DocumentError["kind"] }
  | { state: "ready"; loaded: LoadedDocument; pdf?: { document: PdfDocumentHandle; sizes: PdfPageSize[] } };

/** Paliers de zoom (D-313). */
export const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4] as const;
const MIN = ZOOM_STEPS[0];
const MAX = ZOOM_STEPS[ZOOM_STEPS.length - 1]!;
const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));

const frame = (height: "fixed" | "fill") =>
  cx(
    "socle-box flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-surface font-sans text-fg",
    height === "fill" ? "min-h-0 flex-1" : "h-[min(720px,max(360px,calc(100dvh-200px)))]",
  );

export function DocumentViewer(props: DocumentViewerProps) {
  const { label, name, type, loadPdf, onDownload, actions = [], height = "fixed", page } = props;
  const m = useMessages();
  const sourceKey = props.src ?? props.data;
  const [attempt, setAttempt] = useState(0);
  const [shown, setShown] = useState<Shown>({ state: "loading" });
  const loadPdfRef = useRef(loadPdf);
  loadPdfRef.current = loadPdf;

  useEffect(() => {
    let active = true;
    const urls: string[] = [];
    let destroy: (() => void) | undefined;
    setShown({ state: "loading" });
    const source = props.data !== undefined ? { data: props.data } : { src: props.src };
    void (async (): Promise<Shown> => {
      let loaded: LoadedDocument;
      try {
        loaded = await loadDocument(source, { name, type, track: (url) => urls.push(url) });
      } catch {
        throw new DocumentError("read");
      }
      if (loaded.format !== "pdf") return { state: "ready", loaded };
      const pdf = await openPdf(loadPdfRef.current, loaded.bytes);
      destroy = pdf.destroy;
      return { state: "ready", loaded, pdf: { document: pdf.document, sizes: pdf.sizes } };
    })().then(
      (next) => {
        if (active) setShown(next);
        else destroy?.();
      },
      (cause: unknown) => {
        if (active) setShown({ state: "failed", kind: cause instanceof DocumentError ? cause.kind : "read" });
      },
    );
    return () => {
      active = false;
      destroy?.();
      for (const url of urls) URL.revokeObjectURL(url);
    };
    // `props.src`/`props.data` sont l'identité de la source ; `attempt` relance la lecture.
  }, [sourceKey, name, type, attempt]);

  const fileName = (shown.state === "ready" && shown.loaded.name) || name || label;

  if (shown.state !== "ready" || shown.loaded.format === null) {
    const message =
      shown.state === "loading" ? (
        <div className="flex flex-1 justify-center overflow-hidden bg-surface-side p-4">
          <SkeletonGroup label={m.readingDocument}>
            <Skeleton shape="rect" width={420} height={560} />
          </SkeletonGroup>
        </div>
      ) : (
        <div className="grid flex-1 place-items-center overflow-auto">
          {shown.state === "failed" ? (
            <EmptyState
              size="compact"
              title={m.documentUnreadable}
              description={
                { password: m.pdfPassword, invalid: m.pdfInvalid, unavailable: m.pdfUnavailable, read: m.documentReadFailed }[shown.kind]
              }
              action={<Button size="sm" onPress={() => setAttempt((a) => a + 1)}>{m.retry}</Button>}
            />
          ) : (
            <EmptyState
              size="compact"
              title={m.unsupportedFormat}
              description={m.unsupportedFormatText(describeKind(shown.loaded) || m.unknownFormat)}
              {...(onDownload ? { action: <Button size="sm" icon={<Download />} onPress={onDownload}>{m.download}</Button> } : {})}
            />
          )}
        </div>
      );
    return (
      <section className={frame(height)} aria-label={label}>
        <Bar position={fileName} onDownload={onDownload} actions={actions} subject={label} />
        {message}
      </section>
    );
  }
  return (
    <Viewer
      key={String(attempt)}
      frameClass={frame(height)}
      label={label}
      name={fileName}
      loaded={shown.loaded}
      pdf={shown.pdf}
      onDownload={onDownload}
      actions={actions}
      page={page}
    />
  );
}

function describeKind(loaded: LoadedDocument): string {
  const extension = extensionOf(loaded.name);
  return extension ? `.${extension}` : loaded.mime || "";
}

interface ZoomControls {
  percent: number;
  canOut: boolean;
  canIn: boolean;
  fit: boolean;
  out: () => void;
  in: () => void;
  toFit: () => void;
}

interface PageControls {
  current: number;
  total: number;
  go: (page: number) => void;
}

/** Barre d'outils (D-312). */
function Bar({
  position,
  onDownload,
  actions,
  subject,
  zoom,
  pages,
}: {
  position: string;
  onDownload: (() => void) | undefined;
  actions: ReadonlyArray<Action>;
  subject: string;
  zoom?: ZoomControls;
  pages?: PageControls;
}) {
  const m = useMessages();
  const sep = (
    <span className="flex h-4 items-center">
      <Separator orientation="vertical" />
    </span>
  );
  const end = onDownload !== undefined || actions.some((a) => !a.isHidden);
  return (
    // Toolbar React Aria : les flèches passent d'un contrôle à l'autre.
    <Toolbar aria-label={m.documentToolbar} className="flex h-(--bar-h) shrink-0 items-center gap-0.5 border-b border-line pr-1.5 pl-3 text-sm">
      <span aria-live="polite" className="mr-auto min-w-0 truncate text-fg-2 tabular-nums">
        {position}
      </span>
      {pages && (
        <>
          <IconButton icon={<ChevronLeft />} label={m.previousPage} isDisabled={pages.current <= 1} onPress={() => pages.go(pages.current - 1)} />
          <IconButton icon={<ChevronRight />} label={m.nextPage} isDisabled={pages.current >= pages.total} onPress={() => pages.go(pages.current + 1)} />
          {sep}
        </>
      )}
      {zoom && (
        <>
          <IconButton icon={<ZoomOut />} label={m.zoomOut} shortcut="Mod+-" isDisabled={!zoom.canOut} onPress={zoom.out} />
          <span className="min-w-12 text-center text-fg tabular-nums">{m.zoomPercent(zoom.percent)}</span>
          <IconButton icon={<ZoomIn />} label={m.zoomIn} shortcut="Mod+=" isDisabled={!zoom.canIn} onPress={zoom.in} />
          <IconButton icon={<FitWidth />} label={m.fitWidth} shortcut="Mod+0" isSelected={zoom.fit} onChange={zoom.toFit} />
          {end && sep}
        </>
      )}
      {onDownload && <IconButton icon={<Download />} label={m.download} onPress={onDownload} />}
      {actions.length > 0 && <ActionBar actions={actions} zone="toolbar" subject={subject} />}
    </Toolbar>
  );
}

function Viewer({
  frameClass,
  label,
  name,
  loaded,
  pdf,
  onDownload,
  actions,
  page,
}: {
  frameClass: string;
  label: string;
  name: string;
  loaded: Exclude<LoadedDocument, { format: null }>;
  pdf: { document: PdfDocumentHandle; sizes: PdfPageSize[] } | undefined;
  onDownload: (() => void) | undefined;
  actions: ReadonlyArray<Action>;
  page: number | undefined;
}) {
  const m = useMessages();
  const scroller = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [zoom, setZoom] = useState<"fit" | number>("fit");
  const [current, setCurrent] = useState(1);
  const [natural, setNatural] = useState<PdfPageSize>();

  // Largeur utile de la zone, pour « Ajuster à la largeur ».
  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const measure = () => {
      const style = getComputedStyle(element);
      const padding = Number.parseFloat(style.paddingLeft || "0") + Number.parseFloat(style.paddingRight || "0");
      setWidth(Math.max(0, Math.floor(element.clientWidth - padding)));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    let raf = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    });
    observer.observe(element);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  const widest = pdf ? Math.max(...pdf.sizes.map((s) => s.width)) : (natural?.width ?? 0);
  // Une image n'est jamais agrandie pour remplir la largeur ; une page de PDF, si (D-313).
  const fitScale = widest && width ? (loaded.format === "image" ? Math.min(1, width / widest) : width / widest) : 1;
  const scale = zoom === "fit" ? fitScale : zoom;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const ready = loaded.format !== "image" || natural !== undefined;

  // Un zoom par bouton garde en haut la page qui y était ; Ctrl+molette garde le point sous le pointeur.
  const anchorPage = useRef<number | undefined>(undefined);
  const wheelAnchor = useRef<{ x: number; y: number; ratio: number } | undefined>(undefined);
  const changeZoom = (next: "fit" | number) => {
    anchorPage.current = pdf ? current : undefined;
    setZoom(next);
  };
  const zoomBy = (direction: 1 | -1) => {
    const next =
      direction > 0 ? ZOOM_STEPS.find((s) => s > scale + 0.01) : [...ZOOM_STEPS].reverse().find((s) => s < scale - 0.01);
    if (next) changeZoom(next);
  };

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const previous = scaleRef.current;
      const next = clamp(previous * Math.exp(-event.deltaY * 0.0015));
      if (Math.abs(next - previous) < 0.001) return;
      const box = element.getBoundingClientRect();
      wheelAnchor.current = { x: event.clientX - box.left, y: event.clientY - box.top, ratio: next / previous };
      setZoom(next);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  useLayoutEffect(() => {
    const element = scroller.current;
    const wheel = wheelAnchor.current;
    wheelAnchor.current = undefined;
    if (element && wheel) {
      element.scrollLeft = (element.scrollLeft + wheel.x) * wheel.ratio - wheel.x;
      element.scrollTop = (element.scrollTop + wheel.y) * wheel.ratio - wheel.y;
      return;
    }
    const page = anchorPage.current;
    anchorPage.current = undefined;
    if (element && page) scrollToPage(element, page);
  }, [scale]);

  // Page courante : celle qui occupe le tiers haut de la zone (D-314).
  const trackPage = () => {
    const element = scroller.current;
    if (!element || !pdf) return;
    const limit = element.getBoundingClientRect().top + element.clientHeight / 3;
    let page = 1;
    for (const [index, child] of [...element.children].entries()) if (child.getBoundingClientRect().top <= limit) page = index + 1;
    setCurrent(page);
  };

  const goTo = (page: number) => {
    const element = scroller.current;
    if (!element || !pdf) return;
    const target = Math.min(pdf.sizes.length, Math.max(1, page));
    scrollToPage(element, target);
    setCurrent(target);
  };

  // Page demandée par l'app (D-412) : à l'ouverture, une fois la largeur connue (la place des pages en dépend),
  // puis à chaque nouvelle valeur. La même valeur ne fait pas défiler de nouveau : la lecture en cours est gardée.
  const wantedPage = useRef<number | undefined>(undefined);
  useLayoutEffect(() => {
    wantedPage.current = page;
  }, [page]);
  useLayoutEffect(() => {
    const wanted = wantedPage.current;
    if (!pdf || !width || wanted === undefined || !Number.isFinite(wanted)) return;
    wantedPage.current = undefined;
    goTo(Math.round(wanted));
    // `goTo` lit le dernier rendu : seules la page voulue, la largeur et l'échelle relancent le défilement.
  }, [page, pdf, width, scale]);

  // Ctrl/⌘ + « + », « − », « 0 » dans la visionneuse (D-313).
  const onKeyDown = (event: KeyboardEvent) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || !ready) return;
    if (event.key === "+" || event.key === "=") zoomBy(1);
    else if (event.key === "-" || event.key === "_") zoomBy(-1);
    else if (event.key === "0") changeZoom("fit");
    else return;
    event.preventDefault();
  };

  return (
    <section className={frameClass} aria-label={label} onKeyDown={onKeyDown}>
      <Bar
        position={pdf ? m.pageOf(current, pdf.sizes.length) : name}
        onDownload={onDownload}
        actions={actions}
        subject={label}
        {...(pdf ? { pages: { current, total: pdf.sizes.length, go: goTo } } : {})}
        zoom={{
          percent: Math.round(scale * 100),
          canOut: ready && scale > MIN + 0.01,
          canIn: ready && scale < MAX - 0.01,
          fit: zoom === "fit",
          out: () => zoomBy(-1),
          in: () => zoomBy(1),
          toFit: () => changeZoom("fit"),
        }}
      />
      <div
        ref={scroller}
        tabIndex={0}
        role="document"
        aria-label={pdf ? m.documentPages(label, pdf.sizes.length) : label}
        onScroll={pdf ? trackPage : undefined}
        className={cx(
          "flex min-h-0 flex-1 flex-col items-center-safe gap-3 overflow-auto overscroll-contain bg-surface-side p-4",
          "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus focus-visible:outline-solid",
        )}
      >
        {pdf?.sizes.map((size, index) => (
          <PdfPage key={index} document={pdf.document} number={index + 1} size={size} scale={scale} root={scroller} />
        ))}
        {loaded.format === "image" && (
          <img
            src={loaded.url}
            alt={label}
            decoding="async"
            className="h-auto max-w-none shrink-0"
            style={natural ? { width: Math.round(natural.width * scale) } : { maxWidth: "100%" }}
            onLoad={(event) => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
          />
        )}
      </div>
    </section>
  );
}

function scrollToPage(element: HTMLElement, page: number) {
  const target = element.children[page - 1];
  if (target) element.scrollTop += target.getBoundingClientRect().top - element.getBoundingClientRect().top - 16;
}

/** Une page : sa place est réservée ; elle n'est dessinée qu'à l'approche de la zone visible, puis à chaque zoom (D-314). */
function PdfPage({
  document,
  number,
  size,
  scale,
  root,
}: {
  document: PdfDocumentHandle;
  number: number;
  size: PdfPageSize;
  scale: number;
  root: RefObject<HTMLDivElement | null>;
}) {
  const m = useMessages();
  const holder = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const element = holder.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => setNear(entries.some((e) => e.isIntersecting)), {
      root: root.current,
      rootMargin: "600px 0px",
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [root]);

  useEffect(() => {
    const element = holder.current;
    if (!near || !element) return;
    let live = true;
    const render = renderPdfPage(document, number, scale);
    // Le dessin précédent reste jusqu'au nouveau : pas de clignotement pendant le zoom.
    render.promise.then(
      (canvas) => {
        if (live) element.replaceChildren(canvas);
      },
      () => undefined,
    );
    return () => {
      live = false;
      render.cancel();
    };
  }, [document, near, number, scale]);

  return (
    <div
      ref={holder}
      role="img"
      aria-label={m.pageNumber(number)}
      data-page={number}
      className="shrink-0 bg-paper shadow-sm [&>canvas]:block [&>canvas]:size-full"
      style={{ width: Math.floor(size.width * scale), height: Math.floor(size.height * scale) }}
    />
  );
}
