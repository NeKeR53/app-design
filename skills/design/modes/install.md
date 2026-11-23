# Mode `install [chemin du dépôt de référence]`

Installe `@moi/ui` dans une app, fait la mise en place technique, puis met à jour le `CLAUDE.md` et l'`AGENTS.md` de l'app pour que l'IA lise la documentation livrée avec le package.

## Options

- `--source npm|yalc|git` : source du package (voir l'étape 3). Sans option, pose la question.
- `--no-setup` : installe le package et met à jour le `CLAUDE.md`, sans toucher au code de l'app.

## Déroulé

1. **Contexte.** Tu dois être dans une app : un `package.json` existe, et ce n'est pas le dépôt de référence (`../references/context.md`). Si `@moi/ui` est déjà dans les dépendances, dis-le, donne la version installée, et propose soit une mise à jour, soit de passer directement à l'étape 6.

2. **Dépôt de référence.** Prends le chemin donné en argument, ou celui du bloc `## Design system` s'il existe déjà, ou demande-le. Lis-y le nom et la version du package (`package.json`). Vérifie que `dist/` et `ai/` existent ; sinon, propose de lancer `npm run build` dans le dépôt de référence avant de continuer.

3. **Source du package.** Une question, avec ta recommandation :
   - `npm` : le package est publié sur un registre (npm public, ou registre privé configuré dans le `.npmrc` de l'app). Version figée et reproductible, et la CI de l'app peut l'installer. Recommandé dès que le package est publié (la publication reste hors périmètre de ce skill).
   - `yalc` : le dépôt de référence est sur la même machine, et le package n'est pas publié. [yalc](https://github.com/wclr/yalc) (licence MIT) copie le package comme le ferait une publication, sans lien symbolique : pas de double copie de React, contrairement à `file:` ou `npm link`. Recommandé pour une app pilote et pendant le développement du design system.
   - `git` : dépôt git avec le tag de la version (`git+<url>#v<version>`). Pour une version figée sans registre ; demande que le tag existe (ce skill ne crée ni ne pousse de tag sans accord).
   N'utilise pas `file:` ni `npm link` : les liens symboliques font charger deux copies de React par l'app.

4. **Installation.** Repère le gestionnaire de paquets d'après le fichier de verrouillage (`package-lock.json` → npm, `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lock` → bun). Vérifie les dépendances pairs du package (`peerDependencies`, par exemple React) : si l'app ne les satisfait pas, arrête-toi et dis ce qui manque. Puis, selon la source :
   - `npm` : `npm install @moi/ui@<version>` (ou l'équivalent du gestionnaire).
   - `yalc` : avant la première utilisation, dis que `npx yalc` télécharge yalc depuis npm et demande l'accord. Ensuite :
     1. dans le dépôt de référence : `npm run build`, puis `npx yalc publish` (ajoute `--private` si le `package.json` du package contient `"private": true` : sinon yalc refuse de publier) ;
     2. dans l'app : `npx yalc add @moi/ui`, puis l'installation du gestionnaire (`npm install`…), qui résout la dépendance `file:.yalc/@moi/ui` ajoutée au `package.json` ;
     3. ajoute `.yalc` et `yalc.lock` au `.gitignore` de l'app : cette installation est locale ;
     4. n'exclus jamais les fichiers `.md` du package (`.yalcignore`, `.gitignore`) : le dossier `ai/` en dépend.
     Préviens l'utilisateur : la CI et les autres machines ne voient pas une installation yalc. Avant de livrer l'app, il faut passer à `npm` (`npx yalc remove @moi/ui`, puis installer la version publiée).
   - `git` : `npm install git+<url>#v<version>` (ou l'équivalent du gestionnaire).

5. **Mise en place technique** (sauf `--no-setup`). Suis la section « Mise en place » de `node_modules/@moi/ui/ai/AI.md`, qui fait foi pour la version installée. En général :
   - importer les styles une seule fois, dans le point d'entrée de l'app ;
   - envelopper la racine dans le provider du design system, avec le nom de l'app comme préfixe de mémorisation ; les autres réglages gardent leur valeur par défaut, sauf demande de l'utilisateur ;
   - si l'app utilise Tailwind, importer le thème partagé dans son CSS principal ;
   - si l'app a une configuration ESLint à plat, y ajouter la configuration partagée ; ajouter le script de contrôle du CSS dans `package.json`.
   Fais des modifications minimales, sans réorganiser le code de l'app, et montre-les.

6. **`CLAUDE.md` et `AGENTS.md`.** Prends le bloc `## Design system` dans `docs/claude-md-app.md` du dépôt de référence (à défaut, dans `../assets/claude-md-app.md`), et remplis le nom du package, sa version et le chemin du dépôt de référence.
   - Si le fichier contient déjà une section `## Design system`, remplace-la jusqu'au titre `## ` suivant. Ne touche pas au reste du fichier.
   - Sinon, ajoute le bloc à la fin.
   - Mets à jour `CLAUDE.md` et, s'il existe, `AGENTS.md`. Si aucun des deux n'existe, crée `CLAUDE.md`, et demande s'il faut aussi un `AGENTS.md` (Codex).

7. **Vérification.**
   - `node_modules/@moi/ui/ai/AI.md` existe et annonce la version installée.
   - Le build et la vérification de types de l'app passent.
   - Lance l'app et vérifie que les styles du design system s'appliquent (une page affichée, sans erreur dans la console).
   Signale tout échec avec sa sortie ; ne le contourne pas.

8. **Fin.** Résume : version installée, source, fichiers modifiés. Avec `yalc`, rappelle la commande de mise à jour : dans le dépôt de référence, `npm run build` puis `npx yalc push --update` (avec `--private` si besoin) met à jour toutes les apps qui l'utilisent. Sans `--update`, seul le dossier `.yalc` de l'app change : avec pnpm, `node_modules` garde l'ancienne copie. Ne commite rien sans demande. Propose ensuite `audit` (`audit.md`), puis `apply` (`apply.md`), pour mettre l'app en conformité.
