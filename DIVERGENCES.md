# Divergences avec l'amont (orbat-mapper/orbat-mapper)

Fichiers de l'amont modifiés par ce fork, et pourquoi. Objectif : en garder le moins possible
pour que les merges de l'amont restent simples (docs/backend/00-analysis.md §10).

| Fichier | Changement | Raison |
|---|---|---|
| `pnpm-workspace.yaml` | ajout de `packages: ["apps/*"]` | l'app Angular `apps/web` est un paquet du workspace |
| `pnpm-lock.yaml` | dépendances de `apps/web` | idem |
| `eslint.config.ts` | `apps/**` ignoré | `apps/web` a sa propre config ESLint (angular-eslint) |
| `vitest.config.ts` | `apps/**` exclu | `apps/web` lance ses tests avec `ng test` |
| `.gitignore` | `.angular` | cache du CLI Angular |
| `README.md` | section « Angular app » | lancement de l'app Angular |
| `CLAUDE.md` | section « Angular app » | conventions de `apps/web` |

Fichiers ajoutés (aucun conflit possible) : `apps/web/**`, `docs/migration/**`,
`.github/workflows/web-ci.yml`, ADR `docs/adr/0024-*` et `0025-*`, `DIVERGENCES.md`.
