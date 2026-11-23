import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { LoginPage, type LoginPageProps } from "./LoginPage";

/* ---------- Logo et fournisseur génériques ---------- */

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" role="img" aria-label="Exemple">
    <rect width="40" height="40" rx="10" fill="currentColor" />
    <path d="M12 26 20 12l8 14z" fill="var(--surface)" />
  </svg>
);
const Key = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 9-9M17 6l3 3" />
  </svg>
);

const meta: Meta<LoginPageProps> = {
  title: "Gabarits/LoginPage",
  component: LoginPage,
  parameters: { layout: "fullscreen" },
  args: { onSubmit: fn(async () => {}) },
};
export default meta;
type Story = StoryObj<LoginPageProps>;

const fill = async (c: ReturnType<typeof within>, id = "camille@exemple.fr", pw = "secret-123") => {
  await userEvent.type(c.getByLabelText(/Adresse e-mail ou identifiant/), id);
  await userEvent.type(c.getByLabelText(/^Mot de passe/), pw);
};

/** Identifiant, mot de passe, bouton plein ; Entrée envoie. */
export const Default: Story = {
  args: { onSubmit: fn(async () => {}) },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { level: 1, name: "Connexion" })).toBeVisible();
    const id = c.getByLabelText(/Adresse e-mail ou identifiant/);
    const pw = c.getByLabelText(/^Mot de passe/);
    await expect(id).toHaveAttribute("autocomplete", "username");
    await expect(pw).toHaveAttribute("autocomplete", "current-password");
    await expect(pw).toHaveAttribute("type", "password");
    // Libellés visibles, pas de texte indicatif à leur place.
    await expect(id).not.toHaveAttribute("placeholder");
    // Afficher le mot de passe : bascule, le champ passe en texte.
    const toggle = c.getByRole("button", { name: "Afficher le mot de passe" });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(pw).toHaveAttribute("type", "text");
    await userEvent.click(toggle);
    await expect(pw).toHaveAttribute("type", "password");
    await fill(c);
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledWith({ identifier: "camille@exemple.fr", password: "secret-123", remember: false }));
  },
};

/** Logo, sous-titre, fournisseurs d'identité, case et lien « Mot de passe oublié ? ». */
export const AvecLogoEtSSO: Story = {
  args: {
    logo: <Logo />,
    subtitle: "Accédez à votre espace de travail.",
    showRemember: true,
    forgotHref: "#mot-de-passe",
    providers: [{ label: "Continuer avec l'annuaire", icon: <Key />, onPress: fn() }],
    onSubmit: fn(async () => {}),
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("img", { name: "Exemple" })).toBeVisible();
    await expect(c.getByText("Accédez à votre espace de travail.")).toBeVisible();
    const group = c.getByRole("group", { name: "Autres moyens de connexion" });
    await userEvent.click(within(group).getByRole("button", { name: "Continuer avec l'annuaire" }));
    await expect(args.providers?.[0]?.onPress).toHaveBeenCalled();
    await expect(c.getByText("ou")).toBeVisible();
    await expect(c.getByRole("link", { name: "Mot de passe oublié ?" })).toHaveAttribute("href", "#mot-de-passe");
    await fill(c);
    await userEvent.click(c.getByRole("checkbox", { name: "Se souvenir de moi" }));
    await userEvent.click(c.getByRole("button", { name: "Se connecter" }));
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledWith({ identifier: "camille@exemple.fr", password: "secret-123", remember: true }));
  },
};

/** Échec : un seul message en haut du panneau, focalisé ; les champs gardent leurs valeurs. */
export const ErreurApresEnvoi: Story = {
  args: { onSubmit: fn(async () => ({ error: "Identifiant ou mot de passe incorrect." })) },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await fill(c);
    await userEvent.click(c.getByRole("button", { name: "Se connecter" }));
    const alert = await c.findByRole("alert");
    await expect(alert).toHaveTextContent("Identifiant ou mot de passe incorrect.");
    await waitFor(() => expect(alert).toHaveFocus());
    await expect(c.getByLabelText(/Adresse e-mail ou identifiant/)).toHaveValue("camille@exemple.fr");
    await expect(c.getByLabelText(/^Mot de passe/)).toHaveValue("secret-123");
    // Aucune erreur de champ : la page ne dit pas lequel est faux.
    await expect(c.getByLabelText(/Adresse e-mail ou identifiant/)).not.toHaveAttribute("aria-invalid");
    await expect(c.getByLabelText(/^Mot de passe/)).not.toHaveAttribute("aria-invalid");
    // Second échec : le focus revient sur le message.
    c.getByLabelText(/^Mot de passe/).focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(c.getByRole("alert")).toHaveFocus());
    await expect(c.getAllByRole("alert")).toHaveLength(1);
  },
};

/** Exception levée par onSubmit : message générique. */
export const Exception: Story = {
  args: { onSubmit: fn(async () => Promise.reject(new Error("réseau"))) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await fill(c);
    await userEvent.click(c.getByRole("button", { name: "Se connecter" }));
    await expect(await c.findByRole("alert")).toHaveTextContent("La connexion a échoué. Réessayez.");
  },
};

/** Envoi en cours : roue dans le bouton, second envoi ignoré, formulaire occupé. */
export const EnvoiEnCours: Story = {
  args: { onSubmit: fn(() => new Promise<void>(() => {})) },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await fill(c);
    const button = c.getByRole("button", { name: "Se connecter" });
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute("data-pending"));
    await expect(canvasElement.querySelector("form")).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    await userEvent.keyboard("{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};

/** Champs vides : message sous chaque champ vide, focus sur le premier, rien n'est envoyé. */
export const ChampsVides: Story = {
  args: { onSubmit: fn(async () => {}) },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Se connecter" }));
    await expect(c.getByText("Saisissez votre adresse e-mail ou votre identifiant.")).toBeVisible();
    await expect(c.getByText("Saisissez votre mot de passe.")).toBeVisible();
    await expect(c.getByLabelText(/Adresse e-mail ou identifiant/)).toHaveFocus();
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await expect(c.queryByRole("alert")).toBeNull();
    // Le message disparaît dès que le champ change.
    await userEvent.type(c.getByLabelText(/Adresse e-mail ou identifiant/), "camille");
    await expect(c.queryByText("Saisissez votre adresse e-mail ou votre identifiant.")).toBeNull();
    await userEvent.keyboard("{Enter}");
    await expect(c.getByLabelText(/^Mot de passe/)).toHaveFocus();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** Mobile : le panneau prend toute la largeur moins 16 px de chaque côté. */
export const Mobile: Story = {
  render: (args) => (
    <div style={{ width: 360 }}>
      <LoginPage {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole("region", { name: "Connexion" });
    const page = section.parentElement as HTMLElement;
    const a = section.getBoundingClientRect();
    const b = page.getBoundingClientRect();
    await expect(a.left - b.left).toBe(16);
    await expect(b.right - a.right).toBe(16);
  },
};
