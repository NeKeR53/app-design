/**
 * Icônes internes de Socle (D-028). Elles servent uniquement aux composants
 * de Socle et ne sont pas exportées. Grille 24, trait `--icon-stroke`,
 * couleur `currentColor`. Tracés repris de Lucide (licence ISC).
 * Un thème d'organisation peut remplacer une icône par un tracé plein (D-338) :
 * le jeu arrive par le contexte `ThemeIconsContext`, posé par SocleProvider.
 */
import { createContext, useContext, type ReactNode, type SVGProps } from "react";

/** Noms des icônes internes ; un thème les cite pour les remplacer (`SocleTheme.icons`). */
export const ICON_NAMES = [
  "ChevronRight",
  "ChevronLeft",
  "ChevronDown",
  "ChevronsUpDown",
  "X",
  "Check",
  "Minus",
  "Plus",
  "Search",
  "MoreHorizontal",
  "PanelLeft",
  "Maximize",
  "Minimize",
  "ListDetail",
  "Settings",
  "ExternalArrow",
  "Lock",
  "AlertTriangle",
  "ArrowUp",
  "ArrowDown",
  "Bell",
  "CircleCheck",
  "CircleInfo",
  "CircleAlert",
  "ChevronUp",
  "Copy",
  "WrapText",
  "Clock",
  "ListX",
  "ArrowDownToLine",
  "Columns",
  "UnfoldVertical",
  "ZoomIn",
  "ZoomOut",
  "FitWidth",
  "Download",
  "Heading1",
  "Heading2",
  "Heading3",
  "Bold",
  "Italic",
  "CodeIcon",
  "LinkIcon",
  "ListOrdered",
  "TextQuote",
  "Eye",
  "EyeOff",
] as const;
export type IconName = (typeof ICON_NAMES)[number];

/** Jeu d'icônes du thème : `viewBox` commune et tracé plein par icône (D-338). */
export interface IconSet {
  viewBox: string;
  paths: Partial<Record<IconName, string>>;
}

/** Jeu d'icônes du thème actif ; null : tracés Lucide. */
export const ThemeIconsContext = createContext<IconSet | null>(null);

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function icon(paths: ReactNode, name: IconName) {
  function Icon({ size = 16, ...props }: IconProps) {
    const set = useContext(ThemeIconsContext);
    const d = set?.paths[name];
    if (d && set)
      return (
        <svg
          width={size}
          height={size}
          viewBox={set.viewBox}
          fill="currentColor"
          stroke="none"
          aria-hidden="true"
          focusable="false"
          className="shrink-0"
          data-icon-source="theme"
          {...props}
        >
          <path d={d} />
        </svg>
      );
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        style={{ strokeWidth: "var(--icon-stroke)" }}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className="shrink-0"
        {...props}
      >
        {paths}
      </svg>
    );
  }
  Icon.displayName = name;
  return Icon;
}

export const ChevronRight = icon(<path d="m9 18 6-6-6-6" />, "ChevronRight");
export const ChevronLeft = icon(<path d="m15 18-6-6 6-6" />, "ChevronLeft");
export const ChevronDown = icon(<path d="m6 9 6 6 6-6" />, "ChevronDown");
export const ChevronsUpDown = icon(<path d="m7 15 5 5 5-5M7 9l5-5 5 5" />, "ChevronsUpDown");
export const X = icon(<path d="M18 6 6 18M6 6l12 12" />, "X");
export const Check = icon(<path d="M20 6 9 17l-5-5" />, "Check");
export const Minus = icon(<path d="M5 12h14" />, "Minus");
export const Plus = icon(<path d="M5 12h14M12 5v14" />, "Plus");
export const Search = icon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </>,
  "Search",
);
export const MoreHorizontal = icon(
  <>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </>,
  "MoreHorizontal",
);
export const PanelLeft = icon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
  </>,
  "PanelLeft",
);
/** Icône du panneau de détail (liste). */
export const Maximize = icon(<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />, "Maximize");
export const Minimize = icon(<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />, "Minimize");
export const ListDetail = icon(<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />, "ListDetail");
export const Settings = icon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>,
  "Settings",
);
export const ExternalArrow = icon(<path d="M7 17 17 7M7 7h10v10" />, "ExternalArrow");
export const Lock = icon(
  <>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </>,
  "Lock",
);
export const AlertTriangle = icon(
  <>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </>,
  "AlertTriangle",
);
export const ArrowUp = icon(<path d="M12 19V5M5 12l7-7 7 7" />, "ArrowUp");
export const ArrowDown = icon(<path d="M12 5v14M19 12l-7 7-7-7" />, "ArrowDown");
/* Notifications (D-152, D-157) */
export const Bell = icon(
  <>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </>,
  "Bell",
);
export const CircleCheck = icon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </>,
  "CircleCheck",
);
export const CircleInfo = icon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </>,
  "CircleInfo",
);
export const CircleAlert = icon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </>,
  "CircleAlert",
);

/* Terminal et LogViewer (D-285) */
export const ChevronUp = icon(<path d="m18 15-6-6-6 6" />, "ChevronUp");
export const Copy = icon(
  <>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </>,
  "Copy",
);
export const WrapText = icon(<path d="M3 6h18M3 12h15a3 3 0 1 1 0 6h-4M16 16l-2 2 2 2M3 18h7" />, "WrapText");
export const Clock = icon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </>,
  "Clock",
);
export const ListX = icon(<path d="M11 12H3M16 6H3M16 18H3M19 10l-4 4M15 10l4 4" />, "ListX");
export const ArrowDownToLine = icon(<path d="M12 17V3M6 11l6 6 6-6M19 21H5" />, "ArrowDownToLine");
/** Deux colonnes : vue côte à côte (DiffView, D-291). */
export const Columns = icon(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M12 4v16" />
  </>,
  "Columns",
);
/** Lignes inchangées dépliées (DiffView, D-295). Lucide « unfold-vertical ». */
export const UnfoldVertical = icon(
  <path d="M12 22v-6M12 8V2M4 12H2M10 12H8M16 12h-2M22 12h-2M15 19l-3 3-3-3M15 5l-3-3-3 3" />,
  "UnfoldVertical",
);
/* DocumentViewer (D-312) */
export const ZoomIn = icon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3M8 11h6M11 8v6" />
  </>,
  "ZoomIn",
);
export const ZoomOut = icon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3M8 11h6" />
  </>,
  "ZoomOut",
);
export const FitWidth = icon(<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4" />, "FitWidth");
export const Download = icon(<path d="M12 4v11M7 10l5 5 5-5M5 20h14" />, "Download");

/* Markdown et MarkdownEditor (D-304, D-307) */
export const Heading1 = icon(<path d="M4 12h8M4 18V6M12 18V6M17 12l3-2v8" />, "Heading1");
export const Heading2 = icon(<path d="M4 12h8M4 18V6M12 18V6M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" />, "Heading2");
export const Heading3 = icon(
  <path d="M4 12h8M4 18V6M12 18V6M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2" />,
  "Heading3",
);
export const Bold = icon(<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />, "Bold");
export const Italic = icon(<path d="M19 4h-9M14 20H5M15 4 9 20" />, "Italic");
export const CodeIcon = icon(<path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />, "CodeIcon");
export const LinkIcon = icon(
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />,
  "LinkIcon",
);
export const ListOrdered = icon(<path d="M10 12h11M10 18h11M10 6h11M4 10h2M4 6h1v4M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />, "ListOrdered");
export const TextQuote = icon(<path d="M17 6H3M21 12H8M21 18H8M3 12v6" />, "TextQuote");
export const Eye = icon(
  <>
    <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
    <circle cx="12" cy="12" r="3" />
  </>,
  "Eye",
);
export const EyeOff = icon(
  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M9.88 9.88a3 3 0 1 0 4.24 4.24M2 2l20 20" />,
  "EyeOff",
);
