# Écarts connus

Format : élément · symptôme · contournement · piste de correction.

## G-001 — `@vue/reactivity` reste une dépendance de l'app Angular
- **Symptôme** : critère n°4 de la définition de terminé non atteint pour ce paquet.
- **Contournement** : moteur de réactivité du domaine partagé uniquement, derrière `src/shims/vue.ts` ; aucun runtime de rendu Vue, ni `vue`, `pinia`, `vue-router`, `@vueuse/*` dans `apps/web/package.json`.
- **Piste** : remplacer, module par module, les `reactive`/`computed` du domaine par un store immuable (Immer produit déjà des états à partage structurel) exposé en signals ; les tests de référence du domaine servent de filet.

## G-002 — XLSX non vérifiable dans cet environnement
- **Symptôme** : `cdn.sheetjs.com` refusé par la politique réseau ; le paquet installé localement est factice.
- **Contournement** : aucun ; la CI GitHub installe le vrai paquet.
- **Piste** : vérifier l'import/export XLSX en CI ou sur un poste connecté.
