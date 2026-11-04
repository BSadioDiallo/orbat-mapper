# État de la migration (mémoire du projet)

> À relire en premier après une interruption, avec `DECISIONS.md` et `KNOWN_GAPS.md`.

## Ligne de base (référence Vue, 2026-11-04)
- Commande : `npx vitest run` à la racine (Vitest 4.1.12, jsdom).
- Résultat : **279 fichiers réussis, 1 ignoré (280) ; 2 637 tests réussis, 5 ignorés (2 642)** ; durée 158 s.
- Couverture : **non mesurée** (aucun outil de couverture installé ni configuré dans l'amont).
- Environnement : `xlsx` factice (DECISIONS D-010) ; aucun test n'a échoué à cause de lui.

## Lots
| Lot | État | Vérification |
|---|---|---|
| Étape 0 — branche, suivi, ligne de base | fait | ligne de base ci-dessus |
| Étape 2a — workspace `apps/web` (Angular 22.2.4, zoneless, Vitest, Tailwind) | fait | `ng build` OK ; app lancée dans Chromium |
| Étape 2b — shims `vue`/`@vueuse/core`/`pinia`, alias | fait | le domaine partagé compile et charge une démo |
| Étape 2c — `ScenarioRepository` + IndexedDB | fait | `indexeddb-scenario-repository.spec.ts` (fake-indexeddb) |
| Étape 2d — pont `reactiveSignal` + `ScenarioService` | fait | `reactive-signal.spec.ts` (équivalence avec `computed` Vue, undo/redo, mutation en place, entrées Angular, désabonnement) |
| Étape 2e — lint, format, CI | fait | `eslint .`, `prettier --check`, `.github/workflows/web-ci.yml` (non encore exécuté sur GitHub au moment de l'écriture) |
| Étape 1 — inventaire, plan, matrice | fait | `01-inventory.md`, `02-plan.md`, `03-parity-matrix.md` (143 lignes) |
| Étape 3 — tranche verticale | fait | e2e 21/21, tests composants, parité de sérialisation des 3 démos |

## Tests Angular (apps/web)
`ng test` : 4 fichiers, 15 tests réussis. e2e : 21/21 (`apps/web/e2e/critical-paths.e2e.cjs`, Chromium headless).

## Prochaine action précise
Lot « shell » : menu principal (Fichier : sauvegarder, télécharger JSON, nouveau, ouvrir), notifications (toasts de `useNotifications`), raccourcis globaux ; puis `/newscenario`.
