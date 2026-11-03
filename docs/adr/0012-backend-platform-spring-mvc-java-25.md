# Backend sur Spring Boot 4.1, Spring MVC et Java 25

Le serveur est une application Spring Boot 4.1.x (4.1.2 lue sur spring.io) en **Spring MVC** (pile bloquante, threads virtuels activables), sur **Java 25** (LTS courante d'après la feuille de route Oracle), avec PostgreSQL 18 ; les versions de correctif sont épinglées au démarrage de la phase 0 après lecture des sources officielles. Statut : proposé.

**Options.** WebFlux : bénéfice réel seulement pour un très grand nombre de connexions longues, au prix de R2DBC ou d'un JDBC isolé et d'un débogage plus difficile ; écarté, car le trafic est du CRUD documentaire. Java 21 : encore en Premier Support jusqu'en 2028 mais plus ancien que la LTS courante ; Java 17 est le minimum de Boot 4.1.2 mais son Premier Support se termine en septembre 2026. **Conséquence :** l'image Docker utilise un JDK 25 d'une distribution à choisir (à confirmer avec l'exploitant).
