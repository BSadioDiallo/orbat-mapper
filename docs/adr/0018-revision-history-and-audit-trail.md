# Historique par révisions immuables et journal d'audit append-only

Chaque sauvegarde explicite, soumission, import ou restauration crée une ligne immuable dans `scenario_revision` ; les autosaves sont coalescés (une par fenêtre) ; la restauration copie une ancienne révision en une nouvelle ; une politique de rétention élague les autosaves. Un journal `audit_event` en ajout seul enregistre connexions, lectures de scénarios sensibles, exports, partages, changements de droits, soumissions et corrections. Statut : proposé.

**Options.** Journal de patches RFC 6902 : plus compact mais inutilisable en l'état (ADR-0015) et plus fragile à restaurer ; snapshots : retenus. Hypothèse de volume à mesurer : 5 Mo × 50 révisions × 500 scénarios ≈ 125 Go bruts, de l'ordre de 25 Go après compression TOAST. Un chaînage de hachages du journal est une option pour la preuve d'intégrité.
