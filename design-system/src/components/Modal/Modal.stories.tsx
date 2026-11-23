import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Modal, type ModalSize } from "./Modal";
import { useConfirm, type ConfirmOptions } from "./useConfirm";
import { Button } from "../Button/Button";

const meta: Meta<typeof Modal> = {
  title: "Composants/Modal",
  component: Modal,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Modal>;
const body = () => within(document.body);
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/* ---------- Exemples (données factices génériques) ---------- */

const fieldClass = "h-(--row-h) rounded-md border border-line-strong bg-surface px-2.5 font-sans text-md text-fg";

function Fields() {
  return (
    <>
      <label className="flex flex-col gap-1">
        <span className="font-medium">Nom</span>
        <input className={fieldClass} placeholder="Ex. Atelier d'automne" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-medium">Description</span>
        <textarea className={`${fieldClass} h-20 py-2`} />
      </label>
    </>
  );
}

function Rows({ n }: { n: number }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {["Nom", "Responsable", "Échéance"].map((h) => (
            <th key={h} className="border-b border-line px-2 py-1.5 text-left text-sm font-medium text-fg-3">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: n }, (_, i) => (
          <tr key={i}>
            <td className="border-b border-line px-2 py-1.5">Projet importé {i + 1}</td>
            <td className="border-b border-line px-2 py-1.5">{["Camille Martin", "Sam Leroy", "Noa Petit"][i % 3]}</td>
            <td className="border-b border-line px-2 py-1.5">{(i % 28) + 1}/12/2026</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Une modale ouverte par un bouton, avec Annuler et une action. */
function Demo({
  size = "md",
  label = "Nouveau projet",
  title = "Nouveau projet",
  description = "Il sera visible par toute l'équipe.",
  children = <Fields />,
  busy = false,
  defaultOpen = false,
  extra,
}: {
  size?: ModalSize;
  label?: string;
  title?: string;
  description?: ReactNode;
  children?: ReactNode;
  busy?: boolean;
  defaultOpen?: boolean;
  extra?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <Button variant="primary" onPress={() => setOpen(true)}>
        {label}
      </Button>
      <Modal
        isOpen={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        size={size}
        isBusy={busy}
        footer={
          <>
            {extra}
            <Button onPress={() => setOpen(false)} isDisabled={busy}>
              Annuler
            </Button>
            <Button variant="primary" onPress={() => setOpen(false)} isPending={busy}>
              Créer
            </Button>
          </>
        }
      >
        {children}
      </Modal>
    </>
  );
}

async function openWith(canvasElement: HTMLElement, name: string) {
  const trigger = within(canvasElement).getByRole("button", { name });
  await userEvent.click(trigger);
  const dialog = await waitFor(() => body().getByRole("dialog"));
  return { trigger, dialog };
}

/* ---------- Stories d'apparence ---------- */

export const ParDefaut: Story = { render: () => <Demo defaultOpen /> };

/** Les quatre tailles (D-120) ; sur mobile, centrée ou plein écran (D-121). `xl` reçoit un gabarit, sans marge. */
export const Tailles: Story = {
  render: () => {
    const [size, setSize] = useState<ModalSize | null>(null);
    return (
      <div className="flex gap-2">
        {(["sm", "md", "lg", "xl"] as const).map((s) => (
          <Button key={s} onPress={() => setSize(s)}>
            {`Taille ${s}`}
          </Button>
        ))}
        <Modal
          isOpen={size !== null}
          onOpenChange={() => setSize(null)}
          title={size === "xl" ? "Réglages" : `Taille ${size}`}
          size={size ?? "md"}
          {...(size === "xl" ? {} : { footer: <Button onPress={() => setSize(null)}>Fermer</Button> })}
        >
          {size === "xl" ? (
            <div className="grid h-full grid-cols-[220px_1fr]">
              <nav className="border-r border-line bg-surface-side p-2 text-fg-2">Général · Apparence · Notifications</nav>
              <div className="p-(--dlg-pad)">Lignes de réglage (SettingsPage, D-015).</div>
            </div>
          ) : size === "lg" ? (
            <Rows n={6} />
          ) : (
            <p className="m-0">Contenu d'exemple.</p>
          )}
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const widths: Record<string, number> = { sm: 400, md: 560, lg: 800 };
    for (const [s, w] of Object.entries(widths)) {
      await userEvent.click(within(canvasElement).getByRole("button", { name: `Taille ${s}` }));
      const dialog = await waitFor(() => body().getByRole("dialog"));
      // offsetWidth : mesure sans le zoom d'ouverture (97 %).
      const width = dialog.parentElement!.offsetWidth;
      // Mobile (D-121) : sm et md sur toute la largeur moins 16 px de marge, lg en plein écran.
      const vw = window.innerWidth;
      const expected = vw < 641 ? (s === "lg" ? vw : vw - 32) : Math.min(w, vw - 64);
      await expect(width).toBe(expected);
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    }
  },
};

/** Sur mobile (≤ 640 px) : `sm` et `md` centrées, `lg` et `xl` en plein écran (D-121). Choisir un format mobile dans la barre de Storybook. */
export const Mobile: Story = {
  render: () => <Demo size="lg" title="Aperçu de l'import" description="24 lignes lues dans le fichier." label="Aperçu" defaultOpen>{<Rows n={24} />}</Demo>,
};

/* ---------- Stories de comportement ---------- */

/** Échap et le × ferment ; le focus revient au déclencheur (D-125). */
export const Echap: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const { trigger } = await openWith(canvasElement, "Nouveau projet");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    await openWith(canvasElement, "Nouveau projet");
    await userEvent.click(body().getByRole("button", { name: "Fermer" }));
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  },
};

/** Clic hors : ferme ; après une saisie, la modale reste ouverte (D-122). */
export const ClicHors: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const overlay = () => body().getByRole("dialog").parentElement!.parentElement!;
    await openWith(canvasElement, "Nouveau projet");
    await userEvent.click(overlay());
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await openWith(canvasElement, "Nouveau projet");
    await userEvent.type(body().getByLabelText("Nom"), "Atelier");
    await userEvent.click(overlay());
    await wait(300);
    await expect(body().getByRole("dialog")).toBeInTheDocument();
    await expect(body().getByLabelText("Nom")).toHaveValue("Atelier");
  },
};

/** Action en cours : ni Échap, ni clic hors, ni × ne ferment (D-122). */
export const Occupee: Story = {
  render: () => <Demo busy defaultOpen />,
  play: async () => {
    const dialog = await waitFor(() => body().getByRole("dialog"));
    await expect(dialog).toHaveAttribute("aria-busy", "true");
    await expect(body().getByRole("button", { name: "Fermer" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    await wait(200);
    await expect(body().getByRole("dialog")).toBeInTheDocument();
  },
};

/** Focus sur le premier champ ; Tab et Maj+Tab restent dans la modale (D-125, D-008). */
export const FocusFormulaire: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const { dialog } = await openWith(canvasElement, "Nouveau projet");
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByLabelText("Nom")));
    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      await expect(dialog.contains(document.activeElement)).toBe(true);
    }
    for (let i = 0; i < 6; i++) {
      await userEvent.tab({ shift: true });
      await expect(dialog.contains(document.activeElement)).toBe(true);
    }
  },
};

/** Sans champ : le focus va à la modale, pas au × (D-125). */
export const FocusModale: Story = {
  render: () => <Demo title="À propos" description="Version 2.4.0" label="À propos">{<p className="m-0">Aucun champ ici.</p>}</Demo>,
  play: async ({ canvasElement }) => {
    const { dialog } = await openWith(canvasElement, "À propos");
    await waitFor(() => expect(document.activeElement).toBe(dialog));
  },
};

/** Traits seulement quand le corps défile (D-123). */
export const Defilement: Story = {
  render: () => <Demo size="lg" title="Aperçu de l'import" description="48 lignes lues dans le fichier." label="Aperçu">{<Rows n={48} />}</Demo>,
  play: async ({ canvasElement }) => {
    const { dialog } = await openWith(canvasElement, "Aperçu");
    const header = dialog.querySelector("header")!;
    const footer = dialog.querySelector("footer")!;
    const scroller = dialog.querySelector<HTMLElement>("[data-dialog-body]")!;
    await waitFor(() => expect(footer.className).toContain("border-t"));
    await expect(header.className).not.toContain("border-b");
    scroller.scrollTop = scroller.scrollHeight;
    scroller.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(header.className).toContain("border-b"));
    await waitFor(() => expect(footer.className).not.toContain("border-t"));
  },
};

/* ---------- Confirmation ---------- */

const onResult = fn();

function ConfirmDemo({ options, label = "Supprimer « Atelier »" }: { options?: Partial<ConfirmOptions>; label?: string }) {
  const confirm = useConfirm();
  const [result, setResult] = useState<string>("—");
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="danger"
        onPress={async () => {
          const ok = await confirm({
            title: "Supprimer « Atelier » ?",
            message: "Le projet et ses 12 tâches seront supprimés. Cette action est définitive.",
            confirmLabel: "Supprimer",
            ...options,
          });
          onResult(ok);
          setResult(ok ? "confirmé" : "annulé");
        }}
      >
        {label}
      </Button>
      <span data-testid="result">Résultat : {result}</span>
    </div>
  );
}

/** Focus sur Annuler ; Échap rend `false`, le bouton rend `true` (D-125, D-127). */
export const Confirmation: StoryObj = {
  render: () => <ConfirmDemo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Supprimer « Atelier »" }));
    const dialog = await waitFor(() => body().getByRole("alertdialog"));
    await expect(dialog).toHaveAccessibleName("Supprimer « Atelier » ?");
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole("button", { name: "Annuler" })));
    await expect(within(dialog).queryByRole("button", { name: "Fermer" })).toBeNull();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(c.getByTestId("result")).toHaveTextContent("annulé"));
    await userEvent.click(c.getByRole("button", { name: "Supprimer « Atelier »" }));
    await userEvent.click(await waitFor(() => body().getByRole("button", { name: "Supprimer" })));
    await waitFor(() => expect(c.getByTestId("result")).toHaveTextContent("confirmé"));
    await waitFor(() => expect(body().queryByRole("alertdialog")).toBeNull());
  },
};

/** Une nouvelle demande annule la précédente (D-127). */
export const ConfirmationRemplacee: StoryObj = {
  render: () => {
    const confirm = useConfirm();
    const [log, setLog] = useState<string[]>([]);
    const ask = (n: number) => confirm({ title: `Question ${n}`, confirmLabel: "Supprimer" }).then((ok) => setLog((l) => [...l, `${n}:${ok}`]));
    return (
      <div className="flex items-center gap-3">
        <Button
          onPress={() => {
            void ask(1);
            void ask(2);
          }}
        >
          Deux demandes
        </Button>
        <span data-testid="log">{log.join(" ")}</span>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Deux demandes" }));
    await waitFor(() => expect(c.getByTestId("log")).toHaveTextContent("1:false"));
    await expect(await waitFor(() => body().getByRole("alertdialog"))).toHaveAccessibleName("Question 2");
    await userEvent.click(body().getByRole("button", { name: "Supprimer" }));
    await waitFor(() => expect(c.getByTestId("log")).toHaveTextContent("1:false 2:true"));
  },
};

/** Action longue : chargement, fermeture bloquée, puis fermeture et `true` (D-128). */
export const ConfirmationLongue: StoryObj = {
  render: () => <ConfirmDemo options={{ onConfirm: () => wait(600) }} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Supprimer « Atelier »" }));
    const dialog = await waitFor(() => body().getByRole("alertdialog"));
    await userEvent.click(within(dialog).getByRole("button", { name: /Supprimer/ }));
    await waitFor(() => expect(dialog).toHaveAttribute("aria-busy", "true"));
    await expect(within(dialog).getByRole("button", { name: "Annuler" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    await expect(body().getByRole("alertdialog")).toBeInTheDocument();
    await waitFor(() => expect(c.getByTestId("result")).toHaveTextContent("confirmé"), { timeout: 2000 });
    await waitFor(() => expect(body().queryByRole("alertdialog")).toBeNull());
  },
};

/** Échec : message sur place, bouton de nouveau actif (D-128). */
export const ConfirmationErreur: StoryObj = {
  render: () => (
    <ConfirmDemo
      options={{
        onConfirm: async () => {
          await wait(200);
          throw new Error("La suppression a échoué : le serveur ne répond pas.");
        },
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Supprimer « Atelier »" }));
    const dialog = await waitFor(() => body().getByRole("alertdialog"));
    await userEvent.click(within(dialog).getByRole("button", { name: /Supprimer/ }));
    const alert = await waitFor(() => within(dialog).getByRole("alert"));
    await expect(alert).toHaveTextContent("le serveur ne répond pas");
    await expect(within(dialog).getByRole("button", { name: "Annuler" })).toBeEnabled();
    await waitFor(() => expect(dialog).not.toHaveAttribute("aria-busy"));
    await userEvent.click(within(dialog).getByRole("button", { name: "Annuler" }));
    await waitFor(() => expect(c.getByTestId("result")).toHaveTextContent("annulé"));
  },
};

/** Une confirmation au-dessus d'une modale : Échap ne ferme que la plus haute. */
export const Empilement: Story = {
  render: () => {
    function Inner() {
      const confirm = useConfirm();
      return (
        <Demo
          size="md"
          title="Réglages de l'espace"
          description="Espace « Équipe A »."
          label="Réglages de l'espace"
          extra={
            <Button variant="danger" onPress={() => void confirm({ title: "Supprimer l'espace ?", confirmLabel: "Supprimer l'espace" })}>
              Supprimer l'espace
            </Button>
          }
        >
          <p className="m-0">Nom, membres, droits.</p>
        </Demo>
      );
    }
    return <Inner />;
  },
  play: async ({ canvasElement }) => {
    await openWith(canvasElement, "Réglages de l'espace");
    await userEvent.click(body().getByRole("button", { name: "Supprimer l'espace" }));
    await waitFor(() => body().getByRole("alertdialog"));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("alertdialog")).toBeNull());
    await expect(body().getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
  },
};
