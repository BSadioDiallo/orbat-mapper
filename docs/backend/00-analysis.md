# 00 — Analyse de l'existant (ORBAT Mapper → produit client/serveur)

> Statut : **proposition, en attente de validation**. Aucun code applicatif n'a été modifié.
> Convention de lecture : **[F]** fait constaté dans le dépôt (avec `fichier:ligne`), **[H]** hypothèse, **[R]** recommandation.
> Dépôt analysé : fork `BSadioDiallo/orbat-mapper`, branche `main`, version `package.json` 1.24.0, version du format de scénario `3.7.0` (`src/config/constants.ts:12`).

## 0. Limites de cette analyse

- **[F]** Le clone disponible est *shallow* (`git rev-parse --is-shallow-repository` → `true`, 50 commits visibles). Le chiffre « ~2 900 commits » de l'amont n'a donc pas pu être vérifié localement ; il est repris de votre énoncé.
- **[F]** Les 5 derniers commits datent tous du 2026-11-03 (même auteur « KM »), ce qui confirme un rythme amont très soutenu (`git log`).
- **[F]** Les sites `postgresql.org` et `endoflife.date` ne sont pas joignables depuis cette session (hôtes hors liste réseau autorisée). Les versions PostgreSQL sont donc **partiellement vérifiées** (voir `01-architecture.md` §0).
- Aucune exécution de l'application, des tests ou du build n'a été faite : l'analyse est une lecture statique.

---

## 1. Cartographie du front

### 1.1 Chiffres clés
- **[F]** ~235 000 lignes `.ts`/`.vue` dans `src/` (1 244 fichiers), dont **279 fichiers de tests** co-localisés (`*.test.ts`, `*.spec.ts`).
- **[F]** Vue 3.5, vue-router 5, Pinia 4, Vite 8, Tailwind v4, MapLibre GL 6 (`package.json`). Pas de `tailwind.config.ts` (config dans `src/styles.css`, cf. `CLAUDE.md`).
- **[F]** `pnpm-workspace.yaml` ne contient que des `overrides` : ce n'est **pas** un vrai monorepo multi-paquets aujourd'hui (un seul paquet racine).

### 1.2 Point d'entrée
- **[F]** `src/main.ts` : `createApp(App).use(router).use(createPinia()).mount("#app")`. `index.html` charge `/src/main.ts`, favicon à la racine.

### 1.3 Routes (`src/router/index.ts`)
| Chemin | Nom | Composant | Remarque |
|---|---|---|---|
| `/` | `LANDING_PAGE_ROUTE` | `LandingPage.vue` | liste des scénarios stockés + démos |
| `/scenario/:scenarioId` | `MAP_EDIT_MODE_ROUTE` | `ScenarioEditorWrapper` → `ScenarioEditorMaplibre` | **seule porte d'entrée de l'éditeur** ; enfants `grid-edit`, `chart-edit` |
| `/newscenario` | `NEW_SCENARIO_ROUTE` | `NewScenarioView` | écrit dans IndexedDB (`NewScenarioView.vue:126`) |
| `/import` | `IMPORT_SCENARIO_ROUTE` | `ImportScenarioView` | `?data=` (URL zlib+base64) ou `?id=` (appel `/share?id=`) |
| `/text-to-orbat` | `TEXT_TO_ORBAT_ROUTE` | `TextToOrbatView` | crée des scénarios dans IndexedDB |
| `/symbol-browser` | `SYMBOL_BROWSER_ROUTE` | `SymbolBrowserView` | sans données utilisateur |
| `/maplibre`, `/legacy`, `/globe/:id` | — | redirections | héritage OpenLayers (ADR-0005) |

- **[F]** L'historique de navigation passe par `createAppHistory()` (`src/router/history.ts`) ; le build singlefile le remplace par un `createWebHashHistory` (`vite.singlefile.config.ts`, table `STANDALONE_MODULES`).
- **[F]** `public/_redirects` : `/* /index.html 200` (fallback SPA Cloudflare Pages).
- **[F]** Aucune garde de navigation d'authentification (inexistante) ; seule `beforeEnter` démarre NProgress.

### 1.4 Organisation de `src/`
`components/` (UI partagée, ~import/export modals), `modules/` (`scenarioeditor`, `maplibreview`, `charteditor`, `grid`), `views/` (pages), `scenariostore/` (modèle + I/O + manipulations), `stores/` (Pinia), `composables/`, `importexport/` (formats), `geo/` (basemaps, terrain, KML), `symbology/`, `lib/` (`textToOrbat` autonome, ADR-0010 ; `grid`, `terrain`, `hellfire`), `types/`, `utils/`, `config/`, `extlib/`.

### 1.5 Stores Pinia (`src/stores/`, 28 stores hors tests)
**[F]** UI/session, pas de données de scénario : `selectedStore`, `uiStore`, `mapViewStore`, `playbackStore`, `recordingStore`, `tabStore`, `toolbar`, `terrainStore`, `viewshedStore`, `maplibreLayersStore`, `settingsStore`, etc. De nombreux stores persistent des préférences dans `localStorage` via `useLocalStorage` (cf. §5). `scenarioStore.ts` ne contient que des helpers de parcours (`walkSide` importé par `newScenarioStore.ts:15`), pas l'état.

### 1.6 Scenario store (`src/scenariostore/newScenarioStore.ts`, 585 l.)
- **[F]** `useNewScenarioStore(data)` (l.572) = `prepareScenario(data)` (l.128, conversion externe→interne) + `useImmerStore<ScenarioState, ActionLabel>` (l.575).
- **[F]** `ScenarioState` (l.~70-112) : Maps normalisées (`unitMap`, `sideMap`, `sideGroupMap`, `eventMap`, `layerStackMap`, `layerItemMap`, `equipmentMap`, `personnelMap`, `supplyCategoryMap`, `unitStatusMap`, `supplyClassMap`, `supplyUomMap`, `rangeRingGroupMap`, `symbolFillColorMap`, `customSymbolMap`…) **mélangées à des champs d'état dérivé/UI** : `currentTime`, `hierarchyChangeTimestamps`, `hierarchyProjectionVersion`, `isMapStylesDirty`, `unitStateCounter`, `settingsStateCounter`…
- **[F]** `useScenario()` (`src/scenariostore/index.ts`) expose un **singleton global** (`globalStoreRef`, `globalScenarioIO`) avec le commentaire « Todo: add store ref as parameter in case we want to load multiple scenarios » : un seul scénario ouvert à la fois par onglet.

### 1.7 Composables et `immerStore.ts`
Voir §4. Autres composables notables : `browserScenarios.ts` (liste/CRUD IndexedDB), `scenarioShare.ts` (URL zlib), `importScenarioTransfer.ts` (sessionStorage), `useScenarioFileLoader.ts`, `customBasemaps.ts`, `basemapArchives.ts`, `geosearching.ts`.

### 1.8 `functions/` — Cloudflare Pages Function
- **[F]** Un seul fichier, `functions/share.ts` : `onRequest` Cloudflare (`R2Bucket` `ORBAT_SCENARIO_BUCKET`, `KVNamespace` `LIMITER_KV`, secret `UPLOAD_SECRET`).
  - `GET /share?id=…` : renvoie l'objet R2 (JSON), `Cache-Control: public, max-age=604800`, **sans authentification** (l'ID est un `crypto.randomUUID()`, donc « secret par obscurité »).
  - `POST /share` : origine autorisée (`orbat-mapper.app` / `*.orbat-mapper.pages.dev`), en-tête `X-ORBAT-SECRET` comparé à `UPLOAD_SECRET`, 20 uploads/h/IP, 10 Mo max.
  - **[F]** Le secret est lu côté client via `import.meta.env.VITE_ORBAT_SECRET` (`ShareScenarioModal.vue:49-50`) → **il est embarqué dans le bundle JS** : ce n'est pas un secret.
  - **[R]** Cette fonction n'a pas de valeur à conserver ; elle est remplacée par le partage serveur.

### 1.9 `scripts/`
Outils de génération de symbologie : `generate-milstd2525e.mjs`, `diff-milstd*.mjs`, et `inlineMaplibreWorker.ts` (build singlefile). Aucun lien avec la persistance.

### 1.10 Config Vite / build
- **[F]** `vite.config.ts` : plugins `vue`, `vueDevTools`, `tailwindcss` ; alias `@` → `src`. **Aucun proxy dev, aucune variable d'API** : le front n'a pas de notion de « base URL d'API ».
- **[F]** Build *singlefile* (`vite.singlefile.config.ts`) : fichier HTML unique exécutable en `file://`. Mécanisme remarquable : une table `STANDALONE_MODULES` **remplace des modules entiers** (`runtimeEnvironment.ts`, `history.ts`, `DemoScenarioCards.vue`…) via un plugin Rollup `resolveId/load` — et un test (`vite.singlefile.config.test.ts`) vérifie que les modules cités existent. **C'est un patron directement réutilisable** pour notre adaptateur API (voir §10).
- **[F]** `src/utils/runtimeEnvironment.ts` : 4 constantes (`isGeoSearchAvailable`, `canPersistFileHandles`, `canReadHostedConfig`, `isOnlineElevationAvailable`), toutes `true` en build hébergé.
- **[F]** CI : `.github/workflows/pr-checks.yml` ne se déclenche que sur PR vers la branche `deploy` (type-check, build, tests ; **pas de lint**). `release.yml` produit un ZIP `dist/` et le HTML standalone. Pas de couverture configurée (aucune occurrence de `coverage` dans `package.json`/`vitest.config.ts`).

---

## 2. Flux de persistance actuel

### 2.1 IndexedDB (`src/scenariostore/localdb.ts`, 276 l.)
- **[F]** Base `scenario-db`, **version 5** (l.54). Object stores : `scenario-blobs` (clé = id, valeur = `Scenario` complet), `scenario-metadata` (`id,name,description,created,modified,image`, index `by-modified`/`by-created`), `scenario-drafts` (brouillons, index `by-updated-at`), `basemap-archive-handles` (FileSystemFileHandle des archives PMTiles — jamais les octets, ADR-0004).
- **[F]** API : `addScenario`, `putScenario`, `loadScenario`, `listScenarios`, `deleteScenario(s)`, `duplicateScenario`, `downloadAsJson`, `getScenarioInfo`, `put/get/deleteScenarioDraft`, `put/get/delete/listArchiveHandle(s)`.
- **[F]** Le singleton `db` est initialisé paresseusement (`useIndexedDb`, l.48).

### 2.2 Sauvegarde : explicite + brouillon automatique
- **[F]** Il n'y a **pas d'autosave du scénario lui-même**. Deux niveaux (`src/scenariostore/io.ts`) :
  1. **Brouillon** : à chaque mutation (`onMutation` → `queueDirtyStateSync`), un brouillon est écrit dans `scenario-drafts` après un *debounce* de `DRAFT_SAVE_DEBOUNCE_MS = 2000` (l.281, `persistDraftNow` l.496).
  2. **Sauvegarde** : `saveToIndexedDb()` (l.594) — déclenchée par l'utilisateur ou par le prompt de sortie (`ScenarioEditorWrapper.vue`, `confirmNavigationAway`) — fait `putScenario`, remet à zéro les baselines et supprime le brouillon.
- **[F]** Suivi de « sale » basé sur des **révisions** (`loadedRevision`, `savedRevision`, `lastDraftRevision`) et des clés de comparaison JSON normalisées (`getScenarioComparisonKey`).
- **[F]** Les scénarios `demo-*` sont réidentifiés avec un `nanoid` à la première sauvegarde (l.600-604).
- **[F]** Reprise sur brouillon : `getNewerDraft` (l.724) compare brouillon/sauvegarde → `ScenarioDraftRecoveryModal`.
- **[R]** Cette mécanique brouillon + révision est **très proche de ce qu'il faut côté API** (brouillon local = tampon hors-ligne ; sauvegarde = `PUT` avec révision). Elle est à conserver, pas à jeter.

### 2.3 Ouverture / chargement
`ScenarioEditorWrapper.vue` (watch `scenarioId`, l.~35) : si id `demo-*` → `io.loadDemoScenario` (fetch JSON statique, `io.ts:764`, URLs `/scenarios/*.json`) ; sinon `useIndexedDb().loadScenario(id)` (l.77) → `io.loadFromObject` → `applyScenarioObject` (`io.ts:553`, vérifie `compareVersions(data.version, SCENARIO_FILE_VERSION, ">")` et les timestamps invalides, construit un nouveau store).

### 2.4 Import / export
| Fonction | Fichiers | Remarque |
|---|---|---|
| Export JSON | `io.ts:783 downloadAsJson`, `localdb.ts downloadAsJson`, `ExportScenarioModal.vue` | `saveBlobToLocalFile` (`browser-fs-access`) |
| Import JSON (fichier, URL, glisser-déposer, presse-papier) | `useScenarioFileLoader.ts`, `LoadScenarioDialog.vue`, `LoadScenarioFromUrlPanel.vue`, `LoadScenarioUrlForm.vue` (`fetch(url)`), `ImportLoadStep.vue:249` | |
| Formats d'export | `src/types/importExport.ts` : `orbatmapper`, `geojson`, `kml`, `kmz`, `msdl`, `xlsx`, `csv`, `milx`, `unitgenerator` | code dans `src/importexport/export/` |
| Formats d'import | `milx`, `geojson`, `gpx`, KML/KMZ (fflate : `fileHandling.ts`), XLSX/CSV (`xlsx` de cdn.sheetjs.com, `d3-dsv`), ODIN/DATEWORLD, ORBAT generator, MSDL… | `src/importexport/` |
| ZIP | `fflate` : KMZ (`fileHandling.ts`, `kmlExport.ts`), GeoTIFF/export image, partage URL | pas de format « archive ORBAT » |
| Chiffrement | `src/utils/crypto.ts` : AES-GCM, PBKDF2 600 000 itérations, `type: "ORBAT-mapper-encrypted"` | chiffrement **côté client** par mot de passe |
| Export partiel | `recipientScenario.ts` + GLOSSARY « Recipient export / Snapshot group » | **filtrage d'information par destinataire déjà implémenté côté client** (voir §3.2, ADR-0013) |

### 2.5 Partage
- **[F]** *Share as URL* : `scenarioShare.ts:15-30` — JSON → `zlibSync` niveau 9 → base64 → `/import?data=…` (avertissement > 2048 car.).
- **[F]** *Share online* : `ShareScenarioModal.vue:29-72` → `POST /share` (Cloudflare) → lien `/import?id=…` ; historique des 10 derniers liens dans `localStorage` (`orbat-share-history`, `constants.ts:14`).
- **[F]** Chargement d'un lien : `ImportScenarioView.vue:133` `fetch('/share?id=…')`, déchiffrement éventuel, puis `addScenario/putScenario` dans IndexedDB (l.229-248), avec détection de conflit d'ID.
- **[F]** Transit interne : `importScenarioTransfer.ts` (sessionStorage, 5 min, lecture unique).
- **[F]** Reliquat : `saveToLocalStorage/loadFromLocalStorage` (`io.ts:589`, clé `orbat-scenario4`).

### 2.6 Liste exhaustive des points à remplacer ou adapter pour l'API
| # | Fichier:ligne | Rôle actuel | Action |
|---|---|---|---|
| 1 | `scenariostore/localdb.ts` (tout) | CRUD scénarios + drafts + handles | **Seam** `ScenarioRepository` ; implémentation API ; drafts/handles gardés en local |
| 2 | `scenariostore/io.ts:594 saveToIndexedDb` | sauvegarde | → `saveScenario()` API (`PUT` + révision) |
| 3 | `io.ts:496-550` (brouillons) | `put/getScenarioDraft` | garder IndexedDB (cache local), ajouter l'id de révision serveur |
| 4 | `io.ts:600-640 duplicateScenario` | copie | → endpoint `POST /scenarios/{id}/duplicate` |
| 5 | `io.ts:764 loadDemoScenario` | démos statiques | inchangé ou remplacé par « scénarios modèles » |
| 6 | `io.ts:677 loadFromUrl` | fetch d'URL arbitraire | à restreindre (SSRF côté navigateur, CSP `connect-src`) |
| 7 | `io.ts:589/621 *LocalStorage` | reliquat | supprimer/ignorer |
| 8 | `ScenarioEditorWrapper.vue:77` | `loadScenario` IDB | → `repository.load(id)` + gestion 401/403/404/409 |
| 9 | `ScenarioEditorWrapper.vue` (leave prompt, brouillon) | cycle de vie | adapter états « enregistré / en cours / hors-ligne / conflit » |
| 10 | `NewScenarioView.vue:126` | création | → `POST /scenarios` |
| 11 | `texttoorbat/TextToOrbatView.vue:318`, `ScratchPad.vue:139` | création | → `POST /scenarios` |
| 12 | `ImportScenarioView.vue:133,169,229,238,248` | import/partage | → import serveur / lien de partage serveur |
| 13 | `composables/browserScenarios.ts` (213 l.) | liste, suppression, duplication | → `GET/DELETE /scenarios` |
| 14 | `components/StoredScenarioBrowser.vue`, `ScenarioLinkCard.vue`, `DeleteStoredScenariosModal.vue`, `ImportLoadStepBrowser.vue`, `views/LandingPageScenarios.vue:67` | UI liste | types `ScenarioMetadata` (localdb) → DTO API |
| 15 | `components/ShareScenarioModal.vue:29-72`, `functions/share.ts` | partage Cloudflare | supprimer/remplacer |
| 16 | `composables/scenarioShare.ts` | URL zlib | à désactiver (contournerait les droits) |
| 17 | `composables/importScenarioTransfer.ts` | sessionStorage | conserver (transit local) |
| 18 | `geo/basemapArchiveHandles.ts` (l.196-247) | handles PMTiles en IDB | **reste local** (par poste) |
| 19 | `router/index.ts` | pas de garde auth | `beforeEach` + route login/callback |
| 20 | `vite.config.ts` | pas de proxy | proxy dev `/api` |
| 21 | `utils/runtimeEnvironment.ts` | flags | ajouter flags (ex. `isServerBacked`) |
| 22 | `public/config/maplibreConfig.json`, `stores/maplibreLayersStore.ts:78` | fonds de carte tiers | config servie par l'API/interne (§6) |
| 23 | `vite.singlefile.config.ts` | build standalone | à déclarer non supporté ou à isoler |

**[F]** Au total, seuls **11 fichiers** appellent `useIndexedDb()` (`grep`), ce qui est un périmètre maîtrisable.

---

## 3. Modèle de données

### 3.1 Format externe (`src/types/scenarioModels.ts`, 473 l.)
`Scenario` (l.406-423) : `type: "ORBAT-mapper"`, `id`, `version`, `meta?` (`createdDate`, `lastModifiedDate`, `exportedFrom?`, `exportedDate?`), `name`, `description`, `startTime`, `timeZone`, `symbologyStandard` (`2525d | 2525e | app6d`), `sides[]`, `events[]`, `layerStack[]`, `layers?` / `mapLayers?` (hérités), `equipment[]`, `personnel[]`, `supplyCategories[]`, `unitTemplates[]`, `settings` (`rangeRingGroups`, `rangeRingVisibility`, `statuses`, `supplyClasses`, `supplyUoMs`, `map`, `boundingBox`, `symbolFillColors`, `customSymbols`).

Structure :
- **Side** → `groups[]` (**SideGroup**, avec `snapshotTime?`) → `subUnits[]` récursifs (**Unit**) ; une side peut aussi avoir des `subUnits` directs.
- **Unit** : `id`, `name`, `sidc` (code MIL-STD-2525/APP-6), `shortName`, `description` (Markdown), `externalUrl`, `location`, `state[]`, `symbolOptions`, `textAmplifiers`, `reinforcedStatus`, `rangeRings`, `equipment/personnel/supplies` (par **nom**), `media[]` (`url`, captions), `status` (par nom), `properties` (vitesses), `locked`, `isHidden`, `style`.
- **State** (l.27-53) : état temporel `t`, `location`, `sidc`, `via[]` (chemin), `interpolate`, `status`, `update`/`diff` (ressources), `hierarchy` (**mouvement hiérarchique daté**, `TimedHierarchyMove`), + `ScenarioEventDescription` partielle.
- **ScenarioEvent** : `startTime`, `title`, `description`, `media`, `where` (`units | geometry | items`, ADR-0011), `uiActions`.
- **layerStack** : couches `overlay` (items : `geometry`, `annotation`, `measurement`, `tacticalGraphic`/control measures, point symbols), `reference`, `rangeRings`, couches carte (`ImageLayer`, `TileJSON`, `XYZ`, `KML` — `scenarioGeoModels.ts:108-134`). Items à bornes de visibilité (`visibleFromT/UntilT`) et `state[]` propres.
- **Supplies/ToE** : `equipment`, `personnel`, `supplyCategories`, `supplyClasses`, `supplyUoMs`, `unitStatuses` référencés **par nom** dans le format externe.
- **Symbologie** : `sidc` + `milsymbol` (`MilitarySymbol.vue`), génération de tables `milstandard-e` (`scripts/generate-milstd2525e.mjs`).
- **Chiffrement** : `EncryptedScenario` (l.434) enveloppe `ciphertext` + paramètres + `header` en clair.

### 3.2 Format interne (`src/types/internalModels.ts`, 261 l.)
- **[F]** Types `NUnit`, `NSide`, `NSideGroup`, `NState`… : sous-arbres remplacés par **listes d'IDs**, ressources par IDs, plus des **champs dérivés** listés dans `INTERNAL_NAMES` (l.230-246 : `_state`, `_pid`, `_isOpen`, `_gid`, `_sid`, `_basePid`, `_baseSubUnits`…) et `TIMESTAMP_NAMES = ["t","visibleFromT","visibleUntilT","startTime"]` (l.248).
- **[F]** Conversion externe→interne : `prepareScenario()` (`newScenarioStore.ts:128-570`) ; `convertStateToInternalFormat()` (l.113) convertit `t` en epoch ms via `dayjs`. Interne→externe : `scenarioStoreToObject` (`io.ts:317`) + `createStringifyReplacer` (`io.ts:350`) qui retire `INTERNAL_NAMES` et reconvertit les timestamps en ISO.
- **[F] Point critique pour une API** : `prepareScenario` **régénère des `nanoid` à chaque chargement** pour equipment, personnel, supply categories/classes/UoM, statuts, groupes d'anneaux de portée et couleurs (`addEquipment`, `addPersonnel`, etc., l.~268-330). Seuls unités, sides, groupes, événements, couches/items conservent leurs IDs. **Les IDs internes ne sont donc pas stables d'une session à l'autre** : ils ne peuvent pas servir de clés d'API ni de cibles de patches durables.
- **[F]** La conversion normalise aussi des chemins hérités (`upgradeScenarioIfNecessary` appelé dans `prepareScenario`, l.~158).

### 3.3 Version du schéma et migrations
- **[F]** `SCENARIO_FILE_VERSION = "3.7.0"` (`constants.ts:12`) ; l'union `ScenarioVersion` (`scenarioModels.ts:286-…`) liste toutes les versions publiées (3.7.0, 3.6.0, … 3.0.0, …).
- **[F]** `compare-versions` n'est utilisé que dans `io.ts:48` (refus/avertissement si `data.version > SCENARIO_FILE_VERSION`, l.~553) et `upgrade.ts:2`.
- **[F]** `upgradeScenarioIfNecessary` (`upgrade.ts:~565-601`, 601 l.) enchaîne des migrations conditionnelles : `< 0.30.0` (propriétés de features), `< 3.2.0` (base partagée des items de géométrie), `< 3.3.0` (noms de symbologie), `< 3.5.0` (flèches classiques inversées, **non idempotent**, d'où un « stamp » de version). Elle est appelée **à chaque chargement** (aussi depuis `browserScenarios.loadScenario` et `prepareScenario`, donc potentiellement deux fois).
- **[F]** Aucune migration n'écrit en retour dans IndexedDB : l'amélioration est faite en mémoire à chaque ouverture ; le fichier stocké garde sa version d'origine jusqu'à la prochaine sauvegarde.
- **[F]** Note de l'amont (ADR-0009) : « the scenario format is frozen for now » (à l'époque de cet ADR) — mais la version a avancé jusqu'à 3.7.0, donc le format **évolue encore**.
- **[R]** Conséquence : le serveur ne doit **pas** réimplémenter ces migrations ; il doit stocker la `version` du document, valider *pour cette version*, et laisser le client migrer à l'ouverture (ADR-0012, ADR-0014).

### 3.4 Volumétrie
- **[F]** Scénarios de démo (`public/scenarios/`, JSON compact mesuré par script) :
  | Fichier | Version | Unités | `state[]` | Événements | Taille fichier |
  |---|---|---|---|---|---|
  | `narvik40.json` | 3.3.0 | 39 | 24 | 0 | 27 Ko |
  | `falkland82.json` | 3.6.0 | 139 | 185 | 8 | 196 Ko (indenté) |
  | `northern-storm-85.json` | 3.6.0 | 144 | 684 | 23 | 388 Ko (indenté) |
  Soit 14–157 Ko en JSON compact.
- **[F]** Les médias d'unités/événements sont des **URL** (`Media.url`), pas des blobs ; les démos référencent `public/scenarios/images/` (≈300 Ko d'images, hors JSON). Les `CustomSymbol.src` sont des URI d'image, le formulaire suggère un `data:image/png;base64,…` (`AddCustomSymbolForm.vue:91`) → **les images peuvent être embarquées en base64 dans le scénario**.
- **[H]** Scénario « école » réaliste : 500–5 000 unités, 5 000–50 000 états, couches GeoJSON importées → **0,5 à 10 Mo** de JSON, avec risque de dépassement si des images base64 ou des GeoJSON de milliers de points sont embarqués. Limite de corps actuelle côté Cloudflare : 10 Mo (`functions/share.ts`). À mesurer sur des scénarios réels fournis par l'école.
- **[F]** Aucun mécanisme de pagination/streaming ; le document est toujours chargé et parsé en entier.

---

## 4. Undo/redo et patches

- **[F]** `src/composables/immerStore.ts` (166 l., d'après `Korijn/vue-store`) : `produceWithPatches(toRaw(state), updater)` (l.~71) renvoie `patches` et `inversePatches` Immer ; ils sont appliqués au `reactive` via `rfc6902.applyPatch` (`applyPatchWrapper`, l.12) et empilés dans `past[]` (`UndoEntry` : `patches`, `inversePatches`, `meta`, `beforeRevision`, `afterRevision`). `future[]` pour le redo. `groupUpdate` fusionne plusieurs étapes en une entrée (l.86). `setAutoFreeze(false)`.
- **[F]** Hooks : `onUndoRedo`, `onMutation` (utilisés par la timeline, les panneaux ToE, le rendu des tactical graphics).
- **[F]** Les patches Immer ne sont **pas** des patches RFC 6902 bruts : ils sont convertis par `applyPatchWrapper` (chemins `a/b/c` → `/a/b/c`, remplacement de `replace` par `add` pour les clés objet, `toRfc6902Op` l.~21).
- **Peut-on les exposer pour une synchro incrémentale ? [R : pas en l'état.]** Quatre obstacles constatés :
  1. Les patches portent sur le **`ScenarioState` interne**, qui contient des champs dérivés/UI (`_state`, `currentTime`, `hierarchyProjectionVersion`…) → bruit et patches dépendant du temps courant.
  2. Les **IDs de ressources sont régénérés à chaque chargement** (§3.2) : un patch émis par un client ne s'applique pas à un document externe stocké ni à un autre client.
  3. Les patches ne contiennent que le *delta d'état interne* ; le serveur devrait réimplémenter `scenarioStoreToObject` pour les appliquer au document externe.
  4. La pile d'undo n'est **pas** persistée et les `revision` sont locales (`nextRevision`).
- **Ce qui est réutilisable** : `ActionLabel` (`newScenarioStore.ts`) et `meta` fournissent des *noms d'actions* utiles à un journal d'audit ; `revision` est une bonne base de « dirty tracking ».
- **[R]** Stratégie : snapshot du document externe (`serializeToObject()`) avec révision serveur en phase 1 ; patches/opérations seulement si la mesure l'exige (ADR-0015).

---

## 5. Autres données locales (hors scénarios)

- **[F]** `localStorage` via `useLocalStorage`/`useStorage` : ~25 fichiers (`grep`) — préférences d'affichage (taille d'icône ORBAT, noms courts, mode de localisation, colonnes de tableaux, modes ToE, statut `showHistory`, format de coordonnées, formats d'heure, terrain/hillshade, onglets de la timeline, réglages d'import/export, catalogue de control measures, grille de référence — ADR-0007, taille par échelon — ADR-0009, etc.).
- **[F]** Autres clés : `orbat-scenario4` (reliquat), `orbat-share-history`, `onlineElevationChosen`, `elevationArchive` mémorisé (`terrainStore.ts:84-112`), fonds de carte personnalisés (`customBasemaps.ts`, `geo/customBasemap.ts`).
- **[F]** `sessionStorage` : transfert d'import (`importScenarioTransfer.ts`).
- **[F]** IndexedDB : *handles* d'archives PMTiles (ADR-0004). Les **octets** des cartes restent sur le disque de l'utilisateur ; seul le `FileSystemFileHandle` est mémorisé.
- **[R]** Préférences : **rester en `localStorage`** en phase 1 (par poste). Option ultérieure : profil serveur pour quelques préférences (langue, format de coordonnées). Les ADR amont 0007/0009 (« device-wide display preference, not scenario data ») vont dans ce sens et n'exigent aucun changement.

---

## 6. Dépendances réseau sortantes (front + `functions/`)

| Service | Preuve | Données émises | Impact en milieu sensible |
|---|---|---|---|
| Fonds de carte OpenFreeMap, VersaTiles, OSM, OSM-DE, ArcGIS, OpenTopoMap, Kartverket | `public/config/maplibreConfig.json` (12 entrées), `stores/maplibreLayersStore.ts:32-50,78` | IP + **zone consultée** (z/x/y) | Fuite de la zone d'intérêt de l'exercice ; indisponible en réseau fermé |
| Glyphes MapLibre | `maplibreview/maplibreBasemaps.ts:28` (`demotiles.maplibre.org`) | IP | idem ; polices de carte |
| Géocodage Photon | `composables/geosearching.ts:27` (`photon.komoot.io/api/?q=`) | **texte de la recherche** | Fuite du contenu recherché ; masqué si `isGeoSearchAvailable=false` |
| Altitude Mapterhorn | `maplibreview/mapTerrain.ts:15` (`tiles.mapterhorn.com`) | IP + zone | idem ; flag `isOnlineElevationAvailable` |
| Menu contextuel carte | `MaplibreContextMenu.vue:300-320` (Bing, Google, OSM, GeoHack) | **coordonnées**, mais **seulement au clic** (liens `href`) | acceptable ; à masquer en mode sensible |
| `fetch(url)` utilisateur | `LoadScenarioUrlForm.vue:32`, `LoadScenarioFromUrlPanel.vue:29`, `ImportLoadStep.vue:249`, `io.ts:677`, `kml/parseKml.ts:44`, `geo/protomapsSprite.ts:58` | URL arbitraire | Exfiltration/SSRF navigateur ; contrôlable par `connect-src` CSP |
| Partage `/share` | `functions/share.ts` | scénario complet | À supprimer (Cloudflare R2/KV) |
| Images/médias des unités | `Media.url` (URL libres) | requêtes vers des domaines externes à l'affichage | pixels espions ; CSP `img-src` |
| Polices | `@fontsource-variable/inter` (**embarqué** dans le bundle) | — | OK, pas de CDN de polices |
| Analytics | **[F]** aucune occurrence repérée dans `index.html`/`src/main.ts` | — | OK |
| Docs externes | `helpUrl` → `docs.orbat-mapper.app` (`router/index.ts`) | clic seulement | à rediriger vers doc interne |

- **[F]** Bonne nouvelle : le front sait déjà fonctionner **sans** Internet : fonds personnalisés (`AddMapServerDialog.vue` : `style.json`, XYZ, PMTiles), archives PMTiles (`basemapArchives.ts`), archives d'altitude (`elevationArchive.ts`), flags `runtimeEnvironment.ts`, doc `user-docs/guide/offline-use.md` (« Offline level »).
- **[R]** Déploiement sensible : **serveur de tuiles interne** (PMTiles/Protomaps ou équivalent), glyphes/sprites hébergés, `maplibreConfig.json` fourni par l'organisation, géocodage interne ou désactivé, CSP stricte `connect-src 'self' <tuiles internes>`.

---

## 7. Rendu de contenu utilisateur et XSS

- **[F]** Markdown : `src/composables/formatting.ts:6` `new MarkdownIt()` — **options par défaut, donc `html: false`** (le HTML brut est échappé) ; plugin `markdown-it-container` (`scroll-step`) ; les liens reçoivent `target="_blank"` (l.24) **sans `rel="noopener noreferrer"`** (constaté : aucun `rel` dans le fichier). markdown-it bloque par défaut les schémas `javascript:`/`vbscript:`/`data:` dans les liens (comportement documenté de `validateLink`, **[H]** à confirmer par test sur la version installée).
- **[F]** Sorties injectées par `v-html` : `UnitDetails.vue:751`, `PointSymbolDetails.vue:386`, `ScenarioInfoDetails.vue:139`, `ScenarioFeatureDetails.vue:485`, `ScenarioEventDetails.vue:211`, `ControlMeasureDetails.vue:523`, `ImportOrbatMapperStep.vue:450` (tous issus de `renderMarkdown`) ; `ReferenceFeatureDetails.vue:44` (HTML de propriétés de features, **passé par un assainisseur maison** `sanitizeReferenceFeatureHtml`, `referenceFeatureUtils.ts:176`, liste blanche d'attributs, href/src restreints) ; surbrillances de recherche (`SearchUnitHit.vue`, `CommandPalette*Item.vue`, `SymbolPickerModal.vue:373`) — **échappées via `htmlTagEscape` avant `fuzzysort.highlight`** (`searching.ts:46-58,77-79`).
- **[F]** `MilitarySymbol.vue:36` insère `symb.value.asSVG()` (milsymbol) via `innerHTML` ; les textes d'amplification (noms) passent par la bibliothèque. **[H]** à vérifier que milsymbol échappe les champs de texte (non vérifié ici).
- **[F]** Attributions de fonds de carte : `sanitizeHTML` (`utils/dom.ts:3`, échappement par `textContent`) dans `TileMapLayerSettingsForm.vue:57`.
- **[F]** Un commentaire de `mapLibreExport.ts:614` montre que l'amont connaît déjà le risque `innerHTML`/`onerror`.
- **Risque une fois les contenus partagés (stored XSS inter-utilisateurs)** : aujourd'hui l'« attaquant » ne peut s'attaquer qu'à lui-même (ou à qui ouvre son fichier). Avec un serveur, **un élève peut injecter du contenu vers un instructeur** (fort levier : session de l'instructeur). Surfaces : Markdown (descriptions, événements), HTML de propriétés de référence, noms, `Media.url`, `externalUrl`, SVG de symboles personnalisés (`CustomSymbol.src`), fonds de carte personnalisés (URL).
- **[R]** (a) CSP stricte sans `unsafe-inline` ni `unsafe-eval` ; (b) ajouter `rel="noopener noreferrer"` sur les liens Markdown ; (c) tests d'attaque (corpus XSS) sur `renderMarkdown` et `sanitizeReferenceFeatureHtml` ; (d) validation serveur des URL (`http(s)`, `data:image/*` borné) ; (e) cookie de session `HttpOnly`/`SameSite` (un XSS ne vole pas le token) ; (f) envisager DOMPurify en défense en profondeur (choix à confirmer, dépendance à ajouter plus tard).

---

## 8. Vocabulaire métier (glossaire pour l'API)

Sources lues : `GLOSSARY.md` (294 l.), `docs/adr/0001…0011`, `docs/agents/*`, `user-docs/guide/terminology.md`. Les documents `docs/agents/*` concernent le workflow des agents (tracker GitHub, labels de triage, lecture du glossaire) et **imposent d'utiliser le vocabulaire du GLOSSARY** ; les ADR amont sont en anglais, une phrase-décision par fichier.

### 8.1 Termes à conserver tels quels (anglais technique, noms d'API)
| Terme (API/DB) | Définition | Source |
|---|---|---|
| `scenario` | Document complet versionné (`version`, `id`) | `scenarioModels.ts:406` |
| `side` | Camp (nation/coalition), avec `standardIdentity` | `terminology.md`, `scenarioModels.ts:203` |
| `sideGroup` (`group`) | Regroupement d'unités dans un camp ; peut être un **snapshot group** | `scenarioModels.ts:187`, GLOSSARY |
| `unit` | Élément de base (hiérarchie arborescente), `sidc`, `echelon` implicite dans le SIDC | `terminology.md` |
| `rootUnit` | Unité au sommet d'une hiérarchie d'un side/group | `terminology.md` |
| `state` (`unitState`) | Entrée temporelle d'une unité (position, SIDC, statut, ressources, mouvement hiérarchique) | `scenarioModels.ts:27` |
| `update` vs `diff` | Mise à jour absolue vs delta de ressources (GLOSSARY « update vs diff ») | GLOSSARY |
| `timedHierarchyMove` | Changement de parent daté | `scenarioModels.ts:132` |
| `scenarioEvent` / `eventLocation` (`where`) | Évènement daté + cadrage caméra (`units`/`geometry`/`items`) | GLOSSARY, ADR-0011 |
| `layerStack`, `overlayLayer`, `referenceLayer`, `featureLayer`, `activeLayer`, `lockedLayer`, `layerSpecialization` | Pile de couches | GLOSSARY « Layers » |
| `geometryLayerItem`, `geometryKind`, `circle`, `rectangle` | Entités dessinées (le cercle est un Point + rayon) | GLOSSARY, ADR-0002 |
| `controlMeasure` (`graphicKind`), `controlMeasureLayer` | Graphique tactique doctrinal | GLOSSARY, ADR-0006 |
| `pointSymbol` | Item de symbole ponctuel (couche) | ADR-0008 |
| `equipment`, `personnel`, `supplyCategory`, `supplyClass`, `supplyUoM`, `unitStatus` | Ressources/ToE | `scenarioModels.ts:331-368` |
| `rangeRing`, `rangeRingGroup` | Anneaux de portée | `scenarioGeoModels.ts` |
| `sidc` | Symbol Identification Code | partout |
| `symbologyStandard` | `2525d`, `2525e`, `app6d` | `scenarioModels.ts:285` |
| `recipientExport`, `snapshotGroup`, `snapshotTime` | Export partiel pour un destinataire | GLOSSARY « Partial export » |
| `basemapArchive`, `pmtilesArchive`, `mapbundle`, `offlineLevel` | Cartes hors-ligne | GLOSSARY « Offline use » |
| `echelonSizing`, `referenceGrid`, `mapEngine`, `mapAdapter` | Préférences d'affichage / moteur | GLOSSARY, ADR-0007/0009 |

### 8.2 Termes **nouveaux** à introduire pour le produit (domaine pédagogique/serveur)
`organization`, `cohort` (promotion), `team` (groupe d'élèves), `membership`, `role`, `exercise`, `assignment`, `workCopy`, `submission`, `feedback`/`annotation`, `scenarioRevision`, `auditEvent`, `sensitivityLabel`. **[R]** Éviter les collisions : le mot « *group* » est déjà pris par `sideGroup` ; utiliser `team` pour les groupes d'élèves. De même **deux types nommés `ScenarioMetadata`** coexistent (`localdb.ts:7` = métadonnées de liste ; `scenarioModels.ts:399` = `meta` du document) : en API, parler de `ScenarioSummary` (liste) et de `meta` (document).

---

## 9. Qualité et dette

- **[F]** Tests : 279 fichiers `*.test.ts`/`*.spec.ts` (Vitest 4, jsdom) ; bonne couverture des couches `scenariostore/` (upgrade, io, hierarchy, unitManipulations, scenarioCodec, localdb…), `importexport/`, `stores/`. **Pas de mesure de couverture** ni de tests e2e (le `vitest.config.ts` exclut `e2e/**` qui n'existe pas).
- **[F]** Tests utiles pour nous : `io.test.ts`, `io.saveModel.test.ts`, `io.timestampOffset.test.ts`, `localdb.test.ts`, `upgrade.test.ts`, `scenarioCodec.test.ts`, `recipientScenario.test.ts`, `scenarioShare.test.ts`, `importScenarioTransfer.test.ts`.
- **[F]** Conventions `CLAUDE.md` : alias `@/`, composants PascalCase `<script setup lang="ts">`, stores `use*`, imports externes puis `@/`, **pas de ligne `Co-Authored-By` dans les commits** (à respecter ; note : le système d'attribution de la session demande d'en ajouter — conflit à trancher par vous, voir `01-architecture.md` §Q).
- **Couplages forts pour l'API-first** :
  1. Singleton global `useScenario()` (`scenariostore/index.ts`) ; `ScenarioEditorWrapper` pilote tout le cycle de vie.
  2. `io.ts` (829 l.) mélange sérialisation, comparaison, brouillons, IndexedDB, notifications, `useLocalStorage`, téléchargement de fichier, chargement de démos.
  3. Le store interne mélange données et état dérivé (§3.2) et régénère des IDs (§3.2).
  4. `window.confirm` pour les conflits d'ID (`browserScenarios.ts`).
  5. Les modules UI importent directement les types `ScenarioMetadata` de `localdb.ts` (6 fichiers).
  6. Pas de couche d'erreurs réseau/états « offline » dans l'UI (notifications existent : `composables/notifications.ts`).
- **[F]** Dette signalée dans le code : `// Todo: add store ref as parameter…` (`index.ts`), `@ts-ignore` pour `filenamify/browser`, `xlsx` installé depuis `cdn.sheetjs.com` (hors registre npm : à intégrer dans la chaîne d'approvisionnement), dépendance `audit` (`^0.0.6`) dont l'utilité n'est pas évidente (**[H]** probablement installée par erreur, à vérifier).

---

## 10. Stratégie de fork

- **[F]** L'amont change vite (cf. §0) et son architecture de variantes de build (`STANDALONE_MODULES`, `runtimeEnvironment.ts`) est précisément conçue pour **substituer des modules sans toucher à l'application**.
- **Option A — « Suivre l'amont » (merge régulier)** : toutes nos modifications du front vivent dans des **nouveaux fichiers/dossiers** + un petit nombre de points d'accroche. Fusion `upstream/main` mensuelle (ou par release). *Avantages* : bénéficie des correctifs, des nouveaux formats et du schéma 3.x ; *inconvénients* : conflits possibles sur les fichiers d'accroche, charge récurrente.
- **Option B — Divergence assumée** : copie figée, évolutions indépendantes. *Avantages* : liberté ; *inconvénients* : on perd le moteur de carte/symbologie en évolution, dette de sécurité des dépendances, coût de rattrapage croissant.
- **[R] Option A, avec « coutures minimales »** :
  1. **Backend dans `backend/`** (dossier neuf : zéro conflit).
  2. **Front : dossier `src/server/`** (neuf) contenant client API, auth, dépôt `ScenarioRepository`, états de synchronisation, pages login/admin/pédagogie, en routes ajoutées via un **fichier de routes séparé** fusionné dans `router/index.ts` (1 ligne).
  3. **Remplacement de `localdb.ts` par alias de module** à la manière de `STANDALONE_MODULES` (plugin Vite `serverBackedModules`, dans un fichier neuf `vite.server.config.ts`) : **zéro modification** des 11 appelants de `useIndexedDb()` tant que l'interface reste compatible (`ScenarioMetadata`, `loadScenario`, `putScenario`…). Les écarts de comportement (ex. `window.confirm` d'écrasement) sont traités par un petit nombre de patchs.
  4. **Fichier `DIVERGENCES.md`** listant chaque fichier amont modifié et pourquoi ; objectif : < 20 fichiers amont touchés.
  5. **Proposer à l'amont** le *seam* `ScenarioRepository` (changement neutre qui réduirait nos conflits) ; licence MIT, pas d'obligation.
  6. **Branches** : `main` = miroir amont, `product` = nos changements ; rebase/merge `main→product` à chaque release amont ; tests d'intégration front exécutés avant promotion.
  7. Figer des **tests de non-régression de contrat** (schéma JSON du scénario régénéré à chaque merge : si le diff n'est pas vide → alerte, cf. dérive de contrat).
- **[H]** Je recommande aussi de **ne pas renommer** les paquets/identifiants amont (éviter les conflits massifs).

---

## 11. Synthèse des constats clés

1. Le front est **entièrement basé sur un document JSON « Scenario »** stocké en bloc (IndexedDB) → modèle de persistance naturel côté serveur : **document versionné + métadonnées**.
2. Les **IDs internes de ressources sont régénérés à chaque chargement** et le store interne mêle données et état dérivé → **la synchro par patches Immer n'est pas viable** directement ; snapshot d'abord.
3. La logique de **brouillons + révisions + dirty tracking** existe déjà (`io.ts`) → à réutiliser comme tampon hors-ligne avec révisions serveur.
4. Le **filtrage d'information par destinataire existe déjà côté client** (`recipientScenario`, snapshot groups) mais n'est **pas une garantie de sécurité** (un élève ayant le document complet voit tout) → à rejouer côté serveur.
5. Le dépôt contient **un patron de substitution de modules** (build singlefile) qui permet de brancher l'API **avec très peu de conflits** avec l'amont.
6. Dépendances réseau sortantes à neutraliser en milieu sensible : fonds de carte tiers, géocodage Photon, altitude Mapterhorn, glyphes MapLibre, `fetch` d'URL libres, fonction de partage Cloudflare (dont le « secret » est dans le bundle).
7. Risque XSS : Markdown et HTML de propriétés rendus par `v-html` ; mitigé (html désactivé, échappements) mais **à durcir** avant tout partage inter-utilisateurs.
