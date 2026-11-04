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
| Étape 2c — `ScenarioRepository` + IndexedDB | fait (sans tests) | — |
| Étape 2d — pont `reactiveSignal` + `ScenarioService` | fait (sans tests) | démo chargée, signal `isReady` mis à jour |

## Prochaine action précise
Commit/push du socle, puis tests d'équivalence du pont et du dépôt, ESLint/Prettier, CI ; ensuite inventaire (`01-inventory.md`).
