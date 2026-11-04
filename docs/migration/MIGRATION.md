# MISSION AUTONOME (SESSION DE NUIT) : MIGRATION COMPLÈTE DE VUE 3 VERS ANGULAR 22

Tu es un architecte et ingénieur frontend senior, expert Angular (signals, zoneless, standalone) et Vue 3. Tu travailles sur mon fork de ORBAT Mapper :
https://github.com/BSadioDiallo/orbat-mapper (amont : orbat-mapper/orbat-mapper, licence MIT).

## MODE D'EXÉCUTION : 100 % AUTONOME, SANS INTERVENTION HUMAINE

Je lance cette session et je dors. **Personne ne répondra à tes questions pendant plusieurs heures.** Règles absolues :

1. **Tu ne me poses AUCUNE question et tu n'attends AUCUNE validation.** Jamais de « voulez-vous que… », « dois-je… », « confirmez… ». Ne termine jamais ton tour pour attendre une réponse.
2. **Quand une décision est nécessaire, tu tranches seul** : choisis l'option la plus simple, la plus standard et la plus conservatrice, puis consigne-la dans `docs/migration/DECISIONS.md` (contexte, options considérées, choix, raison). Pour les décisions structurantes, rédige aussi un ADR dans `docs/adr/` en respectant le format existant.
3. **Quand tu es bloqué sur un élément** (bibliothèque sans équivalent, bug, API Angular manquante, test récalcitrant) : timebox raisonnable (quelques tentatives avec des approches différentes), puis **contourne** : wrapper minimal, implémentation maison simple, ou version dégradée clairement marquée `// TODO(migration): …`. Consigne-le dans `docs/migration/KNOWN_GAPS.md` (élément, symptôme, contournement, piste de correction) et **passe à la suite**. Tu reviendras dessus en fin de parcours. **Un blocage local ne doit jamais arrêter la migration globale.**
4. **Tu ne t'arrêtes pas avant d'avoir atteint la « Définition de terminé »**, ou avant d'être réellement à court de budget de session. N'arrête jamais en disant « la suite pourra être faite plus tard » tant qu'il reste du travail faisable.
5. **Prudence git** : tu travailles uniquement sur la branche `feat/angular-migration`. Jamais de `push --force`, jamais de réécriture d'historique, jamais de modification de `main`, jamais de suppression de branches. Commits atomiques et fréquents ; **push après chaque lot terminé** (et au moins toutes les ~30 minutes) pour que rien ne soit perdu si la session s'interrompt.
6. **La branche doit rester dans un état exploitable** : après chaque lot, build et tests doivent passer. Ne laisse jamais la branche cassée en fin de lot. Si une tentative échoue, annule-la proprement (revert du lot en cours) plutôt que de laisser un état instable.
7. **Honnêteté** : ne marque jamais un élément « terminé » sans l'avoir exécuté et vérifié (tests, build, comparaison avec la référence Vue). Ne prétends pas à la parité sans preuve. Distingue toujours *vérifié* de *supposé*.
8. **Pas d'actions risquées hors périmètre** : n'installe rien de global, ne touche pas aux secrets, ne contacte aucun service tiers inutile, ne désactive pas les linters/tests pour « faire passer » le build.
9. Si le réseau est limité (ex. angular.dev inaccessible), appuie-toi sur les typings et la documentation embarqués dans `node_modules`, sur `ng --help` et sur les messages du compilateur ; consigne la limite dans `DECISIONS.md` et continue.

## CONTEXTE ET OBJECTIF

ORBAT Mapper est une SPA Vue 3 + TypeScript (Vite, Pinia, vue-router, Tailwind v4, MapLibre, milsymbol…) permettant de construire des ordres de bataille et de placer des unités sur une carte. Ma stack cible est **Angular 22 (front) + Spring Boot (back, plus tard)**.

**Objectif : transposer l'intégralité de l'application de Vue 3 vers Angular 22, de sorte que TOUT ce qui fonctionne aujourd'hui avec Vue fonctionne à l'identique avec Angular** : mêmes fonctionnalités, mêmes données, mêmes comportements, même ergonomie.

**Hors périmètre** : le backend Spring Boot n'est pas implémenté dans cette mission, et aucune nouvelle fonctionnalité produit n'est ajoutée. En revanche, toute la persistance passe par une interface `ScenarioRepository` (injectable) dont l'implémentation actuelle reste IndexedDB, pour brancher plus tard l'API sans refonte.

## RÈGLES TECHNIQUES NON NÉGOCIABLES

1. **Parité fonctionnelle complète**, suivie dans une matrice (voir plus bas). Aucune fonctionnalité ne disparaît silencieusement ; ce qui est reporté ou dégradé est listé dans `KNOWN_GAPS.md`.
2. **Angular 22 idiomatique et moderne** : composants standalone, signals (`signal`, `computed`, `linkedSignal`, `effect` avec parcimonie), `input()`/`output()`/`model()`, control flow (`@if`, `@for`, `@switch`, `@defer`), `inject()`, zoneless, OnPush, `resource`/`httpResource`, Signal Forms, Router fonctionnel avec lazy loading. Pas de NgModules, pas de patterns dépréciés, RxJS seulement quand un signal ne suffit pas.
3. **Vérifie les versions et API sur les sources officielles** (angular.dev, notes de version, guide de migration) ou via les typings installés. N'utilise pas ta mémoire pour les versions exactes, les API stables vs preview, ni les prérequis (Angular 22 requiert, à confirmer, TypeScript 6 et Node 22+). Évite les API en developer preview, sauf justification dans `DECISIONS.md`.
4. **Ne réécris pas ce qui est indépendant du framework** : modèles (`scenarioModels.ts`, `internalModels.ts`), conversions, calculs Turf, symbologie, import/export, parsing, logique temporelle (`syncTimedHierarchyProjection`) et utilitaires sont conservés tels quels. Tu adaptes uniquement la couche de liaison. Vérifie fichier par fichier ce qui importe `vue`, `pinia` ou `@vueuse`.
5. **Le scenario store (Immer + patches RFC 6902, undo/redo, Maps normalisées) est le cœur** : préserve sa logique à l'identique. Découple-le de Vue et expose-le à Angular via un pont fin à base de signals, couvert par des tests d'équivalence.
6. **Pas de régression de performance** : arbre ORBAT (milliers d'unités), carte et rendu des symboles restent fluides (virtualisation, `track`, `computed`, `@defer`, lazy routes).
7. **Conserve la licence MIT** et les mentions amont. Respecte `CLAUDE.md` (TypeScript strict, tests co-localisés, pas de lignes Co-Authored-By dans les commits) et mets-le à jour à la fin.

## ORDRE DE TRAVAIL (conçu pour qu'un résultat utile existe à tout moment)

### Étape 0 : Initialisation (rapide)
- Crée la branche `feat/angular-migration`.
- Conserve l'application Vue comme **référence** (dossier `legacy-vue/` ou équivalent) jusqu'à la validation finale de la parité.
- Lance les tests existants et note la ligne de base (nombre de tests, réussite, couverture) dans `docs/migration/MIGRATION_STATUS.md`.
- Crée les fichiers de suivi : `MIGRATION_STATUS.md` (mémoire du projet : état de chaque module, prochaine action précise), `DECISIONS.md`, `KNOWN_GAPS.md`, `MORNING_REPORT.md` (voir plus bas).

### Étape 1 : Inventaire et plan (rapide, ne t'y attarde pas plus que nécessaire, n'attends aucune validation)
Produis dans `docs/migration/` :
- `01-inventory.md` : inventaire exhaustif avec chemins (routes, composants `.vue`, composables, stores Pinia, scenario store, directives, plugins, `provide/inject`, `Teleport`, transitions, slots, `v-model` personnalisés, raccourcis clavier, drag-and-drop, import/export, thèmes, dossier `functions/`, scripts, build singlefile).
- `02-plan.md` : table de correspondance Vue → Angular (ref/computed/watch → signals ; props/emits/v-model/slots → input/output/model/projection ; Pinia → services signal-based ; composables → services ; vue-router → Angular Router ; Teleport → CDK Overlay ; `@vueuse` → équivalents CDK/Web APIs ; `reka-ui`/shadcn-vue → CDK/Angular Aria/headless Angular ; TanStack Vue Table/Virtual → adaptateurs Angular ou CDK ; icônes ; `@vue/test-utils` → TestBed ; etc.), choix de bibliothèques justifiés brièvement dans `DECISIONS.md`, plan de portage par lots.
- `03-parity-matrix.md` : liste de TOUTES les fonctionnalités utilisateur observables (appuie-toi sur le code ET sur `user-docs/`), avec composants Vue concernés, état Angular, moyen de vérification.

### Étape 2 : Socle Angular 22
- Workspace Angular 22 avec l'outillage officiel : TypeScript strict, zoneless, standalone, OnPush, ESLint, Prettier, Vitest, Tailwind v4. Organisation : monorepo pnpm existant, app dans `apps/web`, logique métier partagée en TS pur (`packages/core` ou `libs/`).
- `ScenarioRepository` (interface + implémentation IndexedDB reprenant le comportement actuel).
- Pont scenario store → signals avec tests d'équivalence.
- CI GitHub Actions : lint, type-check, tests, build.

### Étape 3 : Tranche verticale minimale (PRIORITÉ ABSOLUE)
Avant d'élargir, fais fonctionner de bout en bout le parcours central : l'app démarre, charge un scénario de démo depuis IndexedDB, affiche l'arbre ORBAT et la carte avec les unités, permet de sélectionner/éditer une unité, undo/redo, sauvegarde et rechargement. **Cette tranche doit être stable, testée et poussée avant tout le reste**, pour qu'au réveil j'aie au minimum une application Angular qui fonctionne sur l'essentiel.

### Étape 4 : Portage par lots, en largeur
Ordre : layout/routing/shell → composants UI atomiques (boutons, dialogues, menus, popovers, tooltips, formulaires) → écrans simples → arbre ORBAT complet → carte et dessin tactique → timeline/événements/lecture temporelle → couches et features → import/export (tous formats) → paramètres, raccourcis clavier, thèmes → écrans restants.

Pour chaque lot :
1. Porte les composants/services en respectant la table de correspondance et les règles techniques.
2. Porte ou écris les tests (unitaires et composants).
3. Compare le comportement avec la référence Vue (mêmes données, mêmes actions, mêmes résultats) et corrige les écarts.
4. Mets à jour `MIGRATION_STATUS.md`, `03-parity-matrix.md`, `MORNING_REPORT.md`.
5. Vérifie : lint, type-check, tests, build. **Commit puis push.**
6. Enchaîne immédiatement sur le lot suivant, sans pause.

Points d'attention : réactivité fine sans boucles d'`effect` ; cycle de vie explicite de MapLibre et des libs impératives (`afterNextRender`, `DestroyRef`, exécution hors détection si besoin, mises à jour pilotées par signals) ; formulaires en Signal Forms avec validation équivalente ; accessibilité au moins équivalente (CDK A11y/Angular Aria) ; raccourcis clavier, focus, dialogues et menus contextuels fidèles ; dark mode et responsive fidèles.

### Étape 5 : Vérification de parité
- Parcours systématique de la matrice de parité : tout passe à « vérifié » ou est consigné dans `KNOWN_GAPS.md` avec justification.
- Tests e2e Playwright en headless (si l'environnement le permet) des parcours critiques : création de scénario, arbre ORBAT, placement sur carte, timeline, dessin, import/export aller-retour sans perte, undo/redo, rechargement. Si possible, compare Vue et Angular sur les mêmes données (captures d'écran, exports JSON identiques).
- Test de non-régression de données : charge les scénarios d'exemple/démos du dépôt et vérifie que l'import/export et l'affichage sont identiques.
- Contrôle de performance sur un grand scénario et du poids de bundle.
- Vérification de sécurité front de base (sanitization du rendu Markdown, pas de contenu injecté non nettoyé).

### Étape 6 : Reprise des contournements, puis nettoyage
- Reprends un par un les éléments de `KNOWN_GAPS.md` et résous-les si possible.
- **Supprime le code Vue et les dépendances Vue/Pinia/vue-router/@vueuse/etc. UNIQUEMENT si la parité est vérifiée sur l'ensemble des fonctionnalités critiques.** Sinon, laisse `legacy-vue/` en place et dis-le clairement dans le rapport.
- Mets à jour `README.md`, `CLAUDE.md`, la documentation, les scripts `package.json` et `.github/`.

## CONTINUITÉ ET MÉMOIRE

- `docs/migration/MIGRATION_STATUS.md` est ta mémoire. Mets-le à jour après chaque lot, avec la **prochaine action précise**. Si ton contexte est compressé ou réinitialisé, **relis-le immédiatement** ainsi que `DECISIONS.md` et `KNOWN_GAPS.md`, puis continue exactement où tu en étais.
- **`MORNING_REPORT.md` (à la racine de `docs/migration/`) est mis à jour en continu, pas seulement à la fin.** Il doit toujours refléter l'état réel et contenir : pourcentage et liste des fonctionnalités migrées/vérifiées, ce qui fonctionne déjà (avec commandes pour lancer : `pnpm install`, `pnpm start`/dev, tests, build), ce qui reste, les écarts connus, les décisions prises à ma place qui méritent mon attention, l'heure du dernier commit et la prochaine action prévue.
- Si tu approches de la fin de ton budget de session : termine proprement le lot en cours, assure-toi que build et tests passent, commit, push, mets à jour `MIGRATION_STATUS.md` et `MORNING_REPORT.md` avec la prochaine action précise, puis arrête-toi avec un résumé bref. Ne laisse jamais la branche cassée.

## DÉFINITION DE « TERMINÉ »

1. Chaque ligne de la matrice de parité est « vérifiée » (ou justifiée dans `KNOWN_GAPS.md`).
2. Build Angular 22, lint, type-check et tous les tests passent ; couverture de la logique métier ≥ ligne de base.
3. Les parcours e2e critiques passent et donnent des résultats équivalents à la référence Vue sur les mêmes données.
4. Plus aucune dépendance Vue/Pinia/vue-router dans l'application finale, code legacy supprimé (si parité vérifiée).
5. Persistance exclusivement via `ScenarioRepository`, prête pour l'implémentation Spring Boot.
6. Application zoneless, OnPush, standalone, signal-first, sans API dépréciée.
7. Documentation à jour et rapport final `docs/migration/99-final-report.md` (migré, écarts, différences de comportement, améliorations futures, étapes pour brancher Spring Boot).

## DÉMARRAGE

Commence immédiatement par l'Étape 0, puis enchaîne sans interruption jusqu'à la fin. Ne produis aucun message d'attente, aucune question, aucun « voici le plan, dites-moi si ça vous convient ». Agis.
