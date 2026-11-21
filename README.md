# App Design

Marketplace de plugins pour **Claude Code** et **Codex**. Il contient le skill `design`, qui crée un design system React partagé entre apps web et desktop (Tauri), le fait évoluer et le fait respecter, avec une validation visuelle à chaque étape.

## Installation

### Claude Code

```bash
claude plugin marketplace add NeKeR53/app-design
```

```bash
claude plugin install app-design@app-design
```

Le skill s'appelle ensuite avec `/app-design:design`.

### Codex

```bash
codex plugin marketplace add https://github.com/NeKeR53/app-design.git
```

```bash
codex plugin add app-design@app-design
```

## Modes du skill

| Mode | Usage |
|---|---|
| `init` | Créer le design system de zéro |
| `define <Composant>` | Spécifier ou compléter un composant, un pattern ou un gabarit |
| `inspire <source> "<élément>"` | Reprendre l'anatomie et le comportement d'un élément observé ailleurs |
| `check "<demande>"` | Vérifier qu'une demande d'UI rentre dans la spec |
| `propose "<besoin>"` | Faire évoluer le design depuis une app |
| `audit [app]` | Lister les écarts entre une app et le design |
| `apply [app]` | Mettre une app en conformité |
| `review` | Remettre toutes les specs au niveau de la grille |

## Structure

```
.claude-plugin/marketplace.json   ← marketplace Claude Code
.claude-plugin/plugin.json        ← manifeste du plugin pour Claude Code
.agents/plugins/marketplace.json  ← marketplace Codex
.codex-plugin/plugin.json         ← manifeste du plugin pour Codex
skills/design/                    ← le skill
```
