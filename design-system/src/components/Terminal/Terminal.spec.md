# Terminal
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/Terminal-LogViewer-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Terminal interactif : console d'un conteneur, d'un serveur ou d'un processus local. Il affiche ce que le programme écrit et lui envoie ce que l'utilisateur tape.
Ne pas l'utiliser pour : un journal à lire, chercher ou filtrer (prendre `LogViewer`) ; un extrait de commande à copier (prendre `Code` en bloc).

## Anatomie
1. **Écran** (obligatoire) : xterm.js sur `--surface`, police `--font-mono` 13 px, interligne 1,2, 5 000 lignes d'historique (D-282).
2. **Cadre** : 1 px `--line`, rayon 8 px ; anneau commun de focus tant que le terminal a le focus (D-282, D-425).
3. **Barre d'état** (obligatoire), 28 px, sur `--surface-side`, `--fs-sm`, `--fg-2` : état (`Badge`), aide à droite, taille « colonnes × lignes ».

## Variantes
Interactif (défaut) ; lecture seule (`readOnly`).

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Nom pour les lecteurs d'écran : « Console du conteneur web-01 ». |
| `engine` | `{ Terminal, FitAddon }` ou `() => Promise<…>` | — (obligatoire) | xterm.js fourni par l'app (D-280). |
| `connection` | `{ send(data), subscribe(write) }` | aucune | Branchement au programme (D-284). |
| `onResize` | `({ cols, rows }) => unknown` | aucune | Taille, à l'ouverture puis une fois à la fin de chaque redimensionnement (120 ms). |
| `state` | `"connecting" \| "open" \| "closed" \| "error"` | `"open"` une fois ouvert | État affiché (D-282). |
| `reason` | `string` | aucune | Raison après « Session terminée » ou « Connexion interrompue ». |
| `readOnly` | `boolean` | `false` | La saisie n'est pas envoyée. Fixé à l'ouverture. |
| `fill` | `boolean` | `false` | Occupe la hauteur restante d'une colonne flexible. Sinon : entre 280 et 560 px. |
| `ref` | `Ref<TerminalHandle>` | — | Poignée : `write`, `clear`, `text(lignes?)`, `selection`, `paste`, `bracketedPaste`, `focus` (D-284). |

### Installer xterm dans l'app (D-280)
```bash
npm install @xterm/xterm @xterm/addon-fit
```
```tsx
import "@xterm/xterm/css/xterm.css";
const loadXterm = async () => {
  const [{ Terminal }, { FitAddon }] = await Promise.all([import("@xterm/xterm"), import("@xterm/addon-fit")]);
  return { Terminal, FitAddon };
};
<Terminal label="Console" engine={loadXterm} connection={connection} />
```

## Exclus
- Pas de lecture d'un canal propre à une app : l'app l'adapte en `connection` (D-284).
- Pas de barre d'outils intégrée : « Effacer », « Copier la session », « Coller » sont des actions de la page (ActionBar), qui appellent la poignée.
- Pas d'onglets ni de découpage en plusieurs terminaux ; pas de recherche dans l'historique.
- Pas de couleurs en dur, pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Ouverture (moteur en cours de chargement) | Point creux, « Ouverture du terminal… ». |
| Connexion | Point creux, « Connexion… ». |
| Connecté | Point `--success`, « Connecté ». |
| Session terminée | Point neutre, « Session terminée : <raison> ». |
| Connexion interrompue | Point et texte `--danger`, « Connexion interrompue : <raison> ». |
| Moteur introuvable | Point et texte `--danger`, « Terminal indisponible : <raison> ». |
| Focus | Anneau commun sur le cadre (`--focus`, 2 px, à 1 px du bord) ; le cadre garde son trait `--line` (D-425). |
| Lecture seule | Aide « Lecture seule » ; saisie ignorée. |
| Copie | Aide « Sélection copiée » ou « Copie impossible », 1,6 s. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| La saisie part au programme ; ce qu'il écrit s'affiche (D-284) | verrouillé | `Interactif` |
| Couleurs ANSI lues dans `--ansi-0` à `--ansi-15`, et dans `--surface`, `--fg`, `--accent` ; suivent le mode (D-281) | verrouillé | `CouleursAnsi` |
| Poignée : coller sans exécuter, effacer, lire le texte (D-284) | verrouillé | `Poignee` |
| F6 et Maj+F6 sortent du terminal (D-283) | verrouillé | `SortieClavier` |
| Lecture seule : rien n'est envoyé | réglable (`readOnly`) | `LectureSeule` |
| États de connexion (D-282) | réglable (`state`, `reason`) | `Etats` |
| Moteur introuvable : message, pas de plantage | verrouillé | `MoteurIndisponible` |

## Contenu
Libellés internes dans le dictionnaire `messages` (D-089) : `terminalOpening`, `terminalOpen`, `terminalClosed`…

## Densité
Même police de 13 px en web et en desktop ; la barre d'état suit `--fs-sm`.

## Clavier
Le terminal garde toutes les touches, Tab compris (complétion du shell). Ctrl+C copie s'il y a une sélection, sinon il part au programme ; Ctrl+Maj+C copie ; Ctrl+V et Ctrl+Maj+V collent ; F6 et Maj+F6 sortent. Sur macOS, ⌘C et ⌘V (D-283).

## Accessibilité
`section` nommée par `label`. Mode lecteur d'écran d'xterm. Le champ caché porte le nom et une description des raccourcis (`aria-description`). État en `role="status"`, aide en `aria-live="polite"`. Contraste élevé : couleurs du système.

## Taille d'écran
L'écran s'ajuste à son conteneur (colonnes et lignes recalculées) ; il ne déborde jamais.

## Erreurs
Moteur qui ne se charge pas : message dans la barre d'état. Envoi qui échoue : ignoré, l'état vient de l'app.

## Placement
Onglet « Console » d'une page de détail, panneau d'une page plein écran (`fill`).

## Composition
Contient `Badge`. Les actions autour viennent d'une `ActionBar` de la page.

## Décisions
D-280, D-281, D-282, D-283, D-284

## Questions ouvertes
Aucune.
