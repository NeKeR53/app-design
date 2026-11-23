import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ChatComposer, type ChatComposerProps } from "./ChatComposer";
import { ChatOptionButton, ChatOptions } from "./ChatOptions";
import { AttachmentChip } from "../AttachmentChip/AttachmentChip";
import { DropdownMenu } from "../DropdownMenu/DropdownMenu";
import { IconButton } from "../IconButton/IconButton";
import { MessageQueue, type QueuedMessage } from "../MessageQueue/MessageQueue";
import type { MentionItem, MentionTrigger } from "../MentionInput/mentions";

const FILES: MentionItem[] = [
  { id: "src/OrderForm.tsx", label: "OrderForm.tsx", description: "src" },
  { id: "docs/orders.md", label: "orders.md", description: "docs" },
];
const COMMANDS: MentionItem[] = [{ id: "review", label: "review", description: "Commande" }];
const search = (items: MentionItem[], q: string) => items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()));
const triggers: MentionTrigger[] = [
  { char: "/", label: "Commande", load: async (q) => search(COMMANDS, q) },
  { char: "@", label: "Fichier", load: async (q) => search(FILES, q) },
];

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M19 10a7 7 0 0 1-14 0M12 19v3" />
  </svg>
);

const onSubmit = fn();
const onStop = fn();
const onAddFiles = fn();
const onPasteLongText = fn();
const onResume = fn();

type Attachment = { id: string; kind: "image" | "file" | "text"; name: string; src?: string; text?: string };

/** Zone de saisie telle qu'une app l'assemble : file, pièces jointes, dictée, rangée d'options. */
function Demo(props: Partial<ChatComposerProps> & { initialQueue?: QueuedMessage[] }) {
  const [queue, setQueue] = useState<QueuedMessage[]>(props.initialQueue ?? []);
  const [files, setFiles] = useState<Attachment[]>([]);
  const pastes = files.filter((f) => f.kind === "text").length;
  return (
    <div className="flex w-[640px] max-w-full flex-col pt-64">
      <ChatComposer
        placeholder="Que puis-je faire pour vous ?"
        triggers={triggers}
        onSubmit={(text, mode, references) => {
          onSubmit(text, mode, references);
          if (mode === "queue") setQueue((q) => [...q, { id: String(q.length + 1), text, references }]);
          setFiles([]);
        }}
        onStop={onStop}
        onResume={onResume}
        onAddFiles={(added) => {
          onAddFiles(added);
          setFiles((all) => [
            ...all,
            ...added.map((f) => ({ id: `${f.name}-${all.length}`, kind: f.type.startsWith("image/") ? ("image" as const) : ("file" as const), name: f.name, ...(f.type.startsWith("image/") ? { src: URL.createObjectURL(f) } : {}) })),
          ]);
        }}
        onPasteLongText={(text) => {
          onPasteLongText(text);
          setFiles((all) => [...all, { id: `paste-${pastes + 1}`, kind: "text", name: `Texte collé ${pastes + 1}`, text }]);
        }}
        hasAttachments={files.length > 0}
        queue={
          <MessageQueue
            items={queue}
            onReorder={(ids) => setQueue((all) => ids.map((id) => all.find((i) => i.id === id)!))}
            onRemove={(id) => setQueue((all) => all.filter((i) => i.id !== id))}
            onEdit={() => {}}
            onSendNow={() => {}}
          />
        }
        attachments={files.map((f) => (
          <AttachmentChip key={f.id} kind={f.kind} name={f.name} {...(f.src ? { src: f.src } : {})} {...(f.text ? { text: f.text } : {})} onRemove={() => setFiles((all) => all.filter((x) => x.id !== f.id))} />
        ))}
        trailing={<IconButton icon={<MicIcon />} label="Dicter" tooltipPlacement="top" />}
        {...props}
      />
      <ChatOptions start={<span>3 fichiers modifiés</span>}>
        <DropdownMenu label="Modèle" placement="top end" trigger={<ChatOptionButton label="Modèle avancé" value="Moyen" />}>
          <DropdownMenu.Item label="Modèle avancé" />
          <DropdownMenu.Item label="Modèle rapide" />
        </DropdownMenu>
        <ChatOptionButton label="Autonomie complète" />
      </ChatOptions>
    </div>
  );
}

const meta: Meta<typeof ChatComposer> = {
  title: "Composants/ChatComposer",
  component: ChatComposer,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof ChatComposer>;

const body = () => within(document.body);
const input = (root: HTMLElement) => within(root).getByRole("textbox", { name: "Message" });
const px = (el: Element, prop: string) => parseFloat(getComputedStyle(el).getPropertyValue(prop));
const reset = () => [onSubmit, onStop, onAddFiles, onPasteLongText, onResume].forEach((f) => f.mockClear());

export const ParDefaut: Story = { render: () => <Demo /> };

/** Pendant une réponse, avec une file et des pièces jointes : l'écran validé (Q1 B, Q2 A, Q9 A). */
export const PendantUneReponse: Story = {
  render: () => <Demo isRunning initialQueue={[{ id: "1", text: "Ensuite, mets à jour la doc du formulaire" }]} />,
};

/** Cadre : 6 px de marge, rayon 8 px, bord `--line-strong`, fond `--surface` ; champ de 28 px qui grandit jusqu'à 240 px. */
export const Anatomie: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const box = input(canvasElement);
    const frame = box.closest(".flex-col.rounded-md") as HTMLElement;
    await expect(px(frame, "padding-top")).toBe(6);
    await expect(px(frame, "border-top-left-radius")).toBe(8);
    const probe = document.createElement("span");
    probe.style.color = "var(--line-strong)";
    document.body.append(probe);
    await expect(getComputedStyle(frame).borderTopColor).toBe(getComputedStyle(probe).color);
    probe.remove();
    await expect(box.getBoundingClientRect().height).toBe(28);
    await expect(px(box, "max-height")).toBe(240);
    await expect(getComputedStyle(box).overflowY).toBe("auto");
    await expect(getComputedStyle(box, "::before").content).toContain("Que puis-je faire pour vous ?");
    // Envoi inactif tant que la zone est vide ; « Arrêter » absent au repos.
    await expect(within(canvasElement).getByRole("button", { name: "Envoyer" })).toBeDisabled();
    await expect(within(canvasElement).queryByRole("button", { name: "Arrêter" })).toBeNull();
  },
};

/** Entrée envoie (`now`), la zone se vide ; Maj+Entrée va à la ligne. */
export const EnvoiAuClavier: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    reset();
    const box = input(canvasElement);
    await userEvent.click(box);
    await userEvent.keyboard("Ligne 1{Shift>}{Enter}{/Shift}Ligne 2");
    await expect(onSubmit).not.toHaveBeenCalled();
    await expect(within(canvasElement).getByRole("button", { name: "Envoyer" })).toBeEnabled();
    await userEvent.keyboard("{Enter}");
    await expect(onSubmit).toHaveBeenCalledWith("Ligne 1\nLigne 2", "now", []);
    await waitFor(() => expect(box.textContent).toBe(""));
    await expect(box).toHaveFocus();
  },
};

/** Le bouton envoie aussi ; son info-bulle rappelle Entrée. */
export const EnvoiAuBouton: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    reset();
    await userEvent.click(input(canvasElement));
    await userEvent.keyboard("  Bonjour  ");
    const send = within(canvasElement).getByRole("button", { name: "Envoyer" });
    await expect(send).toHaveAttribute("aria-keyshortcuts", "Enter");
    await userEvent.click(send);
    await expect(onSubmit).toHaveBeenCalledWith("Bonjour", "now", []);
  },
};

/** Pendant une réponse : texte d'attente « ⌘↩ pour mettre en file », ⌘/Ctrl+Entrée met en file, Entrée envoie maintenant. */
export const MiseEnFile: Story = {
  render: () => <Demo isRunning />,
  play: async ({ canvasElement }) => {
    reset();
    const box = input(canvasElement);
    await expect(getComputedStyle(box, "::before").content).toMatch(/(⌘↩|Ctrl\+↩) pour mettre en file/);
    await userEvent.click(box);
    await userEvent.keyboard("Puis la doc{Control>}{Enter}{/Control}");
    await expect(onSubmit).toHaveBeenLastCalledWith("Puis la doc", "queue", []);
    await waitFor(() => expect(within(canvasElement).getByRole("region", { name: "1 message en file" })).toBeInTheDocument());
    await userEvent.keyboard("Tout de suite{Meta>}{Enter}{/Meta}");
    await expect(onSubmit).toHaveBeenLastCalledWith("Tout de suite", "queue", []);
    await userEvent.keyboard("Maintenant{Enter}");
    await expect(onSubmit).toHaveBeenLastCalledWith("Maintenant", "now", []);
    await expect(within(canvasElement).getByRole("button", { name: "Envoyer maintenant" })).toBeDisabled();
  },
};

/** Au repos, ⌘/Ctrl+Entrée envoie tout de suite : il n'y a rien à attendre. */
export const ModEntreeAuRepos: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    reset();
    await userEvent.click(input(canvasElement));
    await userEvent.keyboard("Salut{Control>}{Enter}{/Control}");
    await expect(onSubmit).toHaveBeenCalledWith("Salut", "now", []);
  },
};

/** « Arrêter » à côté de la flèche pendant une réponse (Q1 B) ; Échap arrête aussi ; info-bulle « Arrêter Échap ». */
export const Arreter: Story = {
  render: () => <Demo isRunning />,
  play: async ({ canvasElement }) => {
    reset();
    const c = within(canvasElement);
    const stop = c.getByRole("button", { name: "Arrêter" });
    await expect(stop).toHaveAttribute("aria-keyshortcuts", "Escape");
    // Juste avant l'envoi.
    const send = c.getByRole("button", { name: "Envoyer maintenant" });
    await expect(stop.compareDocumentPosition(send) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    stop.focus();
    await userEvent.keyboard("{Tab}{Shift>}{Tab}{/Shift}");
    await expect(await body().findByRole("tooltip")).toHaveTextContent("ArrêterÉchap");
    await userEvent.click(stop);
    await expect(onStop).toHaveBeenCalledTimes(1);
    await userEvent.click(input(canvasElement));
    await userEvent.keyboard("{Escape}");
    await expect(onStop).toHaveBeenCalledTimes(2);
  },
};

/** Échap avec la liste des suggestions ouverte la ferme seulement : l'agent continue. */
export const EchapFermeDAbordLaListe: Story = {
  render: () => <Demo isRunning />,
  play: async ({ canvasElement }) => {
    reset();
    await userEvent.click(input(canvasElement));
    await userEvent.keyboard("@");
    await body().findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await expect(onStop).not.toHaveBeenCalled();
    await expect(body().queryByRole("listbox")).toBeNull();
  },
};

/** Vide après un échec : « Relancer » est actif et appelle `onResume`. */
export const Relancer: Story = {
  render: () => <Demo canResume />,
  play: async ({ canvasElement }) => {
    reset();
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Relancer" }));
    await expect(onResume).toHaveBeenCalledTimes(1);
    await expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(input(canvasElement));
    await userEvent.keyboard("x");
    await expect(c.getByRole("button", { name: "Envoyer" })).toBeEnabled();
  },
};

/** Pièces jointes en préparation : la flèche tourne, Entrée n'envoie pas. */
export const EnPreparation: Story = {
  render: () => <Demo isPending />,
  play: async ({ canvasElement }) => {
    reset();
    await userEvent.click(input(canvasElement));
    await userEvent.keyboard("Avec la photo{Enter}");
    await expect(onSubmit).not.toHaveBeenCalled();
    await expect(within(canvasElement).getByRole("button", { name: /Envoyer/ })).toHaveAttribute("aria-disabled", "true");
  },
};

/** Menu « + » vers le haut : « Joindre des fichiers… », puis les déclencheurs ; un déclencheur ouvre ses suggestions (Q5 A). */
export const MenuPlus: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    reset();
    const c = within(canvasElement);
    const plus = c.getByRole("button", { name: "Ajouter au message" });
    await userEvent.click(plus);
    const menu = await body().findByRole("menu", { name: "Ajouter au message" });
    const items = within(menu).getAllByRole("menuitem");
    await expect(items.map((i) => i.textContent)).toEqual(["Joindre des fichiers…", "Commande/", "Fichier@"]);
    await expect(menu.getBoundingClientRect().bottom).toBeLessThanOrEqual(plus.getBoundingClientRect().top);
    await userEvent.click(items[2]!);
    const list = await body().findByRole("listbox", { name: "Suggestions : Fichier" });
    await waitFor(() => expect(input(canvasElement)).toHaveFocus());
    await waitFor(() => expect(within(list).getAllByRole("option")).toHaveLength(2));
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(input(canvasElement).querySelector("[data-mention-key]")?.textContent).toBe("@OrderForm.tsx"));
    await userEvent.keyboard("{Enter}");
    await expect(onSubmit).toHaveBeenCalledWith("", "now", [expect.objectContaining({ trigger: "@", id: "src/OrderForm.tsx", offset: 0 })]);
  },
};

/** « Joindre des fichiers… » ouvre le sélecteur ; les fichiers choisis vont à `onAddFiles`. */
export const JoindreDesFichiers: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    reset();
    const picker = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    let opened = 0;
    // Le vrai sélecteur du système ne s'ouvre pas pendant le test.
    picker.click = () => {
      opened++;
    };
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Ajouter au message" }));
    await userEvent.click(await body().findByRole("menuitem", { name: "Joindre des fichiers…" }));
    await expect(opened).toBe(1);
    await userEvent.upload(picker, new File(["x"], "maquette.pdf", { type: "application/pdf" }));
    await expect(onAddFiles).toHaveBeenCalledTimes(1);
    await expect(await within(canvasElement).findByText("maquette.pdf")).toBeInTheDocument();
    // Une pièce jointe suffit pour envoyer.
    await expect(within(canvasElement).getByRole("button", { name: "Envoyer" })).toBeEnabled();
  },
};

const paste = (target: Element, fill: (data: DataTransfer) => void) => {
  const data = new DataTransfer();
  fill(data);
  target.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
};

/** Coller une image : elle devient une pièce jointe, rien n'entre dans le texte. */
export const CollerUneImage: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    reset();
    const box = input(canvasElement);
    await userEvent.click(box);
    paste(box, (d) => d.items.add(new File([new Uint8Array([137, 80, 78, 71])], "capture.png", { type: "image/png" })));
    await expect(onAddFiles).toHaveBeenCalledTimes(1);
    await expect((onAddFiles.mock.calls[0]![0] as File[])[0]!.name).toBe("capture.png");
    await expect(await within(canvasElement).findByRole("img", { name: "capture.png" })).toBeInTheDocument();
    await expect(box.textContent).toBe("");
  },
};

/** Coller un long texte (2 000 caractères ou 20 lignes) : une pièce « Texte collé 1 » ; un court texte entre dans le champ. */
export const CollerUnLongTexte: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    reset();
    const box = input(canvasElement);
    await userEvent.click(box);
    const long = Array.from({ length: 20 }, (_, i) => `ligne ${i}`).join("\n");
    paste(box, (d) => d.setData("text/plain", long));
    await expect(onPasteLongText).toHaveBeenCalledWith(long);
    await expect(await within(canvasElement).findByRole("button", { name: /^Voir Texte collé 1 · / })).toBeInTheDocument();
    await expect(box.textContent).toBe("");
    paste(box, (d) => d.setData("text/plain", "court"));
    await waitFor(() => expect(box.textContent).toBe("court"));
    await expect(onPasteLongText).toHaveBeenCalledTimes(1);
  },
};

/** Fichiers glissés sur le cadre : bord en tirets, « Déposez vos fichiers ici », puis `onAddFiles`. */
export const DeposerDesFichiers: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    reset();
    const box = input(canvasElement);
    const frame = box.closest(".flex-col.rounded-md") as HTMLElement;
    const data = new DataTransfer();
    data.items.add(new File(["a"], "notes.txt", { type: "text/plain" }));
    frame.dispatchEvent(new DragEvent("dragover", { dataTransfer: data, bubbles: true, cancelable: true }));
    await waitFor(() => expect(getComputedStyle(frame).borderTopStyle).toBe("dashed"));
    await expect(getComputedStyle(box, "::before").content).toContain("Déposez vos fichiers ici");
    frame.dispatchEvent(new DragEvent("drop", { dataTransfer: data, bubbles: true, cancelable: true }));
    await expect(onAddFiles).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(getComputedStyle(frame).borderTopStyle).toBe("solid"));
    await expect(await within(canvasElement).findByText("notes.txt")).toBeInTheDocument();
  },
};

/** Désactivée : champ, « + » et envoi inactifs. */
export const Desactivee: Story = {
  render: () => <Demo isDisabled defaultValue="Brouillon" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(input(canvasElement)).toHaveAttribute("aria-disabled", "true");
    await expect(c.getByRole("button", { name: "Ajouter au message" })).toBeDisabled();
    await expect(c.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  },
};

/** Le texte grandit jusqu'à 240 px puis défile. */
export const Croissance: Story = {
  render: () => <Demo defaultValue={Array.from({ length: 30 }, (_, i) => `Ligne ${i + 1}`).join("\n")} />,
  play: async ({ canvasElement }) => {
    const box = input(canvasElement);
    await expect(box.getBoundingClientRect().height).toBe(240);
    await expect(box.scrollHeight).toBeGreaterThan(240);
  },
};

/* ---------- ChatOptions ---------- */

/** Rangée sous le cadre : emplacement à gauche, boutons texte à droite, sans bord ; fond `--hover` au survol et menu ouvert. */
export const Options: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const model = c.getByRole("button", { name: "Modèle avancé Moyen" });
    const autonomy = c.getByRole("button", { name: "Autonomie complète" });
    await expect(px(model, "border-top-width")).toBe(0);
    await expect(getComputedStyle(model).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    const probe = document.createElement("span");
    probe.style.backgroundColor = "var(--hover)";
    document.body.append(probe);
    const hover = getComputedStyle(probe).backgroundColor;
    probe.remove();
    await userEvent.hover(autonomy);
    await waitFor(() => expect(getComputedStyle(autonomy).backgroundColor).toBe(hover));
    // Valeur secondaire en `--fg-3`.
    await expect(within(model).getByText("Moyen")).toHaveClass("text-fg-3");
    await userEvent.click(model);
    await body().findByRole("menu");
    await expect(model).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => expect(getComputedStyle(model).backgroundColor).toBe(hover));
    await userEvent.keyboard("{Escape}");
    // Alignés à droite, sous le cadre, 4 px plus bas.
    const frame = input(canvasElement).closest(".flex-col.rounded-md") as HTMLElement;
    const row = model.closest('[role="group"]') as HTMLElement;
    await expect(Math.round(row.getBoundingClientRect().top - frame.getBoundingClientRect().bottom)).toBe(4);
    await expect(Math.round(autonomy.getBoundingClientRect().right)).toBe(Math.round(row.getBoundingClientRect().right));
    await expect(c.getByText("3 fichiers modifiés").getBoundingClientRect().left).toBe(row.getBoundingClientRect().left);
  },
};
