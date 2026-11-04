# Rapport du matin (mis à jour en continu)

**Dernière mise à jour** : 2026-11-04 (session autonome en cours).

## En bref
- L'app **Angular 22.2.4** (`apps/web`, zoneless, standalone, OnPush, signals, Signal Forms) fait fonctionner **le parcours central** : accueil → démo ou scénario stocké → arbre ORBAT → carte avec unités → sélection → édition → undo/redo → sauvegarde IndexedDB → rechargement, brouillon et invite de sortie.
- Création de scénario (`/newscenario`), notifications, menu principal (partiel) et panneau d'infos du scénario portés.
- Preuves : **17 tests unitaires/composants** Angular, **e2e 28/28** dans Chromium headless, **parité de sérialisation** des 3 démos avec l'app Vue (mêmes données produites après chargement, édition, undo, redo).
- Matrice de parité : **8 lignes vérifiées, 8 partielles, 130 non commencées sur 146**. L'essentiel de l'interface Vue (533 composants) reste à porter.

## Lancer
```bash
pnpm install
pnpm --filter @orbat-mapper/web start      # app Angular, http://localhost:4200
pnpm --filter @orbat-mapper/web test       # tests unitaires et composants
pnpm --filter @orbat-mapper/web lint
pnpm --filter @orbat-mapper/web build
pnpm dev                                    # app Vue de référence, inchangée
```

## Décisions qui méritent votre attention
- La mission était dans `MIGRATION.md`, pas `MISSION.md` (D-001).
- L'app Vue reste à la racine comme référence ; Angular consomme le code partagé par alias, sans le modifier (D-003, D-005).
- Le domaine partagé tourne sur `@vue/reactivity` (moteur de réactivité seul) : le critère « zéro dépendance Vue » n'est pas atteint pour ce paquet (D-004, G-001).
- `xlsx` ne peut pas être installé dans cette session (hôte bloqué) : XLSX non vérifiable ici (D-010, G-002).
- Le rendu des unités sur la carte est une adaptation partielle de `MlMapLogic.vue` (D-015, G-004).

## Écarts connus
Voir `KNOWN_GAPS.md` (G-001 à G-007).
