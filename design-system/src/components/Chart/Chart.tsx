/*
 * Graphiques du socle : barres, lignes, petite courbe. SVG maison, aux tokens `--chart-*`. Spec : Chart.spec.md.
 * Décisions : D-428 (composant maison, pas de dépendance), D-429 (dessin), D-430 (accessibilité et clavier).
 */
import { useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cx, nativeFocusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";

/** Une série : un nom et une valeur par catégorie (`null` : pas de mesure). */
export interface ChartSeries {
  /** Identifiant stable. */
  id: string;
  /** Nom de la série : légende, info-bulle, tableau de données. */
  label: string;
  /** Une valeur par catégorie, dans l'ordre de `categories`. */
  values: ReadonlyArray<number | null>;
}

export type ChartType = "bar" | "line";
export type ChartSize = "sm" | "md";

export interface ChartProps {
  /** Barres (comparer des quantités) ou lignes (suivre une évolution). */
  type: ChartType;
  /** Nom accessible, qui résume ce que montre le graphique : « Commandes par semaine, de 212 à 312 ». */
  label: string;
  /** Les catégories de l'axe horizontal, dans l'ordre : semaines, jours, noms. */
  categories: ReadonlyArray<string>;
  /** De 1 à 8 séries. Couleurs `--chart-1` à `--chart-8`, dans l'ordre. Barres : 3 séries au plus. */
  series: ReadonlyArray<ChartSeries>;
  /** Formate une valeur (axe, étiquette, info-bulle, tableau). Défaut : nombre français (« 1 284 »). */
  formatValue?: (value: number) => string;
  /** Étiquette directe sur une valeur (une seule série) : la dernière (défaut), la plus haute, ou aucune. */
  highlight?: "last" | "max" | "none";
  /** Hauteur : `md` 232 px (défaut), `sm` 160 px. */
  size?: ChartSize;
}

const HEIGHT: Record<ChartSize, number> = { sm: 160, md: 232 };
const MAX_BAR = 24;
const MAX_BAR_SERIES = 3;
const defaultFormat = (v: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(v);

/** Pas « rond » (1, 2, 2,5, 5 × 10^k) pour environ quatre graduations. */
function niceTicks(min: number, max: number): number[] {
  if (min === max) max = min + 1;
  const raw = (max - min) / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((s) => s * pow >= raw) ?? 10) * pow;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v * 1e9) / 1e9);
  return out;
}

/** Largeur disponible, mesurée sans dépendre de la fenêtre. */
function useWidth(fallback: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = Math.floor(el.clientWidth);
      if (w > 0) setWidth(w);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

const color = (i: number) => `var(--chart-${(i % 8) + 1})`;

/** Barre au bout arrondi de 4 px, côté valeur (haut si positive, bas si négative). */
function barPath(x: number, w: number, y0: number, y1: number) {
  const h = Math.abs(y1 - y0);
  const r = Math.min(4, w / 2, h);
  if (h === 0) return "";
  if (y1 < y0) return `M${x},${y0} V${y1 + r} Q${x},${y1} ${x + r},${y1} H${x + w - r} Q${x + w},${y1} ${x + w},${y1 + r} V${y0} Z`;
  return `M${x},${y0} V${y1 - r} Q${x},${y1} ${x + r},${y1} H${x + w - r} Q${x + w},${y1} ${x + w},${y1 - r} V${y0} Z`;
}

/**
 * Graphique en barres ou en lignes (D-428 à D-430). Un seul arrêt de Tab ; les flèches passent d'une catégorie à
 * l'autre et l'info-bulle suit ; un tableau caché donne toutes les valeurs aux lecteurs d'écran.
 */
export function Chart({ type, label, categories, series: allSeries, formatValue = defaultFormat, highlight = "last", size = "md" }: ChartProps) {
  const m = useMessages();
  const descId = useId();
  const [box, width] = useWidth(480);
  const [active, setActive] = useState<number | null>(null);
  const series = type === "bar" ? allSeries.slice(0, MAX_BAR_SERIES) : allSeries.slice(0, 8);
  const height = HEIGHT[size];
  const n = categories.length;
  const all = series.flatMap((s) => s.values.filter((v): v is number => v != null));
  const hasData = n > 0 && all.length > 0;

  // Géométrie du tracé : un calcul court, refait à chaque rendu.
  const geo = (() => {
    const dataMin = Math.min(0, ...all);
    const dataMax = Math.max(0, ...all);
    const ticks = niceTicks(dataMin, dataMax);
    const lo = ticks[0] ?? 0;
    const hi = ticks[ticks.length - 1] ?? 1;
    const labelW = Math.max(...ticks.map((t) => formatValue(t).length)) * 6.5 + 8;
    const left = Math.ceil(labelW) + 6;
    const top = 18;
    const bottom = 22;
    const plotW = Math.max(1, width - left);
    const plotH = height - top - bottom;
    const y = (v: number) => top + plotH - ((v - lo) / (hi - lo || 1)) * plotH;
    const slot = plotW / Math.max(1, n);
    // Étiquettes de l'axe horizontal : une sur k, pour qu'elles ne se chevauchent pas.
    const catW = Math.max(...categories.map((c) => c.length), 1) * 6.5 + 10;
    const every = Math.max(1, Math.ceil(catW / slot));
    const cx = (i: number) => left + i * slot + slot / 2;
    return { ticks, left, top, plotW, plotH, y, slot, every, cx };
  })();

  const single = series.length === 1 ? series[0] : undefined;
  const highlightIndex = useMemo(() => {
    if (!single || highlight === "none") return -1;
    const vals = single.values;
    if (highlight === "max") {
      let best = -1;
      vals.forEach((v, i) => {
        if (v != null && (best < 0 || v > (vals[best] ?? -Infinity))) best = i;
      });
      return best;
    }
    for (let i = vals.length - 1; i >= 0; i--) if (vals[i] != null) return i;
    return -1;
  }, [single, highlight]);

  const describe = (i: number) =>
    `${categories[i]} : ${series.map((s) => `${series.length > 1 ? `${s.label} ` : ""}${s.values[i] == null ? "—" : formatValue(s.values[i]!)}`).join(", ")}`;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!hasData) return;
    const cur = active ?? (highlightIndex >= 0 ? highlightIndex : n - 1);
    const next = e.key === "ArrowRight" || e.key === "ArrowDown" ? Math.min(n - 1, active == null ? cur : cur + 1) : e.key === "ArrowLeft" || e.key === "ArrowUp" ? Math.max(0, active == null ? cur : cur - 1) : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : e.key === "Escape" ? null : undefined;
    if (next === undefined) return;
    e.preventDefault();
    setActive(next);
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.floor((e.clientX - r.left - geo.left) / geo.slot);
    setActive(i >= 0 && i < n ? i : null);
  };

  const groupW = Math.min(geo.slot * 0.7, MAX_BAR * series.length + 2 * (series.length - 1));
  const barW = series.length ? Math.min(MAX_BAR, (groupW - 2 * (series.length - 1)) / series.length) : 0;
  const zero = geo.y(0);

  const tipLeft = active != null ? Math.min(Math.max(geo.cx(active), 70), width - 70) : 0;
  // L'info-bulle se pose au-dessus de la plus haute valeur de la catégorie (barre ou point).
  const activeValues = active != null ? series.map((s) => s.values[active]).filter((v): v is number => v != null) : [];
  const tipTop = activeValues.length ? geo.y(Math.max(0, ...activeValues)) - 8 : geo.top;

  return (
    <div className="socle-chart min-w-0 font-sans">
      {series.length > 1 && (
        <ul aria-hidden className="m-0 mb-2 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-sm text-fg-2">
          {series.map((s, i) => (
            <li key={s.id} className="inline-flex items-center gap-1.5">
              <i className={cx("inline-block shrink-0", type === "bar" ? "size-2.5 rounded-xs" : "h-0.5 w-3 rounded-full")} style={{ background: color(i) }} />
              {s.label}
            </li>
          ))}
        </ul>
      )}
      <div
        ref={box}
        role="group"
        aria-label={label}
        aria-describedby={descId}
        tabIndex={hasData ? 0 : -1}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
        data-chart={type}
        className={cx("relative w-full rounded-sm", nativeFocusRing)}>
        {!hasData ? (
          <div className="flex items-center justify-center text-sm text-fg-3" style={{ height }}>
            {m.chartNoData}
          </div>
        ) : (
          <svg width={width} height={height} aria-hidden className="block overflow-visible" onPointerMove={onPointerMove} onPointerLeave={() => setActive(null)}>
            {geo.ticks.map((t) => (
              <g key={t}>
                <line x1={geo.left} x2={width} y1={geo.y(t)} y2={geo.y(t)} stroke={t === 0 ? "var(--line-strong)" : "var(--line)"} strokeWidth={1} shapeRendering="crispEdges" />
                <text x={geo.left - 8} y={geo.y(t) + 4} textAnchor="end" fontSize="var(--fs-xs)" fill="var(--fg-3)" className="tabular-nums">
                  {formatValue(t)}
                </text>
              </g>
            ))}
            {active != null && type === "bar" && <rect x={geo.left + active * geo.slot} y={geo.top - 6} width={geo.slot} height={geo.plotH + 6} fill="var(--hover)" rx={4} />}
            {active != null && type === "line" && <line x1={geo.cx(active)} x2={geo.cx(active)} y1={geo.top - 6} y2={geo.top + geo.plotH} stroke="var(--line-strong)" strokeWidth={1} shapeRendering="crispEdges" />}
            {categories.map((c, i) =>
              // Une étiquette sur k, comptée depuis la dernière : la catégorie la plus récente est toujours nommée.
              (n - 1 - i) % geo.every === 0 ? (
                <text key={`${c}-${i}`} x={geo.cx(i)} y={height - 6} textAnchor="middle" fontSize="var(--fs-xs)" fill={active === i ? "var(--fg)" : "var(--fg-3)"}>
                  {c}
                </text>
              ) : null,
            )}
            {type === "bar"
              ? series.map((s, si) =>
                  s.values.map((v, i) => {
                    if (v == null) return null;
                    const x = geo.cx(i) - groupW / 2 + si * (barW + 2) + (groupW - (barW * series.length + 2 * (series.length - 1))) / 2;
                    return <path key={`${s.id}-${i}`} d={barPath(x, barW, zero, geo.y(v))} fill={color(si)} />;
                  }),
                )
              : series.map((s, si) => {
                  // Une ligne par série ; un trou (`null`) coupe la ligne.
                  let d = "";
                  let open = false;
                  s.values.forEach((v, i) => {
                    if (v == null) {
                      open = false;
                      return;
                    }
                    d += `${open ? "L" : "M"}${geo.cx(i)},${geo.y(v)} `;
                    open = true;
                  });
                  return <path key={s.id} d={d} fill="none" stroke={color(si)} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />;
                })}
            {type === "line" &&
              active != null &&
              series.map((s, si) => {
                const v = s.values[active];
                return v == null ? null : <circle key={s.id} cx={geo.cx(active)} cy={geo.y(v)} r={3.5} fill={color(si)} stroke="var(--surface)" strokeWidth={2} />;
              })}
            {single && highlightIndex >= 0 && single.values[highlightIndex] != null && (
              <>
                {type === "line" && active !== highlightIndex && <circle cx={geo.cx(highlightIndex)} cy={geo.y(single.values[highlightIndex]!)} r={3} fill={color(0)} />}
                <text
                  x={geo.cx(highlightIndex)}
                  y={geo.y(Math.max(0, single.values[highlightIndex]!)) - 7}
                  textAnchor={type === "line" && highlightIndex === n - 1 ? "end" : "middle"}
                  fontSize="var(--fs-xs)"
                  fontWeight={600}
                  fill="var(--fg-2)"
                  className="tabular-nums">
                  {formatValue(single.values[highlightIndex]!)}
                </text>
              </>
            )}
          </svg>
        )}
        {active != null && hasData && (
          <div
            aria-hidden
            data-chart-tooltip=""
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-tip-line bg-tip-bg px-2 py-[3px] text-sm leading-[1.4] whitespace-nowrap text-tip-fg"
            style={{ left: tipLeft, top: tipTop }}>
            <span className="text-tip-fg-2">{categories[active]}</span>
            {series.map((s, si) => (
              <span key={s.id} className="ml-2 inline-flex items-center gap-1 tabular-nums">
                {series.length > 1 && <i className="inline-block size-2 rounded-xs" style={{ background: color(si) }} />}
                {s.values[active] == null ? "—" : formatValue(s.values[active]!)}
              </span>
            ))}
          </div>
        )}
        <span aria-live="polite" className="sr-only">
          {active != null && hasData ? describe(active) : ""}
        </span>
      </div>
      {/* Les valeurs, pour les lecteurs d'écran : un vrai tableau, caché à l'écran (D-430). */}
      <table id={descId} className="sr-only">
        <caption>{m.chartDataTable(label)}</caption>
        <thead>
          <tr>
            <th scope="col" />
            {series.map((s) => (
              <th key={s.id} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((c, i) => (
            <tr key={`${c}-${i}`}>
              <th scope="row">{c}</th>
              {series.map((s) => (
                <td key={s.id}>{s.values[i] == null ? "—" : formatValue(s.values[i]!)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface SparklineProps {
  /** Les valeurs, dans l'ordre du temps. Deux au moins. */
  values: ReadonlyArray<number>;
  /** Nom accessible : ce que montre la courbe, et son début et sa fin. */
  label: string;
  /**
   * Écrit la dernière valeur, avec son unité, à droite de la courbe (« 4,1 min »). Une courbe seule, hors de
   * `Card variant="metric"`, la donne toujours : sans valeur, elle décore sans informer (D-435).
   */
  formatValue?: (value: number) => string;
  /** Échelle depuis zéro, avec un trait de base : un écart de 10 % ne se dessine plus comme un saut (D-435). Défaut : du plus petit au plus grand. */
  fromZero?: boolean;
}

/** Petite courbe d'une seule série, sans axe ni interaction : la tendance d'un chiffre clé (D-429, D-435). */
export function Sparkline({ values, label, formatValue, fromZero = false }: SparklineProps) {
  const [box, width] = useWidth(160);
  const h = 32;
  const pad = 3;
  if (values.length < 2) return null;
  const lo = fromZero ? Math.min(0, ...values) : Math.min(...values);
  const hi = Math.max(...values);
  const x = (i: number) => pad + (i / (values.length - 1)) * (width - 2 * pad);
  const y = (v: number) => pad + (h - 2 * pad) * (1 - (v - lo) / (hi - lo || 1));
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const last = values.length - 1;
  const svg = (
    <svg role="img" aria-label={label} width={width} height={h} className="block overflow-visible">
      {fromZero && <line x1={0} x2={width} y1={y(0) + 0.5} y2={y(0) + 0.5} stroke="var(--line-strong)" strokeWidth={1} />}
      <path d={d} fill="none" stroke="var(--chart-1)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last)} cy={y(values[last]!)} r={2.5} fill="var(--chart-1)" />
    </svg>
  );
  if (!formatValue)
    return (
      <div ref={box} className="socle-sparkline w-full">
        {svg}
      </div>
    );
  return (
    <div className="socle-sparkline flex w-full items-center gap-3">
      <div ref={box} className="min-w-0 flex-1">
        {svg}
      </div>
      <span data-sparkline-value="" aria-hidden="true" className="shrink-0 text-sm font-medium text-fg tabular-nums">
        {formatValue(values[last]!)}
      </span>
    </div>
  );
}
