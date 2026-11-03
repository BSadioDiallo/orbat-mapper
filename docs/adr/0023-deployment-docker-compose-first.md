# Déploiement : Docker Compose d'abord, Kubernetes ensuite

L'environnement de départ est un `compose.yaml` (reverse proxy TLS, API, PostgreSQL, tuiles statiques, sauvegarde planifiée) avec un fichier d'environnement et un profil Spring par environnement (`dev`, `recette`, `prod`), Actuator sur un port de gestion non exposé, logs JSON et métriques Prometheus. L'API reste sans état (sessions en base) pour passer à Kubernetes sans réécriture. Statut : proposé.

**Options.** Kubernetes dès le départ : complexité d'exploitation disproportionnée avant de connaître l'exploitant et la charge ; PaaS managé : à reconsidérer selon l'hébergeur. La prise en charge native des logs structurés en Spring Boot 4.1 est à confirmer dans la documentation avant de s'y fier.
