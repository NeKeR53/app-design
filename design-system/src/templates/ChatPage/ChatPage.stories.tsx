import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { ChatPage, type ChatPageProps } from "./ChatPage";
import type { Action } from "../../patterns/ActionBar/ActionBar";
import { Alert } from "../../components/Alert/Alert";
import { ChatComposer } from "../../components/ChatComposer/ChatComposer";
import { ChatOptionButton, ChatOptions } from "../../components/ChatComposer/ChatOptions";
import { ChatMessage } from "../../components/ChatTranscript/ChatMessage";
import { ChatTranscript } from "../../components/ChatTranscript/ChatTranscript";
import { ChoicePrompt } from "../../components/ChoicePrompt/ChoicePrompt";
import { Markdown } from "../../components/Markdown/Markdown";
import { WorkSummary } from "../../components/AgentActivity/WorkSummary";
import { ActivityGroup } from "../../components/AgentActivity/AgentActivity";

const meta: Meta<typeof ChatPage> = {
  title: "Gabarits/ChatPage",
  component: ChatPage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof ChatPage>;

const REPLY = "Le test échoue parce que la date est lue dans le fuseau local.\n\nJe corrige `formatDate` pour lire la date en UTC.";

const actions = (): Action[] => [
  { id: "new", label: "Nouvelle conversation", onPress: fn() },
  { id: "rename", label: "Renommer", shortcut: "F2", onPress: fn() },
  { id: "archive", label: "Archiver", onPress: fn() },
];

function Messages() {
  return (
    <>
      <ChatMessage role="user" meta="Envoyé · 09:03">
        Corrige le test des dates.
      </ChatMessage>
      <WorkSummary durationMs={42000} toolCount={2}>
        <ActivityGroup
          items={[
            { id: "1", kind: "read", verb: "Lu", object: "src/dates.ts" },
            { id: "2", kind: "edit", verb: "Modifié", object: "src/dates.ts" },
          ]}
        />
      </WorkSummary>
      <ChatMessage role="assistant" meta="09:04">
        <Markdown>{REPLY}</Markdown>
      </ChatMessage>
      <ChatMessage role="user" meta="Envoyé · 09:05">
        Lance aussi le lint.
      </ChatMessage>
    </>
  );
}

const QUESTION = (
  <ChoicePrompt
    question="Corriger aussi les avertissements du lint ?"
    options={[
      { id: "yes", label: "Oui, tout corriger" },
      { id: "no", label: "Non, seulement les erreurs" },
    ]}
    onChoose={fn()}
  />
);

/** Page complète, avec les mêmes données dans toutes les stories. */
function Demo(props: Partial<ChatPageProps> & { onAddFiles?: (files: File[]) => void }) {
  const { onAddFiles, ...rest } = props;
  return (
    <div className="h-[640px]">
      <ChatPage
        toolbar={<span className="font-heading">Corriger le test des dates</span>}
        actions={actions()}
        actionsLabel="la conversation"
        alerts={<Alert tone="danger" action={{ label: "Réessayer", onPress: fn() }}>La sauvegarde a échoué.</Alert>}
        question={QUESTION}
        composer={<ChatComposer placeholder="Répondre…" onSubmit={fn()} {...(onAddFiles ? { onAddFiles } : {})} />}
        options={
          <ChatOptions label="Options de la conversation" start={<span>2 fichiers modifiés</span>}>
            <ChatOptionButton label="Modèle avancé" value="Moyen" onPress={fn()} />
          </ChatOptions>
        }
        {...rest}
      >
        <ChatTranscript context="Depuis Notes · 24/11/2026 09:03" contextDetail="Modèle avancé · effort moyen">
          <Messages />
        </ChatTranscript>
      </ChatPage>
    </div>
  );
}

/** Écran complet : barre d'outils, relevé, pied aligné sur la colonne de 760 px (D-382). */
export const Conversation: Story = {
  render: () => <Demo />,
};

/** Le pied (alerte, question, saisie, options) a les mêmes bords que la colonne du relevé. */
export const Alignement: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const column = c.getByRole("region", { name: "Conversation" }).firstElementChild as HTMLElement;
    const composer = canvasElement.querySelector("[data-chat-page-footer]")?.lastElementChild as HTMLElement;
    const a = column.getBoundingClientRect();
    const b = composer.getBoundingClientRect();
    await expect(Math.abs(a.left - b.left)).toBeLessThan(2);
    await expect(Math.abs(a.right - b.right)).toBeLessThan(2);
    await expect(b.width).toBeLessThanOrEqual(760);
    await expect(c.getByRole("toolbar", { name: "la conversation" })).toBeInTheDocument();
  },
};

const LONG_QUESTION = (
  <ChoicePrompt
    question="Quels fichiers faut-il corriger ?"
    detail={Array.from({ length: 40 }, (_, i) => `src/module-${i + 1}/index.ts`).join("\n")}
    options={[
      { id: "all", label: "Tous les fichiers" },
      { id: "some", label: "Seulement les fichiers modifiés" },
    ]}
    onChoose={fn()}
  />
);

/** Une longue question défile dans sa zone, bornée à 40 % de la hauteur de la page de chat (360 px au plus) ; vide, elle ne prend pas de place. */
export const QuestionLongue: Story = {
  render: () => <Demo question={LONG_QUESTION} />,
  play: async ({ canvasElement }) => {
    const zone = canvasElement.querySelector("[data-chat-page-question]") as HTMLElement;
    const main = canvasElement.querySelector("[data-chat-page-main]") as HTMLElement;
    await expect(zone.getBoundingClientRect().height).toBeLessThanOrEqual(Math.min(main.clientHeight * 0.4, 360) + 1);
    await expect(zone.scrollHeight).toBeGreaterThan(zone.clientHeight);
    // Le relevé garde de la place.
    const scroller = within(canvasElement).getByRole("region", { name: "Conversation" });
    await expect(scroller.clientHeight).toBeGreaterThan(100);
  },
};

/** Zone de question donnée mais vide (le composant de l'app ne rend rien) : aucun écart. */
export const QuestionVide: Story = {
  render: () => {
    const Nothing = () => null;
    return <Demo question={<Nothing />} alerts={undefined} />;
  },
  play: async ({ canvasElement }) => {
    const zone = canvasElement.querySelector("[data-chat-page-question]") as HTMLElement;
    await expect(getComputedStyle(zone).display).toBe("none");
  },
};

const onDropFiles = fn();
const onAddFiles = fn();

function drag(target: Element, type: "dragover" | "drop" | "dragleave", data: DataTransfer) {
  target.dispatchEvent(new DragEvent(type, { dataTransfer: data, bubbles: true, cancelable: true }));
}

/**
 * Des fichiers qui survolent la page montrent le cadre ; un dépôt sur le relevé appelle `onDropFiles` ;
 * un dépôt sur la saisie est pris par `ChatComposer` seul.
 */
export const DeposerDesFichiers: Story = {
  render: () => <Demo onDropFiles={onDropFiles} onAddFiles={onAddFiles} />,
  play: async ({ canvasElement }) => {
    onDropFiles.mockClear();
    onAddFiles.mockClear();
    const c = within(canvasElement);
    const data = new DataTransfer();
    data.items.add(new File(["a"], "notes.txt", { type: "text/plain" }));
    const transcript = c.getByRole("region", { name: "Conversation" });
    drag(transcript, "dragover", data);
    await expect(await c.findByText("Déposez les fichiers pour les joindre")).toBeVisible();
    // Sortie de la page : le cadre disparaît.
    drag(transcript, "dragleave", data);
    await waitFor(() => expect(c.queryByText("Déposez les fichiers pour les joindre")).toBeNull());
    // Dépôt sur le relevé.
    drag(transcript, "dragover", data);
    drag(transcript, "drop", data);
    await expect(onDropFiles).toHaveBeenCalledTimes(1);
    await expect(onDropFiles.mock.calls[0]?.[0]?.[0]?.name).toBe("notes.txt");
    await waitFor(() => expect(c.queryByText("Déposez les fichiers pour les joindre")).toBeNull());
    // Dépôt sur la saisie : ChatComposer le prend, pas de second ajout.
    const box = c.getByRole("textbox");
    drag(box, "dragover", data);
    drag(box, "drop", data);
    await expect(onAddFiles).toHaveBeenCalledTimes(1);
    await expect(onDropFiles).toHaveBeenCalledTimes(1);
  },
};

/** Survol signalé par l'app (glisser-déposer du système, Tauri) : le cadre s'affiche sans événement DOM. */
export const SurvolVenuDuSysteme: Story = {
  render: () => <Demo isDraggingFiles />,
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector("[data-chat-page-drop]") as HTMLElement;
    await expect(frame).toHaveTextContent("Déposez les fichiers pour les joindre");
    await expect(getComputedStyle(frame).pointerEvents).toBe("none");
    await expect(getComputedStyle(frame).borderTopStyle).toBe("dashed");
  },
};

/** Conversation en lecture seule : pas de saisie, le pied ne garde que l'alerte. */
export const SansSaisie: Story = {
  render: () => <Demo composer={undefined} options={undefined} question={undefined} alerts={<Alert>Conversation archivée : elle se lit seulement.</Alert>} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("textbox")).toBeNull();
  },
};
