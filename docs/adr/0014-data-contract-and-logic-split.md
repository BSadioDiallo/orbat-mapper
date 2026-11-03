# Contrat de données : OpenAPI pour l'enveloppe, JSON Schema généré depuis TypeScript pour le document

Le contrat de l'API (comptes, droits, métadonnées, révisions, erreurs) a pour source de vérité l'**OpenAPI** produit par Spring et **commité**, dont le front génère ses types ; le **document `Scenario`** reste opaque côté Java et validé contre un **JSON Schema généré depuis `src/types/scenarioModels.ts`**, commité et versionné avec `SCENARIO_FILE_VERSION`, tolérant aux champs inconnus sauf pour ce qui touche la sécurité (URL, `data:`, tailles). Le CI échoue si l'un des deux fichiers diffère de sa régénération. Statut : proposé.

**Options écartées.** DTO Java écrits à la main pour le document (dérive garantie) ; schéma écrit à la main ; génération du TypeScript depuis Java pour le document (l'autorité du format est le TypeScript de l'amont).

**Partage de logique.** Le serveur Java valide, extrait les résumés et projette/filtre ; le client garde la projection temporelle de la hiérarchie, les migrations (`upgrade.ts`), les exports et le rendu. Exécuter le TypeScript côté serveur (sidecar Node) est écarté : composant et surface d'attaque en plus, risque de divergence.
