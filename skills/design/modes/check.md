# Mode `check "<demande>"`

Vérifie, en contexte app, qu'une demande d'UI rentre dans le design de la version installée. Ce mode se déclenche automatiquement sur toute demande d'UI dans une app.

## Déroulé

1. Identifie les composants, gabarits, zones et règles concernés, dans la spec de la version installée.
2. Classe la demande :
   - **Prévu** : la spec couvre le besoin. Implémente-le avec les props et zones prévues, et cite la section de spec utilisée.
   - **Prévu dans une version plus récente** : signale-le, avec les changements entre les deux versions, et laisse l'utilisateur décider de mettre à jour.
   - **Placement non couvert** : aucune règle de `layout-rules.md` ne s'applique. Pose la question. Si la réponse vaut pour toutes les apps, propose d'ajouter la règle via `propose` (`propose.md`).
   - **Hors design** : la spec ne prévoit pas l'option, la variante ou le comportement. Dis-le clairement (« Hors design : `MenuItem` ne prévoit pas de menu contextuel »), n'implémente rien de local et propose `propose`.
3. Si la demande est métier (rien de générique), propose une solution qui assemble les composants existants dans l'app, sans toucher au design.
