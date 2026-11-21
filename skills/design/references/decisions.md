# Journal des décisions

Chaque décision de design est ajoutée à `docs/decisions.md` du dépôt de référence, au moment où elle est prise.

## Format d'une entrée

```
## D-<numéro> — <titre court>
- Date : <AAAA-MM-JJ>
- Portée : <global | tokens | <Composant> | <gabarit>>
- Décision : <une ou deux phrases>
- Raison : <une phrase>
- Options écartées : <liste courte>
- Validation : docs/validation/<fichier>.html
```

## Règles

- Les numéros se suivent et ne sont jamais réutilisés.
- Les specs renvoient aux décisions par leur numéro (`voir D-012`).
- Une décision qui en remplace une autre le dit (`remplace D-004`), et l'ancienne est marquée `remplacée par D-0xx`. On ne supprime jamais une entrée.
