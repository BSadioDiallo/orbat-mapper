# Écarts connus

Format : élément · symptôme · contournement · piste de correction.

## G-001 — `@vue/reactivity` reste une dépendance de l'app Angular
- **Symptôme** : critère n°4 de la définition de terminé non atteint pour ce paquet.
- **Contournement** : moteur de réactivité du domaine partagé uniquement, derrière `src/shims/vue.ts` ; aucun runtime de rendu Vue, ni `vue`, `pinia`, `vue-router`, `@vueuse/*` dans `apps/web/package.json`.
- **Piste** : remplacer, module par module, les `reactive`/`computed` du domaine par un store immuable (Immer produit déjà des états à partage structurel) exposé en signals ; les tests de référence du domaine servent de filet.

## G-002 — XLSX non vérifiable dans cet environnement
- **Symptôme** : `cdn.sheetjs.com` refusé par la politique réseau ; le paquet installé localement est factice.
- **Contournement** : aucun ; la CI GitHub installe le vrai paquet.
- **Piste** : vérifier l'import/export XLSX en CI ou sur un poste connecté.

## G-003 — Arbre ORBAT partiel
- **Symptôme** : glisser-déposer, menus contextuels, recherche/filtre, multi-sélection par plage, virtualisation de `OrbatTree.vue` absents. Les enfants ne sont rendus que dépliés (les arbres repliés restent légers), mais un arbre entièrement déplié de milliers d'unités n'est pas virtualisé.
- **Contournement** : arbre récursif, chaque élément ne lit que son unité (`ScenarioService.select`).
- **Piste** : arbre aplati + `cdk-virtual-scroll-viewport` ; drag-and-drop avec `@atlaskit/pragmatic-drag-and-drop` (indépendant du framework, déjà dans l'amont).

## G-004 — Rendu carte partiel
- **Symptôme** : `UnitLayer` reprend le cœur de `MlMapLogic.vue` (symbole, ancre, surlignage de sélection, étiquettes) mais pas : groupes de visibilité par zoom, source des unités en mouvement, symboles personnalisés, anneaux de portée, historique, déplacement par glisser, survol, menu contextuel, contrôles (projection, globe, terrain, boussole), choix du fond de carte, surface de dessin tactique.
- **Contournement** : TODO(migration) dans `features/map/unit-layer.ts` ; le contrôleur de couches de l'amont dessine déjà les entités et couches du scénario.
- **Piste** : porter `MlMapLogic.vue` en classe TS liée par signals, fonction par fonction (le code est surtout impératif).

## G-005 — Accueil : chargement par presse-papier et fichiers chiffrés
- **Symptôme** : le collage d'un scénario et le déchiffrement d'un fichier chiffré ne sont pas portés ; un fichier chiffré ou dont l'id existe est redirigé vers `/import`, route pas encore portée.
- **Piste** : porter `ImportScenarioView.vue` et `DecryptScenarioModal` (le chiffrement `src/utils/crypto.ts` est partagé).

## G-006 — Routes non portées
- `/import`, `/text-to-orbat`, `/symbol-browser`, `/scenario/:id/grid-edit`, `/scenario/:id/chart-edit` : redirigées vers l'accueil (`**`).

## G-007 — e2e hors CI
- **Symptôme** : `apps/web/e2e/critical-paths.e2e.cjs` utilise le Playwright et le Chromium préinstallés de l'environnement ; il n'est pas lancé par la CI GitHub.
- **Piste** : ajouter `@playwright/test` et l'installation des navigateurs dans un job CI dédié.

## G-008 — Nouveau scénario : sélecteurs simplifiés
- **Symptôme** : `SymbolCodeSelect` (liste illustrée de symboles) et `StandardIdentitySelect` (avec couleur de remplissage personnalisée) sont remplacés par des `<select>` natifs ; la couleur de remplissage d'un side n'est pas proposée.
- **Piste** : porter ces deux composants avec le lot « UI atomique » (CDK Listbox/Overlay).
