/*
 * Images factices pour les stories : des « photos » de produits dessinées en SVG (adresses `data:`).
 * Contenu d'exemple, pas une couleur d'interface : une app montre ses vraies images.
 */

const BACKS = ["#e9eef6", "#f3ece4", "#e6f1ec", "#f1e8ef", "#eceaf5", "#f4f0e2", "#e4eef1", "#efe9e6"];
const INKS = ["#2f4b7c", "#8a5a2b", "#2e6b52", "#7a3e66", "#4b4590", "#7c6a1f", "#2b6170", "#6b4b3e"];

/** Une suspension, une applique, une lampe à poser ou un spot : quatre silhouettes simples. */
const SHAPES = [
  (ink: string) => `<line x1="160" y1="0" x2="160" y2="92" stroke="${ink}" stroke-width="3"/><path d="M104 150 Q160 70 216 150 Z" fill="${ink}"/><ellipse cx="160" cy="152" rx="40" ry="6" fill="#fff6d8"/>`,
  (ink: string) => `<rect x="146" y="60" width="28" height="120" rx="6" fill="${ink}"/><circle cx="160" cy="74" r="34" fill="none" stroke="${ink}" stroke-width="6"/>`,
  (ink: string) => `<rect x="150" y="96" width="20" height="96" fill="${ink}"/><rect x="118" y="188" width="84" height="12" rx="6" fill="${ink}"/><path d="M110 98 L130 52 L190 52 L210 98 Z" fill="${ink}" opacity="0.85"/>`,
  (ink: string) => `<rect x="96" y="40" width="128" height="10" rx="5" fill="${ink}"/><path d="M118 50 L132 120 L188 120 L202 50 Z" fill="${ink}" opacity="0.9"/><circle cx="160" cy="132" r="10" fill="#fff6d8"/>`,
];

/** Photo factice n° `i` (320 × 240). */
export function productImage(i: number): string {
  const back = BACKS[i % BACKS.length]!;
  const ink = INKS[(i * 3) % INKS.length]!;
  const shape = SHAPES[i % SHAPES.length]!(ink);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240"><rect width="320" height="240" fill="${back}"/><rect y="200" width="320" height="40" fill="#000" opacity="0.04"/>${shape}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Première page factice d'un document (320 × 240, haut de page) : titre et lignes de texte. */
export function pageImage(title: string): string {
  const lines = Array.from({ length: 7 }, (_, k) => `<rect x="36" y="${92 + k * 18}" width="${k % 3 === 2 ? 150 : 248}" height="7" rx="3" fill="#c9ced6"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240"><rect width="320" height="240" fill="#ffffff"/><text x="36" y="58" font-family="Helvetica, Arial, sans-serif" font-size="17" font-weight="700" fill="#1f2937">${title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>${lines}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
