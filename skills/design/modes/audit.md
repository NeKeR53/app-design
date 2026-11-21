# Mode `audit [app]`

Compare une app à la spec de sa version installée, et signale aussi l'écart avec la dernière version du dépôt de référence.

## Options

- `--scope tokens|composants|pages|comportements|tout` (par défaut `tout`).
- `--component <X>` : un seul composant.

## Ce que tu vérifies

- **Tokens** : couleurs, tailles, espacements écrits en dur, variables CSS inexistantes.
- **Composants** : composants maison qui remplacent un composant du design system, imports directs de la librairie headless, surcharges de style, props utilisées hors spec.
- **Pages** : écrans qui n'utilisent pas de gabarit, mise en page faite à la main, informations placées hors de la zone prévue par `layout-rules.md`.
- **Comportements** : règles de comportement contournées (état de la sidebar forcé, persistance différente…), réglages posés au mauvais niveau.
- **Garde-fous** : ceux de `../assets/guardrails.md` qui concernent les apps (config ESLint partagée en place, pas d'import de chemins internes).

## Rapport

Écris-le dans `docs/design-audit.md` de l'app :

```
# Audit design — <app> — <date>
Version installée : <x.y.z> — dernière : <x.y.z>
## Synthèse
<n> écarts : <n> bloquants, <n> à corriger, <n> mineurs
## Écarts
### <gravité> — <titre>
- Où : <fichier:ligne>
- Règle : <spec ou décision>
- Constat : <une phrase>
- Correction : <une phrase> | Hors design → propose
```

Gravité :
- **bloquant** : casse une règle de comportement ou réinvente un composant ;
- **à corriger** : style ou placement non conforme ;
- **mineur** : cosmétique.
