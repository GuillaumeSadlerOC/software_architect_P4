# Maintenance - DataShare

Ce document décrit les procédures pour maintenir l'application en conditions opérationnelles et sécurisées.

## 1. Gestion des Dépendances

### Fréquence de mise à jour

- **Audit de sécurité (`npm audit`)** : Hebdomadaire (peut être automatisé via CI/CD).
- **Mise à jour mineure** : Mensuelle.
- **Mise à jour majeure** : Trimestrielle (nécessite une validation complète et une non-régression).

### Procédure de mise à jour

1. Identifier les paquets obsolètes :

```sh
npm outdated
```

2. Mettre à jour les paquets (en respectant le `package-lock.json`) :

```sh
npm update
```

3. **Impératif** : Lancer la suite de tests complète (`npm run test` + Cypress) après toute mise à jour pour détecter les régressions.

### Risques identifiés

- **Conflits de versions** : Un risque spécifique a été identifié entre `Cypress` et `Next.js` concernant la résolution TypeScript. Ce conflit est actuellement résolu via une configuration `tsconfig.json` spécifique dans le dossier `cypress/`.
- **Rupture API (Breaking Changes)** : Risque modéré lors des mises à jour majeures de NestJS (framework) ou TypeORM (ORM).

## 2. Maintenance de la Base de Données

### Sauvegardes (Backup)

La persistance est assurée par le volume Docker `postgresql_data`.

- **Procédure de dump manuel** (à automatiser via un cron job sur l'hôte) :

```sh
docker exec -t datashare-postgresql pg_dumpall -c -U admin > backup_$(date +%F).sql
```

### Nettoyage Automatique

- Le module `TasksService` contient un **Cron Job** (`@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`).
- **Action** : Il supprime physiquement les fichiers expirés du disque (`/uploads`) et nettoie les entrées correspondantes en base de données pour libérer de l'espace de stockage.
