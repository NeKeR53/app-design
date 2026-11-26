/*
 * Recette « Base de connaissances » (D-406). Doc : KnowledgeBase.recipe.md.
 * Vue « Questions » : ChatPage, réponses avec leurs sources (SourceList) ; une source ouvre le document à sa page
 * dans le panneau de détail (DocumentViewer `page`). Vue « Documents » : ListPage et Drawer. Dépôt sur toute la page.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Alert } from "../../components/Alert/Alert";
import { Button } from "../../components/Button/Button";
import { ChatComposer } from "../../components/ChatComposer/ChatComposer";
import { ChatMessage } from "../../components/ChatTranscript/ChatMessage";
import { ChatTranscript } from "../../components/ChatTranscript/ChatTranscript";
import { DocumentViewer } from "../../components/DocumentViewer/DocumentViewer";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import type { StatusMap } from "../../components/FormattedValue/FormattedValue";
import { Markdown } from "../../components/Markdown/Markdown";
import { SourceList, type SourceItem } from "../../components/SourceList/SourceList";
import { WorkStatus } from "../../components/AgentActivity/WorkStatus";
import { FileText, Plus, RotateCcw, Upload } from "../../icons";
import { ActionBar, type Action } from "../../patterns/ActionBar/ActionBar";
import { Drawer } from "../../patterns/Drawer/Drawer";
import { ChatPage } from "../../templates/ChatPage/ChatPage";
import { ListPage } from "../../templates/ListPage/ListPage";
import { RecipeShell, resetStoredState } from "../../../.storybook/recipe-shell";
import { loadPdf, makePdf } from "../../../.storybook/story-pdf";
import { Book, Trash } from "../../../.storybook/story-icons";

/* ---------- Données factices ---------- */

interface Doc {
  id: string;
  nom: string;
  pages: number;
  passages: number;
  taille: number;
  ajoute: string;
  etat: "indexe" | "indexation" | "attente" | "erreur";
}

const ETATS: StatusMap = {
  attente: { label: "En attente", tone: "neutral" },
  indexation: { label: "Indexation en cours", tone: "pending" },
  indexe: { label: "Indexé", tone: "success" },
  erreur: { label: "Échec", tone: "danger" },
};

const DOCS: Doc[] = [
  { id: "d1", nom: "Guide des drivers LED", pages: 48, passages: 212, taille: 2_400_000, ajoute: "2026-11-02", etat: "indexe" },
  { id: "d2", nom: "Conditions générales de vente", pages: 6, passages: 31, taille: 180_000, ajoute: "2026-10-14", etat: "indexe" },
  { id: "d3", nom: "Catalogue 2026", pages: 96, passages: 388, taille: 18_200_000, ajoute: "2026-09-30", etat: "indexe" },
  { id: "d4", nom: "Notice de l'applique Halo", pages: 8, passages: 26, taille: 1_100_000, ajoute: "2026-11-20", etat: "indexe" },
  { id: "d5", nom: "Procédure de retour", pages: 4, passages: 0, taille: 240_000, ajoute: "2026-11-25", etat: "indexation" },
  { id: "d6", nom: "Fiche de sécurité IP44", pages: 2, passages: 0, taille: 90_000, ajoute: "2026-11-25", etat: "erreur" },
  { id: "d7", nom: "Tarifs professionnels 2026", pages: 12, passages: 54, taille: 800_000, ajoute: "2026-08-21", etat: "indexe" },
  { id: "d8", nom: "Guide de pose des suspensions", pages: 20, passages: 96, taille: 3_200_000, ajoute: "2026-07-03", etat: "indexe" },
];

/** Page citée, telle que le PDF factice l'écrit (ASCII). */
const CITED: Record<string, Record<number, string>> = {
  d1: { 12: "Garantie des drivers" },
  d2: { 3: "Garantie et exclusions" },
  d3: { 41: "Suspensions sur mesure" },
};
const ascii = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, " ");
const pdfs = new Map<string, Blob>();
/** PDF factice d'un document : une page par numéro, la page citée porte son titre. */
function pdfOf(doc: Doc): Blob {
  let blob = pdfs.get(doc.id);
  if (!blob) {
    const titles = Array.from({ length: doc.pages }, (_, i) => (i === 0 ? ascii(doc.nom) : (CITED[doc.id]?.[i + 1] ?? `${ascii(doc.nom)} - ${i + 1}`)));
    blob = new Blob([makePdf(titles) as BlobPart], { type: "application/pdf" });
    pdfs.set(doc.id, blob);
  }
  return blob;
}

interface Cited extends SourceItem {
  docId: string;
  page: number;
}

interface Exchange {
  id: string;
  question: string;
  answer: string;
  sources: Cited[];
}

const GUIDE_P12: Cited = {
  id: "d1-12",
  docId: "d1",
  page: 12,
  title: "Guide des drivers LED",
  detail: "p. 12",
  excerpt: "Les drivers sont garantis cinq ans à compter de la date de livraison, pièces et main-d'œuvre, sous réserve d'une pose conforme.",
};
const CGV_P3: Cited = {
  id: "d2-3",
  docId: "d2",
  page: 3,
  title: "Conditions générales de vente",
  detail: "p. 3",
  excerpt: "La garantie ne couvre pas les dommages dus à une pose non conforme aux indications de la notice.",
};
const CATALOGUE_P41: Cited = {
  id: "d3-41",
  docId: "d3",
  page: 41,
  title: "Catalogue 2026",
  detail: "p. 41",
  excerpt: "Finitions hors nuancier : comptez trois à quatre semaines de fabrication.",
};

const EXCHANGES: Exchange[] = [
  {
    id: "q1",
    question: "Quelle est la durée de garantie des drivers LED ?",
    answer:
      "Les drivers LED sont garantis **cinq ans** à compter de la livraison, pièces et main-d'œuvre [[1]](#source-1).\n\nLa garantie ne couvre pas une pose non conforme à la notice [[2]](#source-2).",
    sources: [GUIDE_P12, CGV_P3],
  },
  {
    id: "q2",
    question: "Et pour une suspension en finition sur mesure ?",
    answer:
      "Comptez **trois à quatre semaines** de fabrication pour une finition hors nuancier [[1]](#source-1). Le driver garde sa garantie de cinq ans [[2]](#source-2).",
    sources: [CATALOGUE_P41, GUIDE_P12],
  },
];

const EXAMPLES = [
  "Quelle est la durée de garantie des drivers LED ?",
  "Quel délai pour une suspension en finition sur mesure ?",
  "Peut-on poser l'applique Halo dans une salle de bain ?",
];

/* ---------- La page ---------- */

type QuestionsState = "answers" | "empty" | "no-docs" | "searching" | "error";

interface DemoProps {
  view?: "questions" | "documents";
  state?: QuestionsState;
  /** Source ouverte au départ (vue Questions). */
  openSource?: string | null;
  /** Document sélectionné au départ (vue Documents). */
  selectedDoc?: string | null;
}

function KnowledgeBase({ view: initialView = "questions", state = "answers", openSource = GUIDE_P12.id, selectedDoc = "d1" }: DemoProps) {
  const [view, setView] = useState(initialView);
  const [docs, setDocs] = useState<Doc[]>(state === "no-docs" ? [] : DOCS);
  const [exchanges, setExchanges] = useState<Exchange[]>(state === "answers" ? EXCHANGES : []);
  const [pending, setPending] = useState<string | null>(state === "searching" ? EXAMPLES[2]! : null);
  const [failed, setFailed] = useState(state === "error");
  // Source ouverte dans le panneau : la réponse qui la cite et son rang.
  const [source, setSource] = useState<{ exchange: string; cited: Cited } | null>(
    openSource ? { exchange: "q1", cited: [GUIDE_P12, CGV_P3, CATALOGUE_P41].find((s) => s.id === openSource)! } : null,
  );
  const [detailOpen, setDetailOpen] = useState(Boolean(openSource) || Boolean(selectedDoc));
  const [selected, setSelected] = useState<string | null>(selectedDoc);
  const [startedAt] = useState(() => Date.now() - 4000);

  const ask = (question: string) => {
    setFailed(false);
    setPending(question);
  };
  const addFiles = (files: File[]) =>
    setDocs((all) => [
      ...files.map((f, i) => ({ id: `n${all.length + i}`, nom: f.name.replace(/\.pdf$/i, ""), pages: 1, passages: 0, taille: f.size, ajoute: "2026-11-26", etat: "attente" as const })),
      ...all,
    ]);
  const openCited = (exchange: string, cited: Cited) => {
    setSource({ exchange, cited });
    setDetailOpen(true);
  };

  const sourceDoc = source ? docs.find((d) => d.id === source.cited.docId) : undefined;
  const doc = docs.find((d) => d.id === selected);

  const questions = (
    <ChatPage
      onDropFiles={addFiles}
      dropLabel="Déposez les PDF pour les ajouter à la documentation"
      alerts={
        failed ? (
          <Alert tone="danger" title="La réponse n'a pas pu être rédigée" action={{ label: "Réessayer", onPress: () => ask(EXAMPLES[2]!) }}>
            Le service de recherche ne répond pas. Votre question est gardée.
          </Alert>
        ) : undefined
      }
      composer={
        <ChatComposer
          label="Votre question"
          placeholder="Posez une question sur vos documents…"
          onSubmit={(text) => ask(text)}
          isRunning={pending !== null}
          isDisabled={docs.length === 0}
        />
      }
    >
      <ChatTranscript
        empty={
          docs.length === 0 ? (
            <EmptyState
              icon={<Book />}
              title="Aucun document"
              description="Ajoutez des documents : les réponses s'appuient sur eux seuls, et citent leurs sources."
              action={<Button variant="primary" icon={<Upload />} onPress={() => setView("documents")}>Ajouter des documents</Button>}
            />
          ) : (
            <EmptyState
              title="Posez une question à vos documents"
              description="La réponse cite ses sources : un clic ouvre le document à la bonne page."
              suggestions={EXAMPLES.map((q, i) => ({ id: String(i), label: q, onPress: () => ask(q) }))}
            />
          )
        }
      >
        {exchanges.length > 0 || pending || failed
          ? [
              ...exchanges.flatMap((e) => [
                <ChatMessage key={`${e.id}-q`} role="user">
                  {e.question}
                </ChatMessage>,
                <ChatMessage
                  key={`${e.id}-r`}
                  role="assistant"
                  sources={
                    <SourceList
                      sources={e.sources}
                      currentId={source?.exchange === e.id ? source.cited.id : null}
                      onOpen={(s) => openCited(e.id, s as Cited)}
                    />
                  }
                >
                  <Markdown
                    onLinkPress={(href) => {
                      const n = Number(href.replace("#source-", ""));
                      const cited = e.sources[n - 1];
                      if (cited) openCited(e.id, cited);
                    }}
                  >
                    {e.answer}
                  </Markdown>
                </ChatMessage>,
              ]),
              ...(pending || failed
                ? [
                    <ChatMessage key="pending-q" role="user">
                      {pending ?? EXAMPLES[2]}
                    </ChatMessage>,
                    ...(pending ? [<WorkStatus key="pending-w" label="Recherche dans les documents" startedAt={startedAt} />] : []),
                  ]
                : []),
            ]
          : null}
      </ChatTranscript>
    </ChatPage>
  );

  const documents = (
    <ListPage<Doc>
      title="Documents"
      description="Les documents où les réponses vont chercher."
      rows={docs}
      columns={[
        { id: "nom", label: "Nom" },
        { id: "pages", label: "Pages", type: "number" },
        { id: "passages", label: "Passages", type: "number" },
        { id: "ajoute", label: "Ajouté le", type: "date" },
        { id: "etat", label: "État", type: "status", statuses: ETATS },
      ]}
      search={{ label: "les documents" }}
      filters={[{ id: "etat", label: "État", allLabel: "Tous les états", options: Object.entries(ETATS).map(([id, e]) => ({ id, label: e.label })) }]}
      actions={[{ id: "ajouter", label: "Ajouter des documents", icon: <Upload />, primary: true, onPress: () => undefined }]}
      rowActions={(d) => [
        { id: "reindexer", label: "Réindexer", icon: <RotateCcw />, onPress: () => undefined },
        { id: "supprimer", label: "Supprimer", icon: <Trash />, danger: true, confirm: { title: `Supprimer « ${d.nom} » ?`, message: "Le document et ses passages seront effacés." }, onPress: () => setDocs((all) => all.filter((x) => x.id !== d.id)) },
      ]}
      empty={{ title: "Aucun document", description: "Ajoutez des PDF, ou déposez-les sur la page : ils sont lus et découpés en passages.", icon: <Book /> }}
      selectedId={selected}
      onSelect={(d) => {
        setSelected(d?.id ?? null);
        if (d) setDetailOpen(true);
      }}
      onDropFiles={addFiles}
      dropLabel="Déposez les PDF pour les ajouter à la documentation"
    />
  );

  const sourcePanel = (
    <Drawer
      {...(source && sourceDoc
        ? {
            header: {
              title: sourceDoc.nom,
              subtitle: `Page ${source.cited.page} · citée dans la réponse`,
              actions: [{ id: "documents", label: "Voir dans les documents", icon: <FileText />, onPress: () => { setView("documents"); setSelected(sourceDoc.id); } }],
            },
            sections: [
              { id: "passage", title: "Passage cité", content: `« ${source.cited.excerpt} »` },
              {
                id: "document",
                title: "Document",
                content: <DocumentViewer label={sourceDoc.nom} data={pdfOf(sourceDoc)} name={`${sourceDoc.nom}.pdf`} loadPdf={loadPdf} page={source.cited.page} />,
              },
            ],
          }
        : {})}
      emptyMessage="Cliquez sur une source pour ouvrir le document à la bonne page."
    />
  );

  const documentPanel = (
    <Drawer
      {...(doc
        ? {
            header: {
              title: doc.nom,
              subtitle: `PDF · ${doc.pages} page${doc.pages > 1 ? "s" : ""}`,
              status: ETATS[doc.etat]!,
              actions: [
                { id: "reindexer", label: "Réindexer", icon: <RotateCcw />, onPress: () => undefined },
                { id: "supprimer", label: "Supprimer", danger: true, confirm: { title: `Supprimer « ${doc.nom} » ?`, message: "Le document et ses passages seront effacés." }, onPress: () => undefined },
              ],
            },
            sections: [
              {
                id: "document",
                title: "Document",
                fields: [
                  { label: "Pages", value: doc.pages, type: "number" as const },
                  { label: "Passages indexés", value: doc.passages, type: "number" as const },
                  { label: "Taille", value: doc.taille, type: "bytes" as const },
                  { label: "Ajouté le", value: doc.ajoute, type: "date" as const },
                ],
              },
              { id: "apercu", title: "Aperçu", content: <DocumentViewer label={doc.nom} data={pdfOf(doc)} name={`${doc.nom}.pdf`} loadPdf={loadPdf} /> },
            ],
          }
        : {})}
      emptyMessage="Sélectionnez un document pour voir son détail."
    />
  );

  const topbar: Action[] =
    view === "questions"
      ? [{ id: "nouvelle", label: "Nouvelle conversation", icon: <Plus />, onPress: () => { setExchanges([]); setSource(null); setPending(null); setFailed(false); } }]
      : [];

  return (
    <RecipeShell
      page="documentation"
      pageTitle="Documentation"
      views={[
        { id: "questions", label: "Questions" },
        { id: "documents", label: "Documents" },
      ]}
      activeView={view}
      onViewChange={(id) => setView(id as "questions" | "documents")}
      actions={topbar.length ? <ActionBar zone="topbar" actions={topbar} /> : undefined}
      detail={view === "questions" ? sourcePanel : documentPanel}
      detailWidth="form"
      detailExpandable
      isDetailOpen={detailOpen}
      onDetailOpenChange={setDetailOpen}
    >
      {view === "questions" ? questions : documents}
    </RecipeShell>
  );
}

/* ---------- Stories ---------- */

const meta: Meta<typeof KnowledgeBase> = {
  title: "Recettes/Base de connaissances",
  component: KnowledgeBase,
  parameters: { layout: "fullscreen" },
  beforeEach: resetStoredState,
};
export default meta;
type Story = StoryObj<typeof KnowledgeBase>;

const body = () => within(document.body);

/** Référence (captures) : deux questions, leurs réponses et leurs sources ; la source 1 est ouverte à sa page dans le panneau. */
export const Reference: Story = {};

/** Une source ouvre son document à la bonne page ; le lien [n] du texte fait de même. */
export const OuvrirUneSource: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const panel = () => within(c.getByRole("complementary", { name: "Détail" }));
    await expect(c.getAllByRole("article", { name: "Assistant" })).toHaveLength(2);
    // La source ouverte est marquée, et le document s'ouvre à sa page.
    const first = c.getAllByRole("list", { name: "Sources" })[0]!;
    await expect(within(first).getByRole("button", { name: /^Source 1/ })).toHaveAttribute("aria-current", "true");
    await waitFor(() => expect(panel().getByText("Page 12 / 48")).toBeVisible(), { timeout: 10000 });
    // Une autre source : le panneau montre son document, à sa page.
    await userEvent.click(within(first).getByRole("button", { name: /^Source 2/ }));
    await waitFor(() => expect(panel().getByRole("heading", { name: "Conditions générales de vente" })).toBeVisible());
    await waitFor(() => expect(panel().getByText("Page 3 / 6")).toBeVisible(), { timeout: 10000 });
    // Le lien [1] du texte ouvre la même source que la puce 1.
    await userEvent.click(within(c.getAllByRole("article", { name: "Assistant" })[1]!).getByRole("link", { name: "[1]" }));
    await waitFor(() => expect(panel().getByRole("heading", { name: "Catalogue 2026" })).toBeVisible());
    await waitFor(() => expect(panel().getByText("Page 41 / 96")).toBeVisible(), { timeout: 10000 });
  },
};

/** Vue « Documents » : la collection, sa recherche et ses filtres ; le document sélectionné dans le panneau. */
export const Documents: Story = {
  args: { view: "documents" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("tab", { name: "Documents" })).toHaveAttribute("aria-selected", "true");
    await expect(c.getByRole("heading", { name: "Documents", level: 1 })).toBeVisible();
    await userEvent.click(c.getByText("Catalogue 2026"));
    const panel = within(c.getByRole("complementary", { name: "Détail" }));
    await waitFor(() => expect(panel.getByRole("heading", { name: "Catalogue 2026" })).toBeVisible());
    await expect(panel.getByText("Indexé")).toBeVisible();
  },
};

/** Aucune question : l'état vide propose des questions d'exemple ; un clic la pose. */
export const Vide: Story = {
  args: { state: "empty", openSource: null, selectedDoc: null },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const examples = c.getByRole("list", { name: "Suggestions" });
    await userEvent.click(within(examples).getByRole("button", { name: EXAMPLES[1]! }));
    await expect(c.getByRole("article", { name: "Vous" })).toHaveTextContent(EXAMPLES[1]!);
    await expect(c.getByText("Recherche dans les documents")).toBeVisible();
  },
};

/** Aucun document : l'état vide mène à l'ajout ; la saisie attend. */
export const SansDocument: Story = {
  args: { state: "no-docs", openSource: null, selectedDoc: null },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { name: "Aucun document" })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Ajouter des documents" }));
    await expect(c.getByRole("tab", { name: "Documents" })).toHaveAttribute("aria-selected", "true");
  },
};

/** Recherche en cours : l'étape de travail sous la question, la saisie montre l'attente. */
export const Recherche: Story = {
  args: { state: "searching", openSource: null, selectedDoc: null },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Recherche dans les documents")).toBeVisible();
  },
};

/** Échec de la réponse : un encart au-dessus de la saisie, avec « Réessayer ». */
export const Erreur: Story = {
  args: { state: "error", openSource: null, selectedDoc: null },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("La réponse n'a pas pu être rédigée")).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Réessayer" }));
    await expect(c.queryByText("La réponse n'a pas pu être rédigée")).toBeNull();
  },
};

/** Fichiers déposés sur la page : le cadre de dépôt, puis le document entre dans la liste, « En attente ». */
export const Depot: Story = {
  args: { view: "documents", selectedDoc: null },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const page = c.getByRole("heading", { name: "Documents", level: 1 }).closest<HTMLElement>(".socle-box")!;
    const data = new DataTransfer();
    data.items.add(new File(["%PDF"], "Garanties 2027.pdf", { type: "application/pdf" }));
    page.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: data }));
    await waitFor(() => expect(c.getByText("Déposez les PDF pour les ajouter à la documentation")).toBeVisible());
    page.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: data }));
    await waitFor(() => expect(c.getByText("Garanties 2027")).toBeVisible());
    await expect(body().queryByText("Déposez les PDF pour les ajouter à la documentation")).toBeNull();
  },
};
