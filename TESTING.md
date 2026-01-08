# Plan de Tests - DataShare

## 1. Tests Unitaires (Backend)

Nous avons concentré les tests unitaires sur la logique métier critique du MVP, en utilisant **Jest**.

### Fonctionnalités couvertes (MVP)

- **AuthService** : Inscription, Hashage mot de passe, Génération JWT.
- **FilesService** : Upload, Vérification extension/taille, Génération Token.
- **FilesController** : Protection des routes, validation des entrées.

### Critères d'acceptation

| **Composant** | **Scénario**    | **Résultat Attendu**                                  |
|---------------|-----------------|-------------------------------------------------------|
| **Auth**      | Login valide    | Retourne un token JWT et l'objet User.                |
| **Auth**      | Login invalide  | Lève une `UnauthorizedException`.                     |
| **Upload**    | Fichier valide  | Crée l'entrée en BDD et retourne un Token UUID.       |
| **Upload**    | Fichier .exe    | Lève une `BadRequestException` (Extension interdite). |
| **Download**  | Fichier expiré  | Lève une `ForbiddenException`.                        |

### Instructions d'exécution

```sh
# Lancer les tests unitaires dans le conteneur
docker compose exec backend npm run test

# Générer le rapport de couverture
docker compose exec backend npm run test:cov
```

### Couverture de code

**Résultat actuel** : **~96% (Backend)**

*Capture du rapport de couverture* :

```sh
-----------------------|---------|----------|---------|---------|-------------------
File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------------|---------|----------|---------|---------|-------------------
All files              |   96.01 |    71.34 |   93.47 |   96.87 |                   
 auth                  |   98.46 |    75.75 |     100 |   98.24 |                   
  auth.controller.ts   |     100 |    76.92 |     100 |     100 | 14-22             
  auth.service.ts      |   96.42 |    72.72 |     100 |   96.15 | 55                
  jwt-auth.guard.ts    |     100 |      100 |     100 |     100 |                   
  jwt.strategy.ts      |     100 |    77.77 |     100 |     100 | 12                
 files                 |   93.83 |    68.86 |   90.32 |   95.52 |                   
  files.controller.ts  |     100 |    69.69 |     100 |     100 | 33-134            
  files.service.ts     |   88.15 |     62.5 |   83.33 |   91.17 | 80-86,143,175-176 
  tasks.service.ts     |     100 |     87.5 |     100 |     100 | 13                
 health                |     100 |      100 |     100 |     100 |                   
  health.controller.ts |     100 |      100 |     100 |     100 |                   
 users                 |     100 |       76 |     100 |     100 |                   
  users.controller.ts  |     100 |    68.75 |     100 |     100 | 10-18             
  users.service.ts     |     100 |    88.88 |     100 |     100 | 10                
-----------------------|---------|----------|---------|---------|-------------------

Test Suites: 9 passed, 9 total
Tests:       53 passed, 53 total
Snapshots:   0 total
Time:        2.069 s
Ran all test suites.
```

## 2. Tests End-to-End (Frontend)

Réalisés avec **Cypress**, ces tests valident les parcours utilisateurs critiques.

### Scénarios Critiques

1. **US01/US07 - Upload** : Un utilisateur (anonyme ou connecté) peut uploader un fichier et obtient un lien de partage.
2. **US02 - Download** : Un utilisateur accède au lien public et peut télécharger le fichier.
3. **US05/US06 - Gestion** : Un utilisateur connecté voit son historique et peut supprimer un fichier.

### Instructions d'exécution

```sh
# Prérequis : L'application doit tourner (docker compose up)
# Lancer l'interface de test depuis le dossier frontend
npx cypress open
```
