import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState, type ReactNode } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Copy } from "../../../.storybook/story-icons";
import { Button } from "../../components/Button/Button";
import { Dialog } from "../../components/Dialog/Dialog";
import { Table } from "../../components/Table/Table";
import { createNotifications } from "../../components/Toast/notifications";
import { SocleProvider } from "../../provider/SocleProvider";
import { SettingsPage, filterGroups, type SettingsGroup } from "./SettingsPage";

const body = () => within(document.body);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const icon = (d: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);
const Sliders = () => icon("M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6");
const Bell = () => icon("M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0");
const Server = () => icon("M3 4h18v7H3zM3 13h18v7H3zM7 8h.01M7 17h.01");
const Users = () => icon("M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8");
const Key = () => icon("M15 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M11 11l8 8M16 16l2-2");

/** Données d'exemple ; `handlers` reçoit les appels pour les tests. */
function sampleGroups(h: Partial<Record<string, (...a: never[]) => unknown>> = {}, over: { envs?: boolean; loading?: boolean; error?: boolean } = {}): SettingsGroup[] {
  const call = (k: string) => (h[k] ?? (() => undefined)) as (...a: unknown[]) => unknown;
  const envs = over.envs === false ? [] : [
    { id: "prod", name: "Production", code: "prod", url: "https://app.exemple.fr", tags: [{ label: "Keycloak", tone: "success" as const }, { label: "Actif", tone: "success" as const }] },
    { id: "rec", name: "Recette", code: "rec", url: "https://recette.exemple.fr", tags: [{ label: "Certificat à renouveler", tone: "warning" as const }] },
    { id: "dev", name: "Développement local avec un nom très long qui passe à la ligne", code: "dev", url: "http://localhost:8080", tags: [{ label: "Hors ligne", tone: "neutral" as const }] },
  ];
  return [
    {
      id: "perso",
      categories: [
        {
          id: "general",
          label: "Général",
          icon: <Sliders />,
          keywords: ["apparence"],
          sections: [
            {
              id: "apparence",
              title: "Apparence",
              description: "S'applique à cet appareil.",
              settings: [
                {
                  type: "select",
                  id: "density",
                  label: "Densité",
                  description: "Quantité d'informations visibles à l'écran.",
                  value: "web",
                  options: [
                    { id: "web", label: "Confortable" },
                    { id: "desktop", label: "Compacte" },
                  ],
                  onChange: call("density"),
                },
                { type: "switch", id: "motion", label: "Animations réduites", description: "Coupe les animations, même si le système les autorise.", value: false, onChange: call("motion") },
                { type: "switch", id: "sounds", label: "Sons", description: "Un son bref à la fin d'une tâche longue.", value: true, onChange: call("sounds") },
              ],
            },
            {
              id: "refs",
              title: "Références",
              settings: [
                { type: "text", id: "prefix", label: "Préfixe des références", description: "Ajouté au début de chaque nouvelle référence.", value: "ACH-", width: "sm", onChange: call("prefix"), validate: (v) => (/^[A-Z0-9-]+$/.test(v) ? null : "Utilisez des majuscules, des chiffres et « - ».") },
                { type: "text", id: "mail", label: "Adresse de réponse", inputType: "email", value: "support@exemple.fr", onChange: call("mail") },
                { type: "info", id: "version", label: "Version", value: "2.4.1", isCode: true },
                { type: "action", id: "shortcuts", label: "Raccourcis clavier", description: "Liste de tous les raccourcis de l'app.", action: { id: "open", label: "Afficher", onPress: call("shortcuts") } },
                { type: "action", id: "reset", label: "Réinitialiser les préférences", description: "Revient aux réglages d'origine sur cet appareil.", action: { id: "reset", label: "Réinitialiser", danger: true, confirm: { title: "Réinitialiser les préférences ?", message: "Vos réglages d'affichage reviennent à leur valeur d'origine." }, onPress: call("reset") } },
              ],
            },
          ],
        },
        {
          id: "notif",
          label: "Notifications",
          icon: <Bell />,
          sections: [
            {
              id: "mail",
              title: "Par courriel",
              settings: [
                { type: "switch", id: "reminders", label: "Rappels par courriel", description: "Un message la veille de chaque échéance.", value: true, onChange: call("reminders") },
                { type: "switch", id: "digest", label: "Résumé hebdomadaire", description: "Le lundi matin, ce qui a changé la semaine passée.", value: false, onChange: call("digest") },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "admin",
      title: "Administration",
      categories: [
        {
          id: "env",
          label: "Environnements",
          icon: <Server />,
          keywords: ["serveur"],
          isLoading: Boolean(over.loading),
          hasError: Boolean(over.error),
          onRetry: call("retry"),
          sections: [
            {
              id: "list",
              title: "Environnements",
              description: "Les serveurs auxquels l'app peut se connecter.",
              actions: [{ id: "new", label: "Nouvel environnement", primary: true, onPress: call("newEnv") }],
              emptyMessage: "Aucun environnement.",
              settings: envs.map((e) => ({
                type: "item" as const,
                id: e.id,
                label: e.name,
                code: e.code,
                description: e.url,
                tags: e.tags,
                actions: [
                  { id: "copy", label: "Copier l'adresse", icon: <Copy />, onPress: call("copy") },
                  { id: "rename", label: "Renommer", onPress: call("rename") },
                  { id: "del", label: "Supprimer", danger: true, confirm: `Supprimer l'environnement « ${e.name} » ?`, onPress: call("delete") },
                ],
              })),
            },
            { id: "archived", title: "Archivés", emptyMessage: "Aucun environnement archivé.", settings: [] },
          ],
        },
        {
          id: "users",
          label: "Utilisateurs",
          icon: <Users />,
          sections: [
            {
              id: "table",
              title: "Utilisateurs",
              content: (
                <Table
                  label="Utilisateurs"
                  columns={[
                    { id: "name", label: "Nom" },
                    { id: "role", label: "Rôle", width: 200 },
                  ]}
                  rows={[
                    { id: "1", name: "Camille Martin", role: "Administratrice" },
                    { id: "2", name: "Noé Bernard", role: "Lecteur" },
                  ]}
                />
              ),
            },
          ],
        },
        { id: "keys", label: "Clés d'accès", icon: <Key />, sections: [{ id: "keys", title: "Clés d'accès", emptyMessage: "Aucune clé.", actions: [{ id: "newKey", label: "Nouvelle clé", primary: true, onPress: call("newKey") }] }] },
      ],
    },
  ];
}

const meta: Meta<typeof SettingsPage> = {
  title: "Gabarits/SettingsPage",
  component: SettingsPage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof SettingsPage>;

const Box = ({ children, width, height = 640 }: { children: ReactNode; width?: number; height?: number }) => (
  <div style={{ height, width: width ?? "100%" }} className="border border-line bg-surface">
    {children}
  </div>
);

/** Dans un `Dialog` `xl` : bureau et tablette (D-015, D-120). */
export const DansUneModale: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-4">
        <Button onPress={() => setOpen(true)}>Ouvrir les réglages</Button>
        <Dialog isOpen={open} onOpenChange={setOpen} title="Réglages" size="xl">
          <SettingsPage groups={sampleGroups()} footerLink={{ label: "Centre d'aide", href: "https://exemple.fr/aide" }} />
        </Dialog>
      </div>
    );
  },
  play: async () => {
    const dialog = await waitFor(() => body().getByRole("dialog", { name: "Réglages" }));
    await expect(within(dialog).getByRole("navigation", { name: "Rubriques des réglages" })).toBeInTheDocument();
    // Focus d'abord dans la recherche (D-125).
    await waitFor(() => expect(within(dialog).getByRole("combobox", { name: "Rechercher dans les réglages" })).toHaveFocus());
  },
};

/** En pleine page, dans la zone `main` (D-208). */
export const PleinePage: Story = {
  render: () => (
    <Box>
      <SettingsPage groups={sampleGroups()} footerLink={{ label: "Centre d'aide", href: "https://exemple.fr/aide" }} />
    </Box>
  ),
};

/** Navigation : rubrique courante, titre du contenu (D-201). */
export const Navigation: Story = {
  render: (args) => (
    <Box>
      <SettingsPage {...args} groups={sampleGroups()} />
    </Box>
  ),
  args: { onSelectionChange: fn() },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const nav = c.getByRole("navigation", { name: "Rubriques des réglages" });
    await userEvent.click(within(nav).getByRole("button", { name: "Notifications" }));
    await expect(args.onSelectionChange).toHaveBeenCalledWith("notif");
    await expect(within(nav).getByRole("button", { name: "Notifications" })).toHaveAttribute("aria-current", "page");
    await expect(c.getByRole("heading", { level: 2, name: "Notifications" })).toBeInTheDocument();
    await expect(within(nav).getByRole("group", { name: "Administration" })).toBeInTheDocument();
    // Retour à Général pour les autres stories (rubrique mémorisée, D-007).
    await userEvent.click(within(nav).getByRole("button", { name: "Général" }));
  },
};

/** Recherche : libellés de réglage, sans accents ; Entrée ouvre la première rubrique ; aucun résultat (D-202). */
export const Recherche: Story = {
  render: () => (
    <Box>
      <SettingsPage groups={sampleGroups()} />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const nav = c.getByRole("navigation", { name: "Rubriques des réglages" });
    const search = within(nav).getByRole("combobox", { name: "Rechercher dans les réglages" });
    await userEvent.type(search, "resume");
    await waitFor(() => expect(within(nav).queryByRole("button", { name: "Général" })).toBeNull());
    await expect(within(nav).getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");
    await expect(c.getByRole("heading", { level: 2, name: "Notifications" })).toBeInTheDocument();
    await userEvent.clear(search);
    await userEvent.type(search, "zzz");
    await waitFor(() => expect(within(nav).getByText("Aucune rubrique trouvée.")).toBeInTheDocument());
    await userEvent.clear(search);
    await waitFor(() => expect(within(nav).getByRole("button", { name: "Général" })).toBeInTheDocument());
    await userEvent.click(within(nav).getByRole("button", { name: "Général" }));
    // La règle seule : mots-clés et titres de section comptent aussi.
    await expect(filterGroups(sampleGroups(), "serveur").flatMap((g) => g.categories.map((x) => x.id))).toEqual(["env"]);
    await expect(filterGroups(sampleGroups(), "Archivés").flatMap((g) => g.categories.map((x) => x.id))).toEqual(["env"]);
  },
};

/** Interrupteur et liste : appliqués tout de suite ; texte : Entrée applique, Échap rétablit, erreur de format (D-204). */
export const ApplicationImmediate: Story = {
  render: (args) => {
    const handlers = args as unknown as Record<string, (...a: never[]) => unknown>;
    const groups = useMemo(() => sampleGroups(handlers), [handlers]);
    return (
      <Box>
        <SettingsPage groups={groups} selectedId="general" />
      </Box>
    );
  },
  args: { motion: fn(), density: fn(), prefix: fn(), mail: fn() } as never,
  play: async ({ canvasElement, args }) => {
    const h = args as unknown as Record<string, ReturnType<typeof fn>>;
    const c = within(canvasElement);
    const motion = c.getByRole("switch", { name: "Animations réduites" });
    await userEvent.click(motion);
    await expect(motion).toBeChecked();
    await expect(h.motion).toHaveBeenCalledWith(true);

    await userEvent.click(c.getByRole("button", { name: /Densité/ }));
    await userEvent.click(await waitFor(() => body().getByRole("option", { name: "Compacte" })));
    await expect(h.density).toHaveBeenCalledWith("desktop");

    const prefix = c.getByRole("textbox", { name: "Préfixe des références" });
    await userEvent.clear(prefix);
    await userEvent.type(prefix, "achat");
    await userEvent.keyboard("{Enter}");
    await expect(c.getByText("Utilisez des majuscules, des chiffres et « - ».")).toBeInTheDocument();
    await expect(h.prefix).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    await expect(prefix).toHaveValue("ACH-");
    await userEvent.clear(prefix);
    await userEvent.type(prefix, "CMD-{Enter}");
    await expect(h.prefix).toHaveBeenCalledWith("CMD-");

    const mail = c.getByRole("textbox", { name: "Adresse de réponse" });
    await userEvent.clear(mail);
    await userEvent.type(mail, "pas-une-adresse");
    await userEvent.tab();
    await expect(c.getByText("Saisissez une adresse de la forme nom@domaine.fr.")).toBeInTheDocument();
    await expect(h.mail).not.toHaveBeenCalled();
  },
};

/** Échec d'enregistrement : la valeur revient, un toast le dit (D-204). */
export const Echec: Story = {
  render: () => {
    const notifications = useMemo(() => createNotifications(), []);
    const groups = useMemo(() => sampleGroups({ sounds: () => wait(100).then(() => Promise.reject(new Error("Le serveur ne répond pas."))) }), []);
    return (
      <SocleProvider notifications={notifications} storageKey="storybook-echec">
        <Box>
          <SettingsPage groups={groups} selectedId="general" />
        </Box>
      </SocleProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const sounds = within(canvasElement).getByRole("switch", { name: "Sons" });
    await expect(sounds).toBeChecked();
    await userEvent.click(sounds);
    await expect(sounds).not.toBeChecked();
    await waitFor(() => expect(sounds).toBeChecked());
    await waitFor(() => expect(body().getByText("Le réglage n'a pas été enregistré.")).toBeInTheDocument());
    await expect(body().getByText("Le serveur ne répond pas.")).toBeInTheDocument();
  },
};

/** Réponses dans le désordre : un ancien échec ne rétablit pas une valeur dépassée (D-204). */
export const OrdreDesReponses: Story = {
  render: () => {
    const notifications = useMemo(() => createNotifications(), []);
    const groups = useMemo(() => {
      let calls = 0;
      // Premier envoi : échec lent ; les suivants : réussite rapide.
      const sounds = () => (++calls === 1 ? wait(300).then(() => Promise.reject(new Error("Délai dépassé."))) : wait(20));
      return sampleGroups({ sounds });
    }, []);
    return (
      <SocleProvider notifications={notifications} storageKey="storybook-ordre">
        <Box>
          <SettingsPage groups={groups} selectedId="general" />
        </Box>
      </SocleProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const sounds = within(canvasElement).getByRole("switch", { name: "Sons" });
    await expect(sounds).toBeChecked();
    await userEvent.click(sounds);
    await userEvent.click(sounds);
    await userEvent.click(sounds);
    await expect(sounds).not.toBeChecked();
    await waitFor(() => expect(body().getByText("Délai dépassé.")).toBeInTheDocument());
    await expect(sounds).not.toBeChecked();
  },
};

/** Réglage « action » : bouton secondaire ; danger confirmé (D-205). */
export const Action: Story = {
  render: (args) => {
    const handlers = args as unknown as Record<string, (...a: never[]) => unknown>;
    const groups = useMemo(() => sampleGroups(handlers), [handlers]);
    return (
      <Box>
        <SettingsPage groups={groups} selectedId="general" />
      </Box>
    );
  },
  args: { shortcuts: fn(), reset: fn() } as never,
  play: async ({ canvasElement, args }) => {
    const h = args as unknown as Record<string, ReturnType<typeof fn>>;
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Afficher" }));
    await expect(h.shortcuts).toHaveBeenCalledTimes(1);
    await userEvent.click(c.getByRole("button", { name: "Réinitialiser" }));
    const dialog = await waitFor(() => body().getByRole("alertdialog"));
    await expect(within(dialog).getByText("Réinitialiser les préférences ?")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Réinitialiser" }));
    await waitFor(() => expect(h.reset).toHaveBeenCalledTimes(1));
  },
};

/** Liste dans une section : code, étiquettes, une icône puis « … », danger confirmé ; section vide (D-206). */
export const Liste: Story = {
  render: (args) => {
    const handlers = args as unknown as Record<string, (...a: never[]) => unknown>;
    const groups = useMemo(() => sampleGroups(handlers), [handlers]);
    return (
      <Box>
        <SettingsPage groups={groups} selectedId="env" />
      </Box>
    );
  },
  args: { copy: fn(), delete: fn(), newEnv: fn() } as never,
  play: async ({ canvasElement, args }) => {
    const h = args as unknown as Record<string, ReturnType<typeof fn>>;
    const c = within(canvasElement);
    await expect(c.getByText("prod")).toBeInTheDocument();
    await expect(c.getByText("Keycloak")).toBeInTheDocument();
    await expect(c.getByText("Aucun environnement archivé.")).toBeInTheDocument();
    await userEvent.click(c.getByRole("button", { name: "Nouvel environnement" }));
    await expect(h.newEnv).toHaveBeenCalledTimes(1);
    const prod = c.getByRole("group", { name: "Actions sur Production" });
    await userEvent.click(within(prod).getByRole("button", { name: "Copier l'adresse" }));
    await expect(h.copy).toHaveBeenCalledTimes(1);
    await userEvent.click(within(prod).getByRole("button", { name: "Plus d'actions" }));
    await userEvent.click(await waitFor(() => body().getByRole("menuitem", { name: "Supprimer" })));
    const dialog = await waitFor(() => body().getByRole("alertdialog"));
    await expect(within(dialog).getByText("Supprimer l'environnement « Production » ?")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Supprimer" }));
    await waitFor(() => expect(h.delete).toHaveBeenCalledTimes(1));
  },
};

/** Contenu libre d'une section : une `Table` (D-200, D-207). */
export const ContenuLibre: Story = {
  render: () => (
    <Box>
      <SettingsPage groups={sampleGroups()} selectedId="users" />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("grid", { name: "Utilisateurs" })).toBeInTheDocument();
  },
};

/** Rubrique en chargement : squelettes ; en erreur : message et « Réessayer » (D-209). */
export const ChargementEtErreur: Story = {
  render: (args) => {
    const handlers = args as unknown as Record<string, (...a: never[]) => unknown>;
    return (
      <div className="flex flex-col gap-4">
        <Box height={420}>
          <SettingsPage groups={sampleGroups({}, { loading: true })} selectedId="env" />
        </Box>
        <Box height={420}>
          <SettingsPage groups={sampleGroups(handlers, { error: true })} selectedId="env" />
        </Box>
      </div>
    );
  },
  args: { retry: fn() } as never,
  play: async ({ canvasElement, args }) => {
    const h = args as unknown as Record<string, ReturnType<typeof fn>>;
    const c = within(canvasElement);
    await expect(c.getByRole("status", { name: "Chargement des réglages" })).toHaveAttribute("aria-busy", "true");
    await expect(c.getByRole("alert")).toHaveTextContent("Impossible de charger ces réglages");
    await userEvent.click(c.getByRole("button", { name: "Réessayer" }));
    await expect(h.retry).toHaveBeenCalledTimes(1);
  },
};

/** Sous 640 px de large : la liste, puis la rubrique avec « Retour » (D-015, D-208). */
export const PetiteLargeur: Story = {
  render: () => (
    <Box width={375} height={700}>
      <SettingsPage groups={sampleGroups()} />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.queryByRole("heading", { level: 2 })).toBeNull());
    await userEvent.click(c.getByRole("button", { name: "Environnements" }));
    await expect(c.queryByRole("navigation")).toBeNull();
    await expect(c.getByRole("heading", { level: 2, name: /Environnements/ })).toBeInTheDocument();
    await userEvent.click(c.getByRole("button", { name: "Retour aux rubriques" }));
    await expect(c.getByRole("navigation", { name: "Rubriques des réglages" })).toBeInTheDocument();
    await userEvent.click(c.getByRole("button", { name: "Général" }));
  },
};

/** Dans une modale, un réglage changé ne bloque pas le clic hors (D-208, D-122). */
export const ClicHorsModale: Story = {
  render: (args) => (
    <Dialog isOpen onOpenChange={args.onSelectionChange as unknown as (o: boolean) => void} title="Réglages" size="xl">
      <SettingsPage groups={sampleGroups()} selectedId="general" />
    </Dialog>
  ),
  args: { onSelectionChange: fn() },
  play: async ({ args }) => {
    const dialog = await waitFor(() => body().getByRole("dialog", { name: "Réglages" }));
    await userEvent.click(within(dialog).getByRole("switch", { name: "Sons" }));
    const overlay = dialog.parentElement!.parentElement!;
    await userEvent.pointer({ keys: "[MouseLeft]", target: overlay, coords: { clientX: 4, clientY: 4 } });
    await waitFor(() => expect(args.onSelectionChange).toHaveBeenCalledWith(false));
  },
};

