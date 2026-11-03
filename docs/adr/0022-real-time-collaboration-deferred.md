# Temps réel et co-édition repoussés

Les phases 1 à 3 n'ont ni WebSocket ni CRDT : la concurrence est gérée par `If-Match` (ADR-0015) et, au besoin, par un verrou d'édition à bail ; une **vue instructeur en direct, en lecture seule** (SSE ou WebSocket qui pousse les nouvelles révisions) est une phase 6 optionnelle décidée sur mesures. Statut : proposé.

**Options.** WebSocket avec patches ou CRDT (Yjs, Automerge) : bloqués par les IDs de ressources non stables et par l'état interne mêlé de champs dérivés, effort XL ; verrou simple : retenu comme palier ; absence de contrôle : écartée (perte silencieuse de travail).
