# LogViewer
Statut : validé (2026-11-23) — Version : depuis la version qui suit 0.2.0
Validation : docs/validation/components/Terminal-LogViewer-v1.html (par délégation de l'utilisateur, 2026-11-23)

## Rôle
Journal en lignes horodatées : build, conteneur, tâche planifiée, service. On le lit, on y cherche, on le filtre par niveau, on le suit en direct et on le copie. Il tient des centaines de milliers de lignes.
Ne pas l'utiliser pour : une console où l'on tape (prendre `Terminal`) ; une liste d'événements à ouvrir (prendre `List` ou `Table`).

## Anatomie
1. **Cadre** : 1 px `--line`, rayon 8 px (D-285).
2. **Barre d'outils** (`role="toolbar"`) : réglages de l'app (`tools`), filtre « Niveau » (si `levels`), `SearchInput`, « n sur N », résultat précédent et suivant ; à droite : Suivre (si `live`), Retour à la ligne, Horodatage (si des lignes ont une heure), Liste des erreurs (si `levels`), Copier, actions de l'app (`ActionBar` zone `toolbar`).
3. **Lignes**, liste virtualisée, `--font-mono` 12,5 px, hauteur 18 px : numéro (`--fg-3`, gouttière à marque de niveau de 3 px), heure HH:MM:SS.mmm (`--fg-3`), texte aux couleurs ANSI (`--ansi-n`, D-281).
4. **Liste des erreurs** (si ouverte) : panneau de 260 px à droite, `List` « Erreurs · n » (D-287).
5. **Barre d'état**, 28 px, sur `--surface-side` : « n lignes » (et les plus anciennes oubliées), « n erreurs » en `--danger`, « n alertes » en `--warning`, « En direct », « Suivi en pause » avec « Revenir à la fin ».

## Variantes
Simple (défaut) ; à niveaux (`levels`) ; en direct (`live`).

## Options
| Option | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (obligatoire) | Nom du journal : « Journal du build n° 42 ». |
| `lines` | `LogLine[]` | aucune | Lignes (texte, ou `{ text, time?, level? }`), séquences ANSI comprises. Un nouveau tableau remplace le précédent. |
| `live` | `boolean` | `false` | La source écrit encore : suivi de la fin, « En direct » (D-288). |
| `levels` | `boolean` | `false` | Filtre de niveau, liste des erreurs, compteurs (D-286, D-287). |
| `wrap` | `boolean` | `false` | Retour à la ligne au départ. |
| `timestamps` | `boolean` | `true` | Horodatage affiché au départ. |
| `maxLines` | `number` | 500 000 | Au-delà, les plus anciennes lignes sont oubliées. |
| `loading` | `boolean` | `false` | Premier chargement. |
| `empty` | `ReactNode` | `EmptyState` « Journal vide » | État vide de l'app (erreur avec « Réessayer »). |
| `tools` | `ReactNode` | aucun | Réglages de la source, en tête de barre (`Select` de taille réduite). |
| `actions` | `(view) => Action[]` | aucune | Actions de la page ; `view.text()` rend les lignes affichées. |
| `fill` | `boolean` | `false` | Occupe la hauteur restante. Sinon : entre 280 et 560 px. |
| `ref` | `Ref<LogViewerHandle>` | — | Poignée : `append(lignes ou morceau de texte)`, `clear()`, `text()`. |

## Exclus
- Pas de lecture d'un canal propre à une app : l'app appelle `ref.append()` (solution locale dans Alfred).
- Pas de marque propre au flux `stderr` : l'app donne `level` si elle le sait.
- Pas de recherche par expression régulière ; la recherche ne filtre pas les lignes (D-289).
- Pas de couleurs en dur, pas de `className` ni de `style`.

## États
| État | Rendu |
|---|---|
| Chargement | `EmptyState` compact « Chargement du journal… ». |
| En attente (direct, vide) | « En attente des premières lignes… ». |
| Vide | « Journal vide », ou l'état `empty` de l'app. |
| Aucune ligne au niveau choisi | « Aucune ligne de ce niveau. » |
| En direct | « En direct » (point `--success`) ; bascule Suivre sélectionnée. |
| Suivi en pause | « Suivi en pause · n nouvelles lignes », bouton « Revenir à la fin ». |
| Recherche | Lignes trouvées en `--field`, texte surligné, ligne courante en `--selected`. |
| Ligne d'erreur ou d'alerte | Marque de 3 px `--danger` ou `--warning` ; « Erreur : » ou « Alerte : » lu par les lecteurs d'écran. |
| Copie | Coche et « Copié », 1,6 s. |

## Comportement
| Règle | Niveau de réglage | Test (story) |
|---|---|---|
| Liste virtualisée, numéro et heure en colonnes (D-285) | verrouillé | `Statique` |
| Couleurs ANSI en tokens, jamais de HTML (D-281, D-289) | verrouillé | `CouleursAnsi` |
| Suivre la fin, pause en remontant, « Revenir à la fin » (D-288) | réglable (`live`) | `EnDirect` |
| Filtre de niveau par DropdownMenu à choix avec compteurs, liste des erreurs (D-286, D-287) | réglable (`levels`) | `Niveaux` |
| Recherche : « n sur N », Entrée et F3, Maj pour revenir (D-289) | verrouillé | `Recherche` |
| Copie : sélection, sinon lignes affichées sans ANSI (D-289) | verrouillé | `Copie` |
| Retour à la ligne et horodatage (D-289) | réglable (`wrap`, `timestamps`) | `Affichage` |
| États vides | réglable (`loading`, `empty`) | `Vide` |
| Flux brut : dernière ligne complétée par le morceau suivant | verrouillé | `FluxBrut` |

## Contenu
Libellés internes dans le dictionnaire `messages` (D-089) : `logLevel`, `followPaused`, `backToEnd`… Nombres au format de la langue.

## Densité
Lignes en 12,5 px et 18 px dans les deux densités ; barres et boutons suivent `--icon-btn` et `--btn-h-sm`.

## Clavier
La zone des lignes est dans l'ordre de tabulation et défile aux flèches. Haut, Page haut et Début mettent le suivi en pause ; Fin le reprend. F3 et Maj+F3 parcourent les résultats depuis tout le journal ; Entrée et Maj+Entrée depuis la recherche ; Mod+F va à la recherche (D-083).

## Accessibilité
`section` nommée ; zone `role="log"` (`aria-live="off"` : pas d'annonce à chaque ligne) nommée « <label>, n lignes » ; « n sur N » et « Suivi en pause » en `aria-live="polite"`. Le niveau ne passe jamais par la couleur seule.

## Taille d'écran
Sous 641 px, la liste des erreurs passe sous les lignes ; la barre d'outils passe à la ligne.

## Erreurs
Copie refusée par le navigateur : « Copie impossible ». Ligne de plus de 10 000 caractères : coupée à l'affichage, gardée pour la recherche et la copie.

## Placement
Onglet « Journal » d'une page de détail, page plein écran (`fill`).

## Composition
Contient `Button`, `DropdownMenu`, `SearchInput`, `IconButton`, `List`, `EmptyState`, `Badge`, `ActionBar`.

## Décisions
D-281, D-285, D-286, D-287, D-288, D-289

## Questions ouvertes
Aucune.
