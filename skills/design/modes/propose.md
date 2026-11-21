# Mode `propose "<besoin>"`

Fait évoluer le design depuis une app, en passant toujours par le dépôt de référence.

## Options

- `--component <X>` : le composant concerné, s'il est déjà identifié.

## Déroulé

1. **Test du générique** : le besoin a-t-il un sens dans une autre app, hors de ce métier ? Si non, arrête-toi et propose une solution locale à base de composants existants.
2. **Proposition** : décris le besoin, le changement de spec, l'API ajoutée (toujours facultative), l'impact de version (mineure ou majeure) et un exemple d'usage. Fais-en une page de validation (`../references/validation.md`) : le composant avant, après, et dans l'écran de l'app qui en a besoin.
3. **Grille** : passe le changement par les questions de `docs/checklist.md` qui le concernent (états, clavier, densité, niveau de réglage…).
4. **Dans le dépôt de référence** : crée une branche, mets à jour la spec, `docs/decisions.md`, le composant, les stories, les tests, la version dans `package.json` et `CHANGELOG.md`.
5. **Test dans l'app** :
   ```bash
   # dans design-system
   yalc publish
   # dans l'app
   yalc add @moi/ui
   # après chaque modification côté design-system
   yalc push
   ```
   Montre le résultat dans l'app.
6. **PR** : ouvre une PR (ou merge request) sur le dépôt de référence, avec la page de validation et le résumé du changement. Ne la fusionne pas toi-même.
7. **Une fois la nouvelle version disponible** (l'utilisateur s'en charge) : `yalc remove @moi/ui` dans l'app, passe à la nouvelle version, implémente le besoin initial. Propose un `audit` (`audit.md`) des autres apps pour repérer celles qui pourraient adopter l'option.
