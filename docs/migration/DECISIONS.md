# Décisions de migration (Vue 3 → Angular 22)

Décisions prises seul pendant la session autonome. Format : contexte, options, choix, raison.
Les décisions structurantes ont aussi un ADR dans `docs/adr/`.

## D-001 — Fichier de mission
- **Contexte** : la consigne demandait `docs/migration/MISSION.md` ; ce fichier n'existe pas sur `main`. Le seul fichier présent est `docs/migration/MIGRATION.md` (commit `deee662`), qui contient une mission complète.
- **Choix** : exécuter `MIGRATION.md`.
- **Raison** : seul candidat ; son contenu est la mission décrite.

## D-002 — Versions (vérifiées sur le registre npm le 2026-11-04)
- `@angular/core` **22.2.4** (dist-tag `latest`), `@angular/cdk` 22.2.x, `@angular/build`/`@angular/cli` 22.2.4.
- Prérequis lus dans les `package.json` publiés : Node `^22.22.3 || ^24.15.0 || >=26.0.0` (environnement : Node 22.23.4, conforme) ; TypeScript `>=6.0 <6.1` (le squelette `ng new` installe `~6.0.2`).
- Le squelette a été généré par `ng new` 22.2.4 (zoneless par défaut, Vitest comme lanceur de tests unitaires, Tailwind), puis adapté.
- **Limite réseau** : angular.dev n'a pas été consulté ; les sources sont le registre npm, les typings installés et `ng --help`.

## D-003 — Emplacement de l'application et de la référence Vue
- **Contexte** : la mission demande une app dans `apps/web`, une logique partagée en TS pur (`packages/core` ou `libs/`) et la conservation de la référence Vue (`legacy-vue/` « ou équivalent »).
- **Options** : (a) déplacer l'app Vue dans `legacy-vue/` et le code partagé dans `packages/core` ; (b) laisser l'app Vue à la racine (elle est la référence) et faire consommer à Angular le code partagé directement depuis `src/` par alias.
- **Choix** : (b). L'app Angular est `apps/web` (paquet pnpm `@orbat-mapper/web`) ; la référence Vue reste à la racine, exécutable et testée comme avant.
- **Raison** : (a) déplacerait ~1 250 fichiers, casserait le build et les 2 637 tests de référence pendant la migration, et rendrait les merges de l'amont quasi impossibles. (b) ne touche aucun fichier amont. Le déplacement physique vers `packages/core` se fera au nettoyage final, une fois la parité prouvée.

## D-004 — Réutiliser le domaine sur le moteur de réactivité `@vue/reactivity`
- **Contexte** : le scenario store (`immerStore.ts`) et les modules de domaine (`time.ts`, `geo.ts`, `unitManipulations.ts`, `notifications.ts`…) reposent sur la réactivité de Vue : proxys `reactive` mutés en place par les patches RFC 6902, `computed`, `toRaw`, `watch`. La mission impose de préserver cette logique « à l'identique ».
- **Options** : (a) réécrire le store et les modules en signals immuables (des milliers de lignes, risque de régression élevé, contraire à la règle 5) ; (b) écrire un moteur de réactivité maison compatible (réimplémenter Vue, risque élevé) ; (c) faire tourner le code partagé sur `@vue/reactivity`, paquet de réactivité indépendant de l'UI (aucun runtime de rendu Vue), et le relier aux signals Angular par un pont fin.
- **Choix** : (c). Le module `vue` importé par le code partagé est remplacé (alias `paths`) par `apps/web/src/shims/vue.ts`, qui réexporte `@vue/reactivity`. Le pont `reactiveSignal()` exécute un getter dans un `effect` de `@vue/reactivity` et alimente un signal Angular.
- **Raison** : seule option qui garde la logique du store intacte et vérifiable par les tests de référence existants. **Conséquence assumée** : le critère « plus aucune dépendance Vue » n'est pas atteint pour `@vue/reactivity` (voir KNOWN_GAPS G-001) ; aucune dépendance au framework Vue (`vue`, `pinia`, `vue-router`, `@vueuse/*`) n'est installée dans `apps/web`.

## D-005 — Substitution de modules par alias TypeScript
- **Contexte** : le code partagé importe `vue`, `@vueuse/core`, `pinia` et `@/scenariostore/localdb`.
- **Choix** : alias `paths` dans `apps/web/tsconfig.json` vers des modules de remplacement (`src/shims/*`, `core/persistence/localdb-adapter.ts`). Le builder esbuild d'Angular les applique aussi aux fichiers de `../../src` (vérifié par build et exécution).
- **Raison** : même patron que la table `STANDALONE_MODULES` de l'amont (`vite.singlefile.config.ts`) : aucune modification du code partagé.

## D-006 — État d'UI : services à signals, pas de Pinia
- **Choix** : l'état d'UI d'Angular vit dans des services `@Injectable({ providedIn: 'root' })` à base de signals. Le shim `pinia` ne sert qu'aux stores que le code partagé importe lui-même (ex. `useSymbolSettingsStore` dans `io.ts`).

## D-007 — Persistance via `ScenarioRepository`
- **Choix** : interface `ScenarioRepository` + jeton `SCENARIO_REPOSITORY`, implémentation `IndexedDbScenarioRepository` qui délègue au `localdb.ts` d'origine (même base `scenario-db`, mêmes stores : les scénarios de l'app Vue s'ouvrent dans l'app Angular). Le code partagé qui appelle `useIndexedDb()` passe par `localdb-adapter.ts`, qui délègue au dépôt actif. Les *handles* d'archives PMTiles restent locaux (ADR-0004).

## D-008 — Ressources publiques
- **Contexte** : le builder Angular refuse un dossier d'assets hors de la racine du workspace (`The ../../public asset path must be within the workspace root`).
- **Choix** : lien symbolique `apps/web/public → ../../public`.
- **Raison** : une seule copie des démos et de la config ; pas de script de copie.

## D-009 — Options TypeScript alignées sur l'amont pour le code partagé
- **Contexte** : `noImplicitReturns` et `noPropertyAccessFromIndexSignature` (squelette `ng new`) font échouer le code partagé, que l'amont compile sans ces options.
- **Choix** : `strict: true` conservé ; ces deux options retirées.
- **Raison** : ne pas modifier le code partagé ; la sévérité reste celle de l'amont (`strict`).

## D-010 — Installation dans cet environnement : `xlsx` factice, jamais commité
- **Contexte** : `xlsx` est installé depuis `cdn.sheetjs.com`, hôte refusé par la politique réseau de la session (403 du proxy). Contourner ce refus est exclu.
- **Choix** : pour l'installation locale seulement, `xlsx` pointe sur un paquet factice dans le scratchpad, puis `package.json` est restauré et l'entrée du lockfile est remise à l'URL d'origine (vérifié par `pnpm install --frozen-lockfile --lockfile-only`). Rien de factice n'est commité. La CI GitHub, qui a accès à l'hôte, installe le vrai paquet.
- **Conséquence** : l'import/export XLSX ne peut pas être vérifié ici (KNOWN_GAPS G-002).
