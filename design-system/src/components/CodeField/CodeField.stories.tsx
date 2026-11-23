import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { CodeField, type CodeFieldProps } from "./CodeField";

const meta: Meta<typeof CodeField> = {
  title: "Composants/Champs/CodeField",
  component: CodeField,
  parameters: { layout: "padded" },
  args: { label: "Code de vérification", description: "Le code envoyé par SMS au 06 •• •• •• 42.", isRequired: true },
};
export default meta;
type Story = StoryObj<typeof CodeField>;

/** Cases dessinées, dans l'ordre ; le texte de chaque case. */
const cells = (input: HTMLElement) => Array.from(input.parentElement!.querySelector("[aria-hidden]")!.children) as HTMLElement[];
const shown = (input: HTMLElement) => cells(input).map((c) => c.textContent).join("");
const active = (input: HTMLElement) => cells(input).findIndex((c) => c.hasAttribute("data-active"));

/** Un seul vrai champ : `one-time-code`, clavier numérique, 6 cases par défaut (D-363). */
export const ParDefaut: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Code de vérification" });
    await expect(canvasElement.querySelectorAll("input")).toHaveLength(1);
    await expect(input).toHaveAttribute("autocomplete", "one-time-code");
    await expect(input).toHaveAttribute("inputmode", "numeric");
    await expect(input).toHaveAttribute("maxlength", "6");
    await expect(cells(input)).toHaveLength(6);
    await expect(input).toHaveAccessibleDescription("Le code envoyé par SMS au 06 •• •• •• 42.");
    // Le champ, transparent, couvre les cases : un clic sur une case l'atteint.
    const box = input.getBoundingClientRect();
    const first = cells(input)[0]!.getBoundingClientRect();
    const last = cells(input)[5]!.getBoundingClientRect();
    await expect(getComputedStyle(input).opacity).toBe("0");
    await expect([box.left, box.top, box.right, box.bottom]).toEqual([first.left, first.top, last.right, last.bottom]);
    await userEvent.click(input);
    await expect(input).toHaveFocus();
    await expect(active(input)).toBe(0);
  },
};

/** Chaque chiffre remplit la case active et avance ; une lettre est ignorée ; « 3 sur 6 » est lu poliment. */
export const Saisie: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await userEvent.click(input);
    await userEvent.keyboard("4a81");
    await expect(input).toHaveValue("481");
    await expect(shown(input)).toBe("481");
    await expect(active(input)).toBe(3);
    const live = canvasElement.querySelector('[aria-live="polite"]')!;
    await waitFor(() => expect(live).toHaveTextContent("3 sur 6"));
  },
};

/** Le collage remplit toutes les cases ; espaces et tirets sont ignorés ; `onComplete` reçoit le code. */
export const Collage: Story = {
  args: { onComplete: fn(), onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox");
    await userEvent.click(input);
    await userEvent.keyboard("9");
    await userEvent.paste("123 - 456");
    await expect(shown(input)).toBe("123456");
    await expect(args.onComplete).toHaveBeenCalledTimes(1);
    await expect(args.onComplete).toHaveBeenCalledWith("123456");
    await expect(args.onChange).toHaveBeenLastCalledWith("123456");
    await expect(active(input)).toBe(5);
  },
};

/** `onComplete` part quand la dernière case se remplit, et à chaque nouveau code complet. */
export const Complet: Story = {
  args: { onComplete: fn(), length: 4 },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox");
    await userEvent.click(input);
    await userEvent.keyboard("123");
    await expect(args.onComplete).not.toHaveBeenCalled();
    await userEvent.keyboard("4");
    await expect(args.onComplete).toHaveBeenCalledWith("1234");
    // Code plein : la frappe remplace la dernière case.
    await userEvent.keyboard("7");
    await expect(args.onComplete).toHaveBeenLastCalledWith("1237");
    await expect(args.onComplete).toHaveBeenCalledTimes(2);
  },
};

/** Retour arrière : efface la case active si elle est remplie, sinon la précédente, et recule. */
export const RetourArriere: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await userEvent.click(input);
    await userEvent.keyboard("481");
    await userEvent.keyboard("{Backspace}");
    await expect(shown(input)).toBe("48");
    await expect(active(input)).toBe(2);
    await userEvent.keyboard("{Backspace}{Backspace}");
    await expect(shown(input)).toBe("");
    await expect(active(input)).toBe(0);
    // Code plein : le premier Retour arrière vide la dernière case, sans reculer.
    await userEvent.paste("123456");
    await userEvent.keyboard("{Backspace}");
    await expect(shown(input)).toBe("12345");
    await expect(active(input)).toBe(5);
    await userEvent.keyboard("{Backspace}");
    await expect(shown(input)).toBe("1234");
    await expect(active(input)).toBe(4);
  },
};

/** Flèches, Origine et Fin déplacent la case active ; jamais au-delà de la première case vide. */
export const Fleches: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await userEvent.click(input);
    await userEvent.keyboard("4812");
    await userEvent.keyboard("{Home}");
    await expect(active(input)).toBe(0);
    await userEvent.keyboard("9");
    await expect(shown(input)).toBe("9812");
    await expect(active(input)).toBe(1);
    await userEvent.keyboard("{End}");
    await expect(active(input)).toBe(4);
    await userEvent.keyboard("{ArrowRight}");
    await expect(active(input)).toBe(4);
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(active(input)).toBe(2);
    await userEvent.keyboard("{Delete}");
    await expect(shown(input)).toBe("982");
  },
};

/** Le code est vérifié à la fin ; l'app pose `error` et l'efface dès qu'un caractère est tapé (`onChange` non vide). */
function Verification(props: Partial<CodeFieldProps>) {
  const [error, setError] = useState<string>();
  return (
    <CodeField
      label="Code de vérification"
      isRequired
      {...props}
      {...(error ? { error } : {})}
      onChange={(v) => v && setError(undefined)}
      onComplete={(code) => {
        if (code !== "246810") setError("Ce code est incorrect. Vérifiez le dernier SMS reçu.");
      }}
    />
  );
}

/** Nouvelle erreur : l'erreur s'affiche sous les cases, le code se vide, le focus revient au début (D-363). */
export const ErreurVideLeCode: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Verification />
      <button type="button" className="w-fit">Ailleurs</button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox");
    await userEvent.click(input);
    await userEvent.paste("111111");
    await waitFor(() => expect(c.getByText("Ce code est incorrect. Vérifiez le dernier SMS reçu.")).toBeVisible());
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
    await expect(active(input)).toBe(0);
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("Ce code est incorrect. Vérifiez le dernier SMS reçu.");
    // La même erreur après un nouvel essai vide encore le code (l'app l'a effacée dans onChange).
    await userEvent.keyboard("2");
    await expect(c.queryByText(/incorrect/)).toBeNull();
    await userEvent.paste("222222");
    await waitFor(() => expect(c.getByText(/incorrect/)).toBeVisible());
    await expect(input).toHaveValue("");
    await userEvent.paste("246810");
    await expect(c.queryByText(/incorrect/)).toBeNull();
    await expect(input).toHaveValue("246810");
  },
};

/** `clearOnError={false}` : le code reste pour être corrigé. */
export const ErreurSansEffacer: Story = {
  render: () => <Verification clearOnError={false} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox");
    await userEvent.click(input);
    await userEvent.paste("111111");
    await waitFor(() => expect(c.getByText(/incorrect/)).toBeVisible());
    await expect(input).toHaveValue("111111");
  },
};

/** Code incomplet en quittant le champ : « Saisissez les 6 chiffres du code. » ; vide et obligatoire à l'envoi (D-132). */
export const Incomplet: Story = {
  render: (args) => (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
      <CodeField {...args} />
      <button type="submit" className="w-fit">Valider</button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox");
    await userEvent.click(c.getByRole("button", { name: "Valider" }));
    await waitFor(() => expect(c.getByText("Renseignez « Code de vérification ».")).toBeVisible());
    await expect(input).toHaveFocus();
    await userEvent.keyboard("12");
    await userEvent.tab();
    await waitFor(() => expect(c.getByText("Saisissez les 6 chiffres du code.")).toBeVisible());
    await expect(c.queryByText(/SMS au/)).not.toBeVisible();
    // Code complet : l'erreur disparaît.
    await userEvent.click(input);
    await userEvent.keyboard("{End}3456");
    await expect(c.queryByText("Saisissez les 6 chiffres du code.")).toBeNull();
  },
};

/** `alphanumeric` : lettres et chiffres, clavier texte ; ici 4 cases. */
export const Alphanumerique: Story = {
  args: { type: "alphanumeric", length: 4, label: "Code d'accès", description: "", onComplete: fn() },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox");
    await expect(input).toHaveAttribute("inputmode", "text");
    await expect(cells(input)).toHaveLength(4);
    await userEvent.click(input);
    await userEvent.keyboard("a-1B2");
    await expect(args.onComplete).toHaveBeenCalledWith("a1B2");
  },
};

/** Longueur bornée de 4 à 8 cases. */
export const Longueurs: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <CodeField label="Quatre cases" length={4} />
      <CodeField label="Huit cases" length={8} />
      <CodeField label="Trop long" length={12} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(cells(c.getByRole("textbox", { name: /Quatre/ }))).toHaveLength(4);
    await expect(cells(c.getByRole("textbox", { name: /Huit/ }))).toHaveLength(8);
    await expect(cells(c.getByRole("textbox", { name: /Trop long/ }))).toHaveLength(8);
  },
};

/** Lecture seule : le code se lit, ne change pas ; désactivé : opacité 40 %, hors de l'ordre de tabulation (D-131). */
export const Etats: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <CodeField label="Lecture seule" isReadOnly defaultValue="482913" />
      <CodeField label="Désactivé" isDisabled defaultValue="48" />
      <CodeField label="En erreur" error="Ce code a expiré. Demandez-en un nouveau." defaultValue="482913" clearOnError={false} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const ro = c.getByRole("textbox", { name: /Lecture seule/ });
    await expect(ro).toHaveAttribute("readonly");
    await userEvent.click(ro);
    await userEvent.keyboard("{Backspace}7");
    await userEvent.paste("111111");
    await expect(shown(ro)).toBe("482913");
    const off = c.getByRole("textbox", { name: /Désactivé/ });
    await expect(off).toBeDisabled();
    await expect(getComputedStyle(off.closest("[data-disabled]")!).opacity).toBe("0.4");
    // Erreur présente au chargement : affichée, le code n'est pas vidé.
    const err = c.getByRole("textbox", { name: /En erreur/ });
    await expect(err).toHaveValue("482913");
    await expect(c.getByText("Ce code a expiré. Demandez-en un nouveau.")).toBeVisible();
  },
};
