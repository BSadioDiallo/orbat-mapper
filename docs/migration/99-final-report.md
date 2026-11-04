# 99 — Rapport de fin de session (migration Vue 3 → Angular 22)

> **État : migration non terminée.** La définition de terminé de `MIGRATION.md` n'est pas atteinte (détail §5). Ce rapport décrit l'état réel à la fin de la session autonome du 2026-11-04 ; il sera remplacé par le rapport final quand la parité sera vérifiée.

## 1. Ce qui est migré et vérifié

App Angular **22.2.4** dans `apps/web` (zoneless, composants standalone, OnPush, signals, `input`/`output`, control flow, Signal Forms, routes paresseuses, CDK Menu/A11y).

| Parcours | Preuve |
|---|---|
| Accueil : démos, scénarios stockés (recherche, tri, ouvrir, supprimer, dupliquer, télécharger, copier), thème sombre | e2e |
| Ouverture d'une démo ou d'un scénario stocké par URL | e2e |
| Arbre ORBAT (sides, groupes, unités, dépliage, symboles) et sélection | e2e, test composant |
| Carte MapLibre : unités à l'heure courante, entités du scénario (contrôleur amont réutilisé), clic de sélection | capture comparée (clic carte non testé automatiquement) |
| Détails et édition d'une unité (nom, nom court, description) | e2e, tests composants |
| Undo / redo (boutons, Ctrl+Z, Ctrl+Y) | e2e, test d'équivalence du pont |
| Sauvegarde IndexedDB, rechargement, brouillon et reprise, invite de sortie | e2e |
| Nouveau scénario | e2e |
| Notifications | test composant, e2e |
| Menu principal (partie Fichier/Édition), panneau d'infos du scénario | test composant, e2e |
| Heure du scénario, jour ±, événement ±, liste et détails des événements, cadrage sur le lieu | e2e |
| **Parité de données** : chargement, édition, undo, redo des 3 démos sérialisés à l'identique de l'app Vue | `parity.spec.ts` contre `vue-reference.json` produit par l'app Vue |

Chiffres : 17 tests Angular (5 fichiers), e2e **36/36** (`apps/web/e2e/critical-paths.e2e.cjs`), CI GitHub verte sur les commits vérifiés (jobs Angular et Vue de référence). Référence Vue inchangée : 279 fichiers de tests, 2 637 tests réussis.

## 2. Ce qui reste

Matrice de parité (`03-parity-matrix.md`) : **8 lignes vérifiées, 11 partielles, 130 non commencées sur 149**. Principaux blocs non portés : modes Grille et Organigramme, dessin (géométries, mesures, graphiques tactiques, symboles ponctuels), couches et fonds de carte, import/export (tous formats ; les convertisseurs sont partagés et prêts à l'emploi), partage, chiffrement, text-to-ORBAT, navigateur de symboles, ToE/ressources/statuts, timeline, lecture et enregistrement, raccourcis et palette de commandes, Labs (viewshed, terrain), mobile. Détails des écarts dans `KNOWN_GAPS.md` (G-001 à G-012).

## 3. Différences de comportement connues

- Menus d'actions des scénarios stockés : `<select>` natif à la place du menu déroulant (P-002).
- Nouveau scénario : sélecteurs natifs à la place des listes illustrées ; pas de couleur de remplissage par side (G-008).
- Formatage de l'heure : fuseau passé par `resolveTimeZone` (fuseaux militaires acceptés) (G-011).
- Carte : rendu des unités partiel (G-004) ; un seul calque d'unités, sans groupes de visibilité par zoom.

## 4. Décisions qui méritent votre attention

D-001 (fichier de mission), D-003/ADR-0025 (Vue conservée à la racine), D-004/ADR-0024 (`@vue/reactivity` sous le domaine partagé), D-010 (`xlsx` non installable ici), D-015 (rendu carte adapté de `MlMapLogic.vue`), D-018 (substitution de `scenarioUtils`).

## 5. Définition de terminé : état

| Critère | État |
|---|---|
| 1. Matrice entièrement vérifiée | **non** (8/149) |
| 2. Build, lint, type-check, tests ; couverture ≥ ligne de base | build/lint/type-check/tests **oui** ; couverture : la ligne de base n'était pas mesurée (aucun outil dans l'amont) |
| 3. e2e critiques équivalents à la référence | **partiel** (36 contrôles sur le parcours central ; comparaison de données automatisée ; pas de comparaison visuelle automatisée Vue/Angular) |
| 4. Plus de dépendance Vue/Pinia/vue-router, legacy supprimé | **non** : app Vue conservée (parité non vérifiée) ; `@vue/reactivity` sous le domaine (G-001) ; ni `vue`, ni `pinia`, ni `vue-router` dans `apps/web` |
| 5. Persistance exclusivement via `ScenarioRepository` | **oui** pour l'app Angular (le code partagé passe par l'adaptateur de `localdb`) |
| 6. Zoneless, OnPush, standalone, signal-first, sans API dépréciée | **oui** pour le code écrit (règle ESLint `prefer-on-push`, `prefer-signals`) |
| 7. Documentation et rapport final | rapport provisoire (ce fichier) ; README, CLAUDE.md, suivi à jour |

## 6. Brancher Spring Boot

1. Implémenter `ScenarioRepository` (`apps/web/src/app/core/persistence/scenario-repository.ts`) avec `HttpClient`/`httpResource` : `listScenarios` → `GET /api/v1/scenarios`, `loadScenario` → `GET …/{id}/content`, `putScenario` → `PUT …/{id}/content` avec `If-Match`, `addScenario` → `POST`, etc. (contrat proposé dans `docs/backend/01-architecture.md` de la branche `claude/fervent-gauss-l6jtbn`).
2. Garder les brouillons (`putScenarioDraft` & co.) en IndexedDB local : déléguer ces méthodes à `IndexedDbScenarioRepository`.
3. Fournir l'implémentation : `provideScenarioRepository(HttpScenarioRepository)` dans `app.config.ts`. Le code partagé (`io.ts`) suit automatiquement via `localdb-adapter.ts`.
4. Gérer 401/403/409/412 dans l'éditeur (`ScenarioEditorPage.load/save`).

## 7. Améliorations futures

Porter `MlMapLogic.vue` complètement (G-004) ; arbre ORBAT virtualisé (G-003) ; e2e en CI avec `@playwright/test` (G-007) ; comparaison visuelle Vue/Angular ; puis remplacement progressif de la réactivité du domaine (G-001).
