---
name: design
description: Créer, faire évoluer et faire respecter un design system React partagé entre apps web et desktop (init, define, inspire, check, propose, audit, apply, review), avec validation visuelle à chaque étape.
---

# Design system

Ce skill gère un design system React unique, consommé par plusieurs apps (web et desktop Tauri) qui vivent chacune dans leur propre dépôt. Le design system est la seule source de vérité : une app applique le design, elle ne l'invente jamais.

Dans ce skill, le package s'appelle `@moi/ui`. Son vrai nom est celui du `package.json` du dépôt de référence.

**Hors périmètre** : la publication du package et l'hébergement de Storybook. Ce skill conçoit, modifie et fait respecter le design ; il ne publie rien et ne déploie rien. Quand une étape suppose qu'une nouvelle version est disponible, il le dit et laisse l'utilisateur s'en charger.

## Organisation du skill

Lis seulement les fichiers dont le mode courant a besoin.

| Fichier | Contenu | Quand le lire |
|---|---|---|
| `references/context.md` | Repérer le contexte, structure du dépôt de référence | Toujours, au début |
| `references/validation.md` | Page de validation visuelle et son cycle | Dès qu'une décision de design doit être prise |
| `references/decisions.md` | Format du journal des décisions | Dès qu'une décision est prise |
| `modes/<mode>.md` | Déroulé détaillé du mode | Le mode choisi uniquement |
| `assets/checklist.md` | Grille de questions initiale | `init` (étape 6), `define`, `inspire`, `review` |
| `assets/spec-template.md` | Modèle de spec de composant | `define` |
| `assets/claude-md-app.md` | Bloc à ajouter au `CLAUDE.md` des apps | `init` (étape 6), contexte app sans bloc |
| `assets/guardrails.md` | Garde-fous techniques | `init` (étape 6), `audit` |

## Règles invariables

1. **Rien hors spec dans une app.** Une option, une variante, un état, une zone ou un comportement absent de la spec n'est jamais implémenté localement : ni nouveau composant équivalent, ni surcharge de style, ni copie modifiée. On passe par `check`, puis `propose`.
2. **Les composants ne se modifient que dans le dépôt de référence.** Jamais dans `node_modules`, jamais par copie dans une app.
3. **Une question à la fois**, toujours avec ta recommandation et sa raison en une phrase. L'utilisateur répond par oui, par non ou par une variante.
4. **Pas de code sans validation visuelle** (`references/validation.md`). Un composant ne se code pas tant que sa spec a des questions ouvertes.
5. **Chaque décision est écrite** dans `docs/decisions.md` (`references/decisions.md`) et dans la spec concernée, au moment où elle est prise.
6. **Toute nouvelle option est facultative**, et le comportement par défaut ne change pas (version mineure). Un changement qui casse l'existant est une version majeure, avec une note de migration dans `CHANGELOG.md`, et demande l'accord explicite de l'utilisateur.
7. **Le design est générique.** Rien de métier dans le dépôt de référence. Un besoin métier se construit dans l'app en assemblant les composants existants.
8. **Le placement suit `layout-rules.md`.** Si aucune règle ne couvre le cas, pose la question au lieu d'inventer, puis ajoute la règle.

## Aiguillage

| Mode | Contexte | Quand | Fichier |
|---|---|---|---|
| `init` | référence (dépôt vide) | Créer le design system de zéro | `modes/init.md` |
| `define <Composant>` | référence | Spécifier ou compléter un composant, pattern ou gabarit | `modes/define.md` |
| `inspire <source> "<élément>"` | les deux | Reprendre l'anatomie et le comportement d'un élément observé ailleurs | `modes/inspire.md` |
| `check "<demande>"` | app | Vérifier qu'une demande d'UI rentre dans la spec | `modes/check.md` |
| `propose "<besoin>"` | app | Faire évoluer le design depuis une app | `modes/propose.md` |
| `audit [app]` | app ou référence | Lister les écarts entre une app et le design | `modes/audit.md` |
| `apply [app]` | app | Mettre une app en conformité | `modes/apply.md` |
| `review` | référence | Remettre toutes les specs à niveau de la grille | `modes/review.md` |

**Sans mode explicite**, déduis-le de la demande et annonce en une ligne le mode choisi.

**Déclenchement automatique** : en contexte app, toute demande qui touche l'UI (ajouter un écran, une info, un bouton, une option, un réglage, changer un comportement) passe d'abord par `check`, même si l'utilisateur n'a pas tapé `/design`.

**Options communes** : `--component <X>` cible un seul composant ; `--scope tokens|composants|pages|comportements|tout` limite le périmètre (`tout` par défaut).
