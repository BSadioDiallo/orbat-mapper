# 03 — Matrice de parité fonctionnelle

> États : **vérifié** (exécuté et comparé à la référence Vue, preuve citée) · **partiel** (porté, écarts listés) · **non commencé**.
> Lignes P-001…P-013 : parcours central (tranche verticale). Lignes suivantes : une par section de `user-docs/guide/` (fonctionnalités observables documentées).

| ID | Fonctionnalité | Composants Vue | Source | État Angular | Vérification |
|---|---|---|---|---|---|
| P-001 | Démarrage de l’app, page d’accueil | views/LandingPage.vue | user-docs + code | partiel | page portée (titre, démos, scénarios stockés, thème sombre) ; liens Text to ORBAT / Symbol Browser, collage presse-papier et déchiffrement absents (G-005) ; e2e `apps/web/e2e/critical-paths.e2e.cjs` (21/21) |
| P-002 | Liste des scénarios stockés (tri, ouverture, suppression, duplication, téléchargement, copie) | views/LandingPageScenarios.vue, components/StoredScenarioBrowser.vue, composables/browserScenarios.ts | user-docs + code | partiel | liste, recherche, tri, actions Open/Delete/Download/Duplicate/Copy portées (menu natif `<select>` au lieu du menu déroulant) ; actions groupées absentes ; ouverture vérifiée par e2e `apps/web/e2e/critical-paths.e2e.cjs` (21/21) |
| P-003 | Ouverture d’un scénario de démo | views/DemoScenarioCards.vue, scenariostore/io.ts#loadDemoScenario | user-docs + code | vérifié | e2e `apps/web/e2e/critical-paths.e2e.cjs` (21/21) : ouverture de `demo-narvik40`, nom du scénario |
| P-004 | Ouverture d’un scénario stocké par URL `/scenario/:id` | modules/scenarioeditor/ScenarioEditorWrapper.vue | user-docs + code | vérifié | e2e `apps/web/e2e/critical-paths.e2e.cjs` (21/21) : rechargement de `/scenario/<id>` après sauvegarde |
| P-005 | Arbre ORBAT (sides, groupes, unités, dépliage) | components/OrbatTree.vue, OrbatSide.vue, OrbatTreeItem.vue | user-docs + code | partiel | sides, groupes, unités, dépliage, symbole, nom court, statut renforcé ; glisser-déposer, menus contextuels, recherche, filtres, virtualisation absents (G-003) ; test `editor-components.spec.ts` |
| P-006 | Carte MapLibre avec les unités à l’heure courante | modules/maplibreview/ScenarioEditorMaplibre.vue | user-docs + code | partiel | unités à l’heure courante dessinées (capture comparée), entités du scénario par le contrôleur amont ; groupes de visibilité par zoom, symboles personnalisés, anneaux, historique, déplacement absents (G-004) |
| P-007 | Sélection d’une unité (arbre ↔ carte) | stores/selectedStore.ts | user-docs + code | partiel | arbre → détails vérifié (e2e, test composant) ; clic carte → sélection implémenté, non vérifié automatiquement |
| P-008 | Édition d’une unité (nom, nom court, description, SIDC) | modules/scenarioeditor/UnitDetails.vue, UnitEditForm | user-docs + code | partiel | nom, nom court, description (Signal Forms, nom requis) vérifiés ; autres onglets de UnitDetails.vue absents |
| P-009 | Undo / redo (boutons et raccourcis) | composables/immerStore.ts, ScenarioEditor.vue | user-docs + code | vérifié | e2e `apps/web/e2e/critical-paths.e2e.cjs` (21/21) : boutons, Ctrl+Z, Ctrl+Y ; test d’équivalence `reactive-signal.spec.ts` ; Cmd+Z/Cmd+Shift+Z portés, non testés |
| P-010 | Sauvegarde dans le navigateur et rechargement | scenariostore/io.ts#saveToIndexedDb | user-docs + code | vérifié | e2e `apps/web/e2e/critical-paths.e2e.cjs` (21/21) ; parité de sérialisation `parity.spec.ts` (3 démos, identique à la référence Vue) |
| P-011 | Brouillon automatique et reprise de brouillon | io.ts#persistDraftNow, ScenarioDraftRecoveryModal.vue | user-docs + code | vérifié | e2e `apps/web/e2e/critical-paths.e2e.cjs` (21/21) : brouillon proposé après rechargement, restauration |
| P-012 | Invite de sauvegarde en quittant | ScenarioLeavePromptModal.vue | user-docs + code | vérifié | e2e `apps/web/e2e/critical-paths.e2e.cjs` (21/21) : invite, Cancel reste, Discard quitte |
| P-013 | Nouveau scénario | modules/scenarioeditor/NewScenarioView.vue | user-docs + code | vérifié | e2e `critical-paths.e2e.cjs` (25/25) : formulaire (nom, sides, unités racines, heure, fuseau, standard), création, ORBAT initial, pas d’undo ; sélecteurs natifs à la place de `SymbolCodeSelect`/`StandardIdentitySelect` (pas de couleur de remplissage) |
| P-014 | Export a chart |  | user-docs/guide/chart-edit-mode.md | non commencé | — |
| P-015 | Add custom symbols |  | user-docs/guide/custom-symbols.md | non commencé | — |
| P-016 | Use custom symbols |  | user-docs/guide/custom-symbols.md | non commencé | — |
| P-017 | Where to find symbol icons |  | user-docs/guide/custom-symbols.md | non commencé | — |
| P-018 | Troubleshooting |  | user-docs/guide/custom-symbols.md | non commencé | — |
| P-019 | Map mode |  | user-docs/guide/editing-modes.md | non commencé | — |
| P-020 | Grid mode (limited functions) |  | user-docs/guide/editing-modes.md | non commencé | — |
| P-021 | Chart mode (limited functions) |  | user-docs/guide/editing-modes.md | non commencé | — |
| P-022 | Start the export |  | user-docs/guide/export-data.md | non commencé | — |
| P-023 | ORBAT Mapper |  | user-docs/guide/export-data.md | non commencé | — |
| P-024 | Snapshot groups |  | user-docs/guide/export-data.md | non commencé | — |
| P-025 | Reuse an export preset |  | user-docs/guide/export-data.md | non commencé | — |
| P-026 | Preview recipient data |  | user-docs/guide/export-data.md | non commencé | — |
| P-027 | GeoJSON |  | user-docs/guide/export-data.md | non commencé | — |
| P-028 | KML |  | user-docs/guide/export-data.md | non commencé | — |
| P-029 | XLSX |  | user-docs/guide/export-data.md | non commencé | — |
| P-030 | Export options |  | user-docs/guide/export-data.md | non commencé | — |
| P-031 | Unit attributes |  | user-docs/guide/export-data.md | non commencé | — |
| P-032 | Location format |  | user-docs/guide/export-data.md | non commencé | — |
| P-033 | MilX |  | user-docs/guide/export-data.md | non commencé | — |
| P-034 | Spatial Illusions ORBAT Builder |  | user-docs/guide/export-data.md | non commencé | — |
| P-035 | Create a new scenario |  | user-docs/guide/getting-started.md | non commencé | — |
| P-036 | Start the import |  | user-docs/guide/import-data.md | non commencé | — |
| P-037 | ORBAT Mapper scenarios |  | user-docs/guide/import-data.md | non commencé | — |
| P-038 | Layers in the file |  | user-docs/guide/import-data.md | non commencé | — |
| P-039 | GeoJSON |  | user-docs/guide/import-data.md | non commencé | — |
| P-040 | MilX |  | user-docs/guide/import-data.md | non commencé | — |
| P-041 | Spatial Illusions ORBAT Builder |  | user-docs/guide/import-data.md | non commencé | — |
| P-042 | Order of Battle Generator |  | user-docs/guide/import-data.md | non commencé | — |
| P-043 | Decisive Action Training Environment (DATE) force structures |  | user-docs/guide/import-data.md | non commencé | — |
| P-044 | Tabular data (Excel/CSV) |  | user-docs/guide/import-data.md | non commencé | — |
| P-045 | Column mapping |  | user-docs/guide/import-data.md | non commencé | — |
| P-046 | Make a hierarchy |  | user-docs/guide/import-data.md | non commencé | — |
| P-047 | Navigation bar |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-048 | Main menu |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-049 | Sidebar |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-050 | ORBAT tab |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-051 | Layers tab |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-052 | Select tab |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-053 | Graphics tab |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-054 | Settings tab |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-055 | Map |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-056 | Operate on units |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-057 | Map controls |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-058 | Map context menu |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-059 | Orbit mode |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-060 | Range rings |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-061 | Map toolbar |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-062 | Measurements |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-063 | Unit tracks |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-064 | Draw toolbar |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-065 | Reference grid |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-066 | Details panel |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-067 | Unit details |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-068 | Control measure details |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-069 | Feature details |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-070 | Recording |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-071 | Recording modes |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-072 | Use the Rec button |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-073 | Timeline |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-074 | Move in time |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-075 | Playback |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-076 | Unit changes |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-077 | Context menu |  | user-docs/guide/map-edit-mode.md | non commencé | — |
| P-078 | Base layers |  | user-docs/guide/map-layers.md | non commencé | — |
| P-079 | Map layers |  | user-docs/guide/map-layers.md | non commencé | — |
| P-080 | XYZ tiles |  | user-docs/guide/map-layers.md | non commencé | — |
| P-081 | TileJSON |  | user-docs/guide/map-layers.md | non commencé | — |
| P-082 | Images |  | user-docs/guide/map-layers.md | non commencé | — |
| P-083 | KML/KMZ |  | user-docs/guide/map-layers.md | non commencé | — |
| P-084 | Symbol identification codes |  | user-docs/guide/military-symbology.md | non commencé | — |
| P-085 | Legacy symbol codes |  | user-docs/guide/military-symbology.md | non commencé | — |
| P-086 | Differences between MILSTD 2525D and APP-6D |  | user-docs/guide/military-symbology.md | non commencé | — |
| P-087 | Custom unit symbols |  | user-docs/guide/military-symbology.md | non commencé | — |
| P-088 | Level 1: Self-hosted |  | user-docs/guide/offline-use.md | non commencé | — |
| P-089 | Host your own basemap |  | user-docs/guide/offline-use.md | non commencé | — |
| P-090 | Configure the basemap layers |  | user-docs/guide/offline-use.md | non commencé | — |
| P-091 | Use a tile server on a different machine |  | user-docs/guide/offline-use.md | non commencé | — |
| P-092 | Add a map server without the configuration file |  | user-docs/guide/offline-use.md | non commencé | — |
| P-093 | Level 2: Local map file |  | user-docs/guide/offline-use.md | non commencé | — |
| P-094 | Get a PMTiles archive |  | user-docs/guide/offline-use.md | non commencé | — |
| P-095 | Open a basemap archive |  | user-docs/guide/offline-use.md | non commencé | — |
| P-096 | Select a flavour |  | user-docs/guide/offline-use.md | non commencé | — |
| P-097 | Limits of a local map file |  | user-docs/guide/offline-use.md | non commencé | — |
| P-098 | Add an archive to the configuration |  | user-docs/guide/offline-use.md | non commencé | — |
| P-099 | Remove a basemap archive |  | user-docs/guide/offline-use.md | non commencé | — |
| P-100 | Terrain and hillshading without an internet connection |  | user-docs/guide/offline-use.md | non commencé | — |
| P-101 | Get an elevation archive |  | user-docs/guide/offline-use.md | non commencé | — |
| P-102 | Open an elevation archive |  | user-docs/guide/offline-use.md | non commencé | — |
| P-103 | Elevation data on a server |  | user-docs/guide/offline-use.md | non commencé | — |
| P-104 | Elevation data in the configuration |  | user-docs/guide/offline-use.md | non commencé | — |
| P-105 | Level 3: Standalone file |  | user-docs/guide/offline-use.md | non commencé | — |
| P-106 | What operates |  | user-docs/guide/offline-use.md | non commencé | — |
| P-107 | Limitations |  | user-docs/guide/offline-use.md | non commencé | — |
| P-108 | Mapbundle (planned) |  | user-docs/guide/offline-use.md | non commencé | — |
| P-109 | Share a scenario online |  | user-docs/guide/sharing-scenarios.md | non commencé | — |
| P-110 | How to share |  | user-docs/guide/sharing-scenarios.md | non commencé | — |
| P-111 | Encrypt scenarios |  | user-docs/guide/sharing-scenarios.md | non commencé | — |
| P-112 | Important data |  | user-docs/guide/sharing-scenarios.md | non commencé | — |
| P-113 | Share a scenario as a URL |  | user-docs/guide/sharing-scenarios.md | non commencé | — |
| P-114 | How to share |  | user-docs/guide/sharing-scenarios.md | non commencé | — |
| P-115 | URL length limits |  | user-docs/guide/sharing-scenarios.md | non commencé | — |
| P-116 | Import a shared scenario |  | user-docs/guide/sharing-scenarios.md | non commencé | — |
| P-117 | Import actions |  | user-docs/guide/sharing-scenarios.md | non commencé | — |
| P-118 | External scenarios |  | user-docs/guide/storage.md | non commencé | — |
| P-119 | Sides and groups |  | user-docs/guide/terminology.md | non commencé | — |
| P-120 | Units |  | user-docs/guide/terminology.md | non commencé | — |
| P-121 | Unit state |  | user-docs/guide/terminology.md | non commencé | — |
| P-122 | Table of Organization and Equipment (TO&E) |  | user-docs/guide/terminology.md | non commencé | — |
| P-123 | Map layers and features |  | user-docs/guide/terminology.md | non commencé | — |
| P-124 | Basic syntax |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-125 | Automatic detection |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-126 | Custom pattern mappings |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-127 | Alias syntax |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-128 | Raw regex patterns |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-129 | Metadata syntax |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-130 | Pipe syntax |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-131 | Double-slash syntax |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-132 | Bracket syntax |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-133 | Settings |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-134 | Split fields |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-135 | Editor functions |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-136 | Autocomplete |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-137 | Pattern and icon browsers |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-138 | Debug info |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-139 | Output options |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-140 | Copy to clipboard |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-141 | Drag and drop |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-142 | Open in editor |  | user-docs/guide/text-to-orbat.md | non commencé | — |
| P-143 | Export |  | user-docs/guide/text-to-orbat.md | non commencé | — |

| P-144 | Notifications (toasts) | components/AppNotifications.vue, NotificationItem.vue | code | vérifié | `notifications.spec.ts` ; e2e : « Scenario saved in browser » après sauvegarde |
| P-145 | Menu principal : Home, thème, Fichier (télécharger, sauvegarder, nouveau, dupliquer, infos), Édition (undo, redo, revenir à l’état ouvert / sauvegardé, copier) | modules/scenarioeditor/MainMenu.vue, ScenarioEditor.vue#onScenarioAction | code | partiel | CDK Menu ; e2e : ouverture des menus, Home avec invite de sortie ; entrées absentes : chiffrement, chargement, partage, export, import, image, coller, View, Tools, Help (G-010) |
| P-146 | Panneau d’infos du scénario (onglet Info) | ScenarioInfoPanel.vue, ScenarioInfoDetails.vue | code | partiel | test composant (affichage, édition, undo) ; e2e : affiché à l’ouverture ; heure de début non modifiable, autres onglets absents (G-009) |
| P-147 | Heure du scénario sur la carte, jour ±1, événement précédent/suivant | components/MapTimeController.vue, useScenarioMapModeController.ts | code | partiel | e2e : affichage, jour suivant, jour précédent (normalisé à midi comme en Vue) ; modale de date et réglages du format absents (G-011) |
| P-148 | Liste des événements du scénario, aller à un événement | modules/scenarioeditor/ScenarioEventsPanel.vue | code | partiel | e2e (Falklands, 8 événements) : liste, clic → horloge et détails ; menu d’actions par événement, ajout absents (G-012) |
| P-149 | Détails d’un événement (lecture), suivi de « événement suivant » | modules/scenarioeditor/ScenarioEventDetails.vue | code | partiel | e2e : titre, heure, suivi de l’événement suivant ; édition, lieu, médias éditables absents (G-012) |
