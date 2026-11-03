# Authentification par session cookie, SSO OIDC ensuite, RBAC à portée

L'API authentifie la SPA par **session cookie** (`HttpOnly`, `Secure`, `SameSite`, jeton CSRF) avec **comptes locaux** (Argon2id ou bcrypt) en phase 1, puis **OIDC** (`oauth2Login`) vers l'IdP de l'école en phase 5 ; l'autorisation combine un rôle global (`ADMIN`, `USER`), des appartenances par organisation, promotion ou équipe (`INSTRUCTOR`, `STUDENT`, `OBSERVER`, `ORG_ADMIN`) et une ACL par scénario (`OWNER`, `EDITOR`, `VIEWER`), appliquées **uniquement côté serveur**. Statut : proposé.

**Options.** JWT dans le navigateur : sans état mais exposé au XSS et difficile à révoquer, alors que le front rend du Markdown partagé entre utilisateurs ; Keycloak dès la phase 1 : puissant (MFA, courtage SAML) mais composant supplémentaire à exploiter avant de connaître l'IdP de l'école ; il devient la bonne option si l'école n'a pas d'IdP. **Conséquences :** une matrice de tests rôle × endpoint est obligatoire.
