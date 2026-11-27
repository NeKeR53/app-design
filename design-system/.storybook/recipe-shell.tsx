/*
 * Cadre commun des recettes de pages (D-405) : une app factice avec sa sidebar, sa barre du haut et son panneau
 * de détail. Chaque recette remplit la zone `main`, les vues, les actions et le panneau.
 */
import type { ReactNode } from "react";
import { AppShell } from "../src/patterns/AppShell/AppShell";
import { Sidebar } from "../src/patterns/Sidebar/Sidebar";
import type { TabItem } from "../src/components/Tabs/Tabs";
import { Activity, Book, Home, Inbox, Package, Users } from "./story-icons";

export type RecipePage = "ventes" | "demandes" | "contacts" | "catalogue" | "suivi" | "documentation";

export interface RecipeShellProps {
  page: RecipePage;
  pageTitle: string;
  views?: TabItem[];
  activeView?: string;
  onViewChange?: (id: string) => void;
  onViewClose?: (id: string) => void;
  /** Slot `actions` de la barre du haut : une `ActionBar` de zone `topbar`. */
  actions?: ReactNode;
  detail?: ReactNode;
  detailWidth?: "default" | "form";
  detailExpandable?: boolean;
  isDetailOpen?: boolean;
  onDetailOpenChange?: (isOpen: boolean) => void;
  /** Demandes à trier : compteur de l'entrée « Demandes ». */
  queueCount?: number;
  children: ReactNode;
}

/** Efface ce que les stories ont mémorisé (sidebar, panneau, filtres) : chaque recette part du même état. */
export function resetStoredState() {
  for (const k of Object.keys(localStorage)) if (k.startsWith("storybook:")) localStorage.removeItem(k);
}

export function RecipeShell({ page, queueCount = 9, children, ...shell }: RecipeShellProps) {
  return (
    // L'AppShell occupe toute la fenêtre : on sort du cadre à marge des stories.
    <div className="fixed inset-0">
      <AppShell
        {...shell}
        sidebar={
          <Sidebar selectedId={page} onSelectionChange={() => undefined} account={<Sidebar.Account name="Camille Martin" detail="Administratrice" onSettings={() => undefined} />}>
            <Sidebar.Item id="ventes" icon={<Home />} label="Ventes" tabbar />
            <Sidebar.Item id="demandes" icon={<Inbox />} label="Demandes" {...(queueCount ? { count: queueCount } : {})} tabbar />
            <Sidebar.Item id="contacts" icon={<Users />} label="Contacts" tabbar />
            <Sidebar.Item id="catalogue" icon={<Package />} label="Catalogue" tabbar />
            <Sidebar.Item id="suivi" icon={<Activity />} label="Suivi" tabbar />
            <Sidebar.Item id="documentation" icon={<Book />} label="Documentation" />
          </Sidebar>
        }
      >
        {children}
      </AppShell>
    </div>
  );
}
