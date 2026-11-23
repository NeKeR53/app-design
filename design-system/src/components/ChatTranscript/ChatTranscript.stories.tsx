import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ChatTranscript } from "./ChatTranscript";
import { ChatMessage } from "./ChatMessage";
import { MessageActions } from "./MessageActions";
import { EmptyState } from "../EmptyState/EmptyState";
import { Markdown } from "../Markdown/Markdown";
import { ActivityGroup } from "../AgentActivity/AgentActivity";
import { WorkStatus } from "../AgentActivity/WorkStatus";
import { WorkSummary } from "../AgentActivity/WorkSummary";
import { ChoicePrompt } from "../ChoicePrompt/ChoicePrompt";

const meta: Meta<typeof ChatTranscript> = {
  title: "Composants/ChatTranscript",
  component: ChatTranscript,
  subcomponents: { ChatMessage, MessageActions },
};
export default meta;
type Story = StoryObj<typeof ChatTranscript>;

const REPLY = "Le test échoue parce que la date est lue dans le fuseau local.\n\n```\nnpm test -- dates\n```\n\nJe corrige `formatDate` pour lire la date en UTC.";

/** Distance entre le bas du contenu et le bas de la zone visible. */
function fromBottom(el: HTMLElement) {
  return el.scrollHeight - el.scrollTop - el.clientHeight;
}

function Exchange({ n }: { n: number }) {
  return (
    <>
      <ChatMessage role="user" actions={<MessageActions content={`Question ${n}`} />} meta="Envoyé">
        {`Question ${n} : pourquoi le test des dates échoue-t-il ?`}
      </ChatMessage>
      <ChatMessage role="assistant" actions={<MessageActions content={REPLY} />}>
        <Markdown>{REPLY}</Markdown>
      </ChatMessage>
    </>
  );
}

/** Écran complet : colonne de 760 px, bulle à droite, réponse sans bulle, travail replié, question au-dessus de la saisie. */
export const Conversation: Story = {
  render: () => (
    <div className="flex h-[640px] flex-col bg-surface">
      <ChatTranscript>
        <ChatMessage role="user" meta="Envoyé · 14:02" actions={<MessageActions content="Corrige le test des dates." onEdit={fn()} onRetry={fn()} onFork={fn()} />}>
          Corrige le test des dates.
        </ChatMessage>
        <WorkSummary durationMs={42000} toolCount={4}>
          <ActivityGroup
            items={[
              { id: "1", kind: "read", verb: "Lu", object: "src/dates.ts" },
              { id: "2", kind: "search", verb: "Recherché", object: "formatDate" },
              { id: "3", kind: "edit", verb: "Modifié", object: "src/dates.ts" },
              { id: "4", kind: "command", verb: "Exécuté", object: "npm test", detail: "PASS src/dates.test.ts\nTests: 12 passed" },
            ]}
          />
        </WorkSummary>
        <ChatMessage role="assistant" meta="14:03" actions={<MessageActions content={REPLY} onQuote={fn()} onFork={fn()} />}>
          <Markdown>{REPLY}</Markdown>
        </ChatMessage>
        <ChatMessage role="user" meta="Envoyé · 14:05" actions={<MessageActions content="Lance aussi le lint." />}>
          Lance aussi le lint.
        </ChatMessage>
        <ActivityGroup items={[{ id: "a", kind: "command", verb: "Exécuté", object: "npm run lint", status: "running" }]} />
        <WorkStatus phase="tool" toolName="npm run lint" startedAt={Date.now() - 12000} />
      </ChatTranscript>
      <div className="mx-auto w-full max-w-[760px] px-4 pb-4">
        <ChoicePrompt
          question="Corriger aussi les avertissements du lint ?"
          options={[
            { id: "yes", label: "Oui, tout corriger" },
            { id: "no", label: "Non, seulement les erreurs" },
          ]}
          onChoose={fn()}
        />
      </div>
    </div>
  ),
};

/** Sans message : l'emplacement vide reçoit un `EmptyState`. */
export const Vide: Story = {
  render: () => (
    <div className="flex h-[400px] flex-col bg-surface">
      <ChatTranscript empty={<EmptyState title="Nouvelle conversation" description="Posez une question pour commencer." />} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { name: "Nouvelle conversation" })).toBeVisible();
    await expect(c.getByRole("region", { name: "Conversation" })).toHaveAttribute("tabindex", "0");
  },
};

/** Relevé de démonstration : « Ajouter du texte » prolonge la réponse, « Envoyer » change `followKey`. */
function Streaming({ onEarlier }: { onEarlier?: () => void }) {
  const [chunks, setChunks] = useState(1);
  const [sent, setSent] = useState(0);
  const [earlier, setEarlier] = useState(false);
  return (
    <div className="flex h-[420px] flex-col bg-surface">
      <div className="flex gap-2 p-2">
        <button type="button" onClick={() => setChunks((n) => n + 1)}>
          Ajouter du texte
        </button>
        <button type="button" onClick={() => setSent((n) => n + 1)}>
          Envoyer
        </button>
      </div>
      <ChatTranscript
        followKey={sent}
        hasEarlier={!earlier}
        onShowEarlier={() => {
          onEarlier?.();
          setEarlier(true);
        }}
      >
        {earlier && [1, 2, 3].map((n) => <Exchange key={`old-${n}`} n={n} />)}
        {[4, 5, 6].map((n) => (
          <Exchange key={n} n={n} />
        ))}
        <ChatMessage role="assistant">
          {Array.from({ length: chunks }, (_, i) => (
            <p key={i} className="m-0 mb-3">
              Fragment {i + 1} de la réponse en cours, assez long pour occuper plusieurs lignes dans la colonne de la conversation.
            </p>
          ))}
        </ChatMessage>
      </ChatTranscript>
    </div>
  );
}

/**
 * Collé en bas à moins de 100 px ; remonté, un nouveau contenu montre « Nouveaux messages » ;
 * le bouton ramène en bas et recolle ; un envoi (`followKey`) recolle aussi (Q10 A).
 */
export const CollageEnBas: Story = {
  render: () => <Streaming />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const scroller = c.getByRole("region", { name: "Conversation" });
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    // En bas : le relevé suit la réponse, sans bouton.
    await userEvent.click(c.getByRole("button", { name: "Ajouter du texte" }));
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    await expect(c.queryByRole("button", { name: "Nouveaux messages" })).toBeNull();
    // Remonté : le relevé ne bouge pas, le bouton apparaît.
    scroller.scrollTop = 0;
    scroller.dispatchEvent(new Event("scroll"));
    await userEvent.click(c.getByRole("button", { name: "Ajouter du texte" }));
    const button = await c.findByRole("button", { name: "Nouveaux messages" });
    await expect(scroller.scrollTop).toBe(0);
    await userEvent.click(button);
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    await expect(c.queryByRole("button", { name: "Nouveaux messages" })).toBeNull();
    await expect(scroller).toHaveFocus();
    // Recollé : la suite est suivie de nouveau.
    await userEvent.click(c.getByRole("button", { name: "Ajouter du texte" }));
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    // Un envoi ramène en bas, même remonté.
    scroller.scrollTop = 0;
    scroller.dispatchEvent(new Event("scroll"));
    await userEvent.click(c.getByRole("button", { name: "Envoyer" }));
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    await expect(c.queryByRole("button", { name: "Nouveaux messages" })).toBeNull();
  },
};

/** À moins de 100 px du bas, on reste collé : la réponse est suivie. */
export const SeuilDeCollage: Story = {
  render: () => <Streaming />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const scroller = c.getByRole("region", { name: "Conversation" });
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    scroller.scrollTop = scroller.scrollHeight - scroller.clientHeight - 60;
    scroller.dispatchEvent(new Event("scroll"));
    await userEvent.click(c.getByRole("button", { name: "Ajouter du texte" }));
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    await expect(c.queryByRole("button", { name: "Nouveaux messages" })).toBeNull();
  },
};

/** « Afficher les messages précédents » : les anciens messages s'ajoutent en haut, la lecture ne saute pas. */
export const MessagesPrecedents: Story = {
  render: () => <Streaming />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const scroller = c.getByRole("region", { name: "Conversation" });
    scroller.scrollTop = 0;
    scroller.dispatchEvent(new Event("scroll"));
    const target = c.getByText(/^Question 4 :/);
    const before = target.getBoundingClientRect().top;
    await userEvent.click(c.getByRole("button", { name: "Afficher les messages précédents" }));
    await expect(c.getByText(/^Question 1 :/)).toBeInTheDocument();
    await waitFor(() => expect(Math.abs(target.getBoundingClientRect().top - before)).toBeLessThan(60));
    await expect(c.queryByRole("button", { name: "Nouveaux messages" })).toBeNull();
  },
};

/** La fin d'une réponse est lue poliment, une fois ; rien pendant l'écriture. */
export const AnnonceDeFin: Story = {
  render: () => {
    const [done, setDone] = useState(false);
    return (
      <div className="flex h-[300px] flex-col bg-surface">
        <button type="button" onClick={() => setDone(true)}>
          Terminer
        </button>
        <ChatTranscript announce={done ? "Réponse terminée" : ""}>
          <ChatMessage role="assistant">Réponse en cours…</ChatMessage>
        </ChatTranscript>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const live = canvasElement.querySelector('[aria-live="polite"]');
    await expect(live).toHaveTextContent("");
    await userEvent.click(c.getByRole("button", { name: "Terminer" }));
    await expect(live).toHaveTextContent("Réponse terminée");
  },
};
