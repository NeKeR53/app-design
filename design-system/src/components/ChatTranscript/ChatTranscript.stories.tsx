import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { flushSync } from "react-dom";
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
/** Défilement fait par l'utilisateur : un geste (molette), puis le défilement. Sans geste, c'est le navigateur (D-397). */
function userScroll(scroller: HTMLElement, top: number) {
  scroller.dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: top < scroller.scrollTop ? -100 : 100 }));
  scroller.scrollTop = top;
  scroller.dispatchEvent(new Event("scroll"));
}

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
function Streaming({ onEarlier, height = "h-[420px]" }: { onEarlier?: () => void; height?: string }) {
  const [chunks, setChunks] = useState(1);
  const [blocks, setBlocks] = useState(0);
  const [sent, setSent] = useState(0);
  const [earlier, setEarlier] = useState(false);
  return (
    <div className={`flex ${height} flex-col bg-surface`}>
      <div className="flex gap-2 p-2">
        <button type="button" onClick={() => setChunks((n) => n + 1)}>
          Ajouter du texte
        </button>
        <button type="button" onClick={() => setSent((n) => n + 1)}>
          Envoyer
        </button>
        {/* Bloc de 400 px (code, image, outils dépliés) rendu tout de suite, dans la même tâche que le clic. */}
        <button type="button" onClick={() => flushSync(() => setBlocks((n) => n + 1))}>
          Ajouter un grand bloc
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
          {Array.from({ length: blocks }, (_, i) => (
            <div key={`bloc-${i}`} className="mb-3 h-[400px] rounded-md bg-surface-side p-3">
              Grand bloc {i + 1}
            </div>
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
    userScroll(scroller, 0);
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
    userScroll(scroller, 0);
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
    userScroll(scroller, scroller.scrollHeight - scroller.clientHeight - 60);
    await userEvent.click(c.getByRole("button", { name: "Ajouter du texte" }));
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    await expect(c.queryByRole("button", { name: "Nouveaux messages" })).toBeNull();
  },
};

/**
 * En bas, un grand bloc arrive juste après un défilement du relevé, avant que l'événement de ce défilement soit lu :
 * le relevé reste collé (D-389). Avant la correction, l'événement lu après la croissance (400 px du bas) décrochait
 * le suivi et « Nouveaux messages » apparaissait sans que l'utilisateur ait remonté.
 */
export const GrandBlocApresDefilement: Story = {
  render: () => <Streaming />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const scroller = c.getByRole("region", { name: "Conversation" });
    const big = c.getByRole("button", { name: "Ajouter un grand bloc" });
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    for (let round = 0; round < 3; round++) {
      // Un grand bloc : le relevé le suit en défilant. L'événement de ce défilement n'est lu qu'à l'image suivante…
      big.click();
      await new Promise<void>((resolve) => {
        const tick = () => (fromBottom(scroller) < 2 ? resolve() : setTimeout(tick, 0));
        setTimeout(tick, 0);
      });
      // … et le bloc suivant est rendu avant, dès la tâche d'après.
      big.click();
      await new Promise((resolve) => setTimeout(resolve, 120));
      await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
      await expect(c.queryByRole("button", { name: "Nouveaux messages" })).toBeNull();
    }
    // Remonté pour de bon : le relevé reste sur ce qu'on lit.
    userScroll(scroller, 0);
    big.click();
    await c.findByRole("button", { name: "Nouveaux messages" });
    await expect(scroller.scrollTop).toBe(0);
  },
};

/**
 * Zone de reprise : le dernier tiers de la hauteur visible, 100 px au moins (D-396). Remonté de 200 px dans un relevé
 * de 860 px de haut, la fin reste à l'écran : le relevé suit encore. Remonté de plus d'un tiers, il reste sur ce qu'on
 * lit ; un envoi le ramène en bas.
 */
export const ZoneDeReprise: Story = {
  render: () => <Streaming height="h-[900px]" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const scroller = c.getByRole("region", { name: "Conversation" });
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    await expect(scroller.clientHeight).toBeGreaterThan(600);
    // Assez de contenu pour remonter de plus d'une demi-hauteur.
    while (scroller.scrollHeight - scroller.clientHeight < scroller.clientHeight)
      await userEvent.click(c.getByRole("button", { name: "Ajouter du texte" }));
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    // Un peu plus haut que 100 px, mais dans le dernier tiers : le suivi continue.
    userScroll(scroller, scroller.scrollHeight - scroller.clientHeight - 200);
    await userEvent.click(c.getByRole("button", { name: "Ajouter du texte" }));
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    await expect(c.queryByRole("button", { name: "Nouveaux messages" })).toBeNull();
    // Au-delà du tiers : le relevé reste sur ce qu'on lit…
    userScroll(scroller, scroller.scrollHeight - scroller.clientHeight - scroller.clientHeight / 2);
    const kept = scroller.scrollTop;
    await userEvent.click(c.getByRole("button", { name: "Ajouter du texte" }));
    await c.findByRole("button", { name: "Nouveaux messages" });
    await expect(scroller.scrollTop).toBe(kept);
    // … et un envoi le ramène en bas.
    await userEvent.click(c.getByRole("button", { name: "Envoyer" }));
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
  },
};

/** « Afficher les messages précédents » : les anciens messages s'ajoutent en haut, la lecture ne saute pas. */
export const MessagesPrecedents: Story = {
  render: () => <Streaming />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const scroller = c.getByRole("region", { name: "Conversation" });
    userScroll(scroller, 0);
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

/** Ligne de contexte en tête du relevé ; son détail s'ouvre en info-bulle au focus clavier (D-382). */
export const LigneDeContexte: Story = {
  render: () => (
    <div className="flex h-[360px] flex-col bg-surface">
      <ChatTranscript context="Depuis Notes · 24/11/2026 09:03" contextDetail="Modèle avancé · effort moyen">
        <Exchange n={1} />
      </ChatTranscript>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const line = c.getByText("Depuis Notes · 24/11/2026 09:03");
    const scroller = c.getByRole("region", { name: "Conversation" });
    // La ligne défile avec les messages : elle est dans la zone défilante, avant le premier message.
    await expect(scroller.contains(line)).toBe(true);
    await expect(line.compareDocumentPosition(c.getAllByRole("article")[0] as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Tab : la zone défilante, puis la ligne de contexte.
    await userEvent.tab();
    await expect(scroller).toHaveFocus();
    await userEvent.tab();
    await expect(line).toHaveFocus();
    const tip = await within(document.body).findByRole("tooltip");
    await expect(tip).toHaveTextContent("Modèle avancé · effort moyen");
  },
};

/** Conversation vide : pas de ligne de contexte. */
export const ContexteVide: Story = {
  render: () => (
    <div className="flex h-[300px] flex-col bg-surface">
      <ChatTranscript context="Depuis Notes · 24/11/2026 09:03" empty={<EmptyState title="Nouvelle conversation" />} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText("Depuis Notes · 24/11/2026 09:03")).toBeNull();
  },
};

/** Banc des positions (D-397) : quitter la conversation et y revenir, des messages qui arrivent, une largeur qui change. */
function Retour({ id }: { id: string }) {
  const [shown, setShown] = useState(true);
  const [count, setCount] = useState(30);
  const [narrow, setNarrow] = useState(false);
  return (
    <div className="flex h-[480px] flex-col gap-2 p-2">
      <div className="flex gap-2">
        <button type="button" onClick={() => setShown((v) => !v)}>Basculer</button>
        <button type="button" onClick={() => setCount((n) => n + 3)}>Nouveaux</button>
        <button type="button" onClick={() => setNarrow((v) => !v)}>Largeur</button>
      </div>
      <div className={narrow ? "min-h-0 w-[360px] flex-1" : "min-h-0 w-full flex-1"}>
        {shown ? (
          <ChatTranscript scrollKey={id}>
            {Array.from({ length: count }, (_, i) => (
              <ChatMessage key={i} role={i % 2 ? "assistant" : "user"}>
                <p>
                  Message {i + 1}. Un texte assez long pour passer à la ligne quand la colonne rétrécit, comme une réponse
                  d'agent avec plusieurs phrases à lire.
                </p>
              </ChatMessage>
            ))}
          </ChatTranscript>
        ) : (
          <p>Autre page</p>
        )}
      </div>
    </div>
  );
}

/** Remonté, on quitte puis on revient : même endroit, même avec des messages arrivés entre-temps (D-397). */
export const RetourMemeEndroit: Story = {
  render: () => <Retour id="retour-endroit" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    let scroller = c.getByRole("region", { name: "Conversation" });
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    userScroll(scroller, 300);
    await userEvent.click(c.getByRole("button", { name: "Basculer" }));
    await userEvent.click(c.getByRole("button", { name: "Nouveaux" }));
    await userEvent.click(c.getByRole("button", { name: "Basculer" }));
    scroller = await c.findByRole("region", { name: "Conversation" });
    await waitFor(() => expect(scroller.scrollTop).toBe(300));
  },
};

/** En bas, on quitte, des messages arrivent, on revient : toujours en bas, les nouveaux messages à l'écran (D-397). */
export const RetourEnBas: Story = {
  render: () => <Retour id="retour-bas" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    let scroller = c.getByRole("region", { name: "Conversation" });
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    await userEvent.click(c.getByRole("button", { name: "Basculer" }));
    await userEvent.click(c.getByRole("button", { name: "Nouveaux" }));
    await userEvent.click(c.getByRole("button", { name: "Basculer" }));
    scroller = await c.findByRole("region", { name: "Conversation" });
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    await expect(c.queryByRole("button", { name: "Nouveaux messages" })).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Nouveaux" }));
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
  },
};

/** En bas, la largeur change (panneau qui s'ouvre) et le navigateur déplace la vue : le suivi continue (D-397). */
export const LargeurEtNavigateur: Story = {
  render: () => <Retour id="largeur" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const scroller = c.getByRole("region", { name: "Conversation" });
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    await userEvent.click(c.getByRole("button", { name: "Largeur" }));
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    // Défilement fait par le navigateur seul, sans geste : il ne décroche pas le suivi.
    scroller.scrollTop = 0;
    scroller.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    await userEvent.click(c.getByRole("button", { name: "Nouveaux" }));
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
    await expect(c.queryByRole("button", { name: "Nouveaux messages" })).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Largeur" }));
    await waitFor(() => expect(fromBottom(scroller)).toBeLessThan(2));
  },
};
