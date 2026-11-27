import type { ReactNode } from "react";

/** Icône d'exemple pour les stories (une app fournit ses propres icônes, D-011). */
export const Copy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <rect x="8" y="8" width="13" height="13" rx="2" />
    <path d="M4 16V5a2 2 0 0 1 2-2h11" />
  </svg>
);
export const Doc = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
  </svg>
);
export const Folder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M3 6h7l2 2h9v11H3z" />
  </svg>
);
export const FolderOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M3 19V6h7l2 2h9v3" />
    <path d="M6 11h15l-3 8H3z" />
  </svg>
);

/* Icônes des recettes de pages (D-405) : tracés Lucide simplifiés, une app passe les siennes. */
const Icon = ({ children }: { children: ReactNode }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
);
export const Home = () => (
  <Icon>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </Icon>
);
export const Inbox = () => (
  <Icon>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </Icon>
);
export const Users = () => (
  <Icon>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 20a6.5 6.5 0 0 0-3-5.5" />
  </Icon>
);
export const Package = () => (
  <Icon>
    <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </Icon>
);
export const Activity = () => (
  <Icon>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </Icon>
);
export const Book = () => (
  <Icon>
    <path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2.5" />
    <path d="M6 21h14" />
  </Icon>
);
export const Mail = () => (
  <Icon>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
);
export const Trash = () => (
  <Icon>
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </Icon>
);
export const Reply = () => (
  <Icon>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10a6 6 0 0 1 6 6v4" />
  </Icon>
);
export const CopyPlus = () => (
  <Icon>
    <rect x="8" y="8" width="13" height="13" rx="2" />
    <path d="M4 16V5a2 2 0 0 1 2-2h11M14.5 11.5v6M11.5 14.5h6" />
  </Icon>
);
