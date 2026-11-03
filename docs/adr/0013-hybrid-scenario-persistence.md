# Persistance hybride du scénario : document JSONB versionné et index relationnels

Le contenu d'un scénario est stocké **tel quel, au format externe du front** (`Scenario`, `version` incluse) dans une colonne JSONB de `scenario_revision`, tandis que l'identité, les droits, les révisions et un `scenario_summary` (nom, début, nombre d'unités, noms des sides…) sont relationnels. Statut : proposé.

**Options.** (a) document opaque seul : simple mais sans recherche ni index ; (b) modèle relationnel complet : ~30 tables à recopier d'un format TypeScript qui évolue vite (version 3.7.0, `upgrade.ts` de 601 lignes), effort XL et dérive quasi certaine ; (c) hybride, retenu. **Conséquences :** les migrations de schéma restent côté client (le serveur stocke `schema_version`) ; le filtrage par rôle se fait sur le `JsonNode` à la dérivation d'une copie (ADR-0017) ; les recherches fines passent par des index extraits ajoutés au besoin.
