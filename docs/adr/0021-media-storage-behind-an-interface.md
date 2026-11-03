# Médias derrière une interface `MediaStorage`, volume local d'abord

Les médias sont envoyés à l'API, stockés derrière une interface `MediaStorage` avec une implémentation **volume local** en phase 4 et une implémentation **S3-compatible** quand il y aura plusieurs instances ; l'accès est soumis aux droits du scénario, le type est vérifié par signature, la taille bornée, les images ré-encodées, l'analyse antivirus (ClamAV) optionnelle. Statut : proposé.

**Options.** S3-compatible dès le départ : utile en multi-instances mais composant de plus (la licence et la maintenance de MinIO sont à vérifier avant de le retenir) ; disque local : retenu. Constat : les médias actuels sont des URL (`Media.url`), avec la possibilité d'images base64 dans `CustomSymbol.src` ; le serveur borne ces `data:` plutôt que de les extraire en phase 1.
