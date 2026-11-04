# Rapport du matin (mis à jour en continu)

**Dernière mise à jour** : 2026-11-04, début de session.

## En bref
Socle Angular 22 créé dans `apps/web` ; il charge une démo via le scenario store partagé, inchangé.

## Décisions qui méritent votre attention
- La mission était dans `MIGRATION.md`, pas `MISSION.md` (D-001).
- L'app Vue reste à la racine comme référence ; Angular consomme le code partagé par alias, sans le modifier (D-003, D-005).
- Le domaine partagé tourne sur `@vue/reactivity` (moteur de réactivité seul) : critère « zéro dépendance Vue » non atteint pour ce paquet (D-004, G-001).
- `xlsx` ne peut pas être installé ici (hôte bloqué) : XLSX non vérifiable dans la session (D-010, G-002).
