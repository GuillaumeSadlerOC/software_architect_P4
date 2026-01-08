# Garantie de Sécurité - DataShare

Ce document détaille les mesures de sécurité actives, les résultats d'audit et les décisions architecturales prises pour protéger l'application.

## 1. Audit de Vulnérabilités (SCA)

Nous utilisons `npm audit` pour l'analyse statique des dépendances.

### Résultats du scan

- **Date du dernier scan** : 02/01/2026
- **Outil** : NPM Audit
- **Résultat** :
  - **Production** : 0 vulnérabilité critique.
  - **Développement** : Quelques vulnérabilités mineures détectées dans les sous-dépendances de Cypress (outils de test isolés, sans impact sur le build de production).

### Procédure de remédiation

En cas de détection de vulnérabilité critique :

1. Analyse de l'impact réel.
2. Mise à jour via `npm update <package>`.
3. Si aucun correctif n'existe : `npm audit fix --force` (avec prudence) ou remplacement de la librairie.

## 2. Analyse des Décisions Architecturales

Nous avons appliqué le principe de **"Défense en Profondeur"**.

### A. Protection des Données

- **Mots de passe Utilisateurs** : Hachage fort avec **Bcrypt** (Salt rounds = 10). Aucune donnée claire.
- **Mots de passe Fichiers** : Même traitement. Le mot de passe d'un fichier n'est jamais stocké en clair (US09).
- **Uploads** :
  - Renommage systématique des fichiers (UUID v4) pour éviter les attaques par écrasement.
  - Stockage hors de la racine publique du serveur Web.
  - Validation stricte des types MIME et extensions (Rejet des `.exe`, `.sh`, `.php`...).

### B. Validation des Entrées (Input Validation)

- **Backend** : Utilisation de `class-validator` avec `whitelist: true`. Tout champ non déclaré dans le DTO est supprimé avant d'atteindre le contrôleur.
- **Frontend** : Validation stricte avec **Zod** avant l'envoi réseau.

### C. Gestion des Accès

- **JWT (Stateless)** : Le token est signé et vérifié à chaque requête.
- **CORS Strict** : L'API n'accepte que les requêtes venant du domaine Frontend (`NEXT_PUBLIC_APP_URL`).
- **Isolation Docker** : La base de données communique uniquement via le réseau privé Docker `internal-app-network`.

### D. Infrastructure

- **Reverse Proxy** : Traefik masque l'architecture interne.
- **Rate Limiting** : (Recommandé pour la prod) Configuration possible via Traefik pour éviter les DDoS.

## 3. Matrice des Risques

| Risque                         | Mesure d'atténuation                                                                       | Statut           |
|--------------------------------|--------------------------------------------------------------------------------------------|------------------|
| **Injection SQL**              | Utilisation exclusive de l'ORM TypeORM et des paramètres bindés (QueryBuilder).            | ✅ Traité        |
| **XSS (Cross-Site Scripting)** | React échappe automatiquement les variables. Pas de `dangerouslySetInnerHTML`.             | ✅ Traité        |
| **Upload Malveillant**         | Filtrage extensions + Stockage isolé + UUID.                                               | ✅ Traité        |
| **Vol de Session**             | JWT stocké en LocalStorage (Risque XSS moyen). *Amélioration possible : Cookie HttpOnly.*  | ⚠️ Accepté (MVP) |
