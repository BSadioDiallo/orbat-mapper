# 02 — Plan de migration Vue 3 → Angular 22

## 1. Architecture de transition

```
/                      app Vue (référence, inchangée)       → pnpm dev / pnpm test
├── src/               code partagé : modèles, store, domaine, import/export, symbologie (inchangé)
└── apps/web/          app Angular 22 (@orbat-mapper/web)  → pnpm --filter @orbat-mapper/web start
    ├── src/shims/     vue → @vue/reactivity, @vueuse/core, pinia (pour le code partagé seulement)
    └── src/app/
        ├── core/persistence/  ScenarioRepository + IndexedDB + adaptateur localdb
        ├── core/scenario/     ScenarioService + reactiveSignal (pont store → signals)
        ├── core/ui/           services d'état d'UI (signals)
        ├── shared/            composants UI atomiques (boutons, dialogues, menus…)
        └── features/          pages et écrans (landing, editor, orbat, map, …)
```

Le code partagé est consommé **par alias TypeScript** (`@/*` → `../../src/*`), avec substitution des modules couplés au framework (DECISIONS D-003 à D-005). Au nettoyage final, il sera déplacé dans `packages/core` et l'app Vue supprimée, **seulement si la parité est vérifiée**.

## 2. Table de correspondance

| Vue 3 / écosystème | Angular 22 | Remarque |
|---|---|---|
| `ref`, `computed` (UI) | `signal`, `computed`, `linkedSignal` | |
| `watch`, `watchEffect` (UI) | `effect` (avec parcimonie), `afterRenderEffect` pour le DOM | préférer `computed` |
| lecture du store partagé (`reactive`) | `reactiveSignal(getter)` / `ScenarioService.select()` | pont `@vue/reactivity` → signal |
| `defineProps` / `defineEmits` | `input()` / `output()` | |
| `defineModel`, `v-model` personnalisé | `model()` | |
| slots / slots nommés | projection `<ng-content select>` ; `ng-template` + `ngTemplateOutlet` pour les slots à portée | |
| `v-if` / `v-for` / `v-show` | `@if` / `@for (… ; track …)` / `[hidden]` ou classe | `track` par id |
| `defineAsyncComponent`, routes lazy | `loadComponent`, `@defer` | |
| Pinia (état UI) | services `providedIn: 'root'` à signals | |
| Pinia (stores lus par le code partagé) | shim `pinia` (singleton `reactive`) | |
| composables | services injectables ou fonctions `inject*()` | |
| `provide` / `inject` | DI hiérarchique (`providers`, `inject()`) | |
| vue-router | `@angular/router` (fonctionnel, `withComponentInputBinding`, guards fonctionnels) | `beforeRouteLeave` → `CanDeactivateFn` |
| `<Teleport>` | CDK Overlay / Portal | |
| `<Transition>` | animations CSS (classes Tailwind `tw-animate-css`) | `@angular/animations` évité |
| `@vueuse/core` (`useLocalStorage`, `onKeyStroke`, `useEventListener`, `useElementSize`, `useClipboard`…) | services maison sur Web APIs, `host` listeners, `ResizeObserver`, CDK `Clipboard` | |
| `reka-ui` / shadcn-vue (`components/ui/*`) | CDK (Overlay, Menu, Dialog, Listbox, A11y) + composants maison stylés Tailwind | mêmes classes que shadcn |
| TanStack Vue Table | `@tanstack/table-core` + composant Angular maison | |
| TanStack Vue Virtual / listes longues | CDK `ScrollingModule` (`cdk-virtual-scroll-viewport`) | |
| `@heroicons/vue`, `@lucide/vue`, `vue-mdi` | `@lucide/angular` ou SVG inline | à vérifier |
| `vue-global-events` | `host: { '(document:keydown)': … }` | |
| `@vue/test-utils` | `TestBed` + Vitest (`ng test`) | |
| `v-html` (Markdown) | `[innerHTML]` (sanitisation Angular `DomSanitizer` par défaut) | sécurité au moins équivalente |

## 3. Lots

| # | Lot | Contenu | Dépend de |
|---|---|---|---|
| 0 | Socle | workspace, shims, dépôt, pont, lint, CI | — |
| 1 | **Tranche verticale** | accueil (démos + scénarios stockés), éditeur : arbre ORBAT, carte avec unités, sélection, détails/édition d'unité, undo/redo, sauvegarde, rechargement, brouillon | 0 |
| 2 | Shell | barre principale, menus Fichier/Édition, notifications, raccourcis globaux, thème sombre | 1 |
| 3 | UI atomique | boutons, dialogues, menus, popovers, tooltips, champs | 2 |
| 4 | Écrans simples | nouveau scénario, navigateur de symboles, infos scénario | 3 |
| 5 | Arbre ORBAT complet | glisser-déposer, menus contextuels, recherche, filtres | 3 |
| 6 | Carte et dessin | contrôleur de couches MapLibre de l'amont, dessin tactique, mesures | 3 |
| 7 | Temps | timeline, événements, lecture | 3 |
| 8 | Couches et features | panneau de couches, détails des features | 6 |
| 9 | Import/export | tous formats (les convertisseurs sont partagés) | 3 |
| 10 | Paramètres, ToE, ressources | équipement, personnel, fournitures, statuts | 3 |
| 11 | Écrans restants | grille, organigramme, text-to-ORBAT, import par lien | 3 |
| 12 | Parité, e2e, nettoyage | Playwright, comparaison Vue/Angular, KNOWN_GAPS | tous |

Chaque lot : portage → tests → comparaison avec la référence Vue → mise à jour du suivi → lint/type-check/tests/build → commit → push.
