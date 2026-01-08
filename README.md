# DataShare - Plateforme de Transfert de Fichiers Sécurisée

DataShare est une solution permettant le transfert de fichiers volumineux de manière sécurisée, éphémère et performante. Ce projet a été conçu avec une architecture micro-services stricte.

## 🚀 Fonctionnalités

### MVP (Fonctionnalités Clés)

- **Upload Sécurisé** : Transfert de fichiers (jusqu'à 1 Go) avec validation stricte (MIME/Extension).
- **Téléchargement via Lien** : Génération de liens de partage uniques (UUID).
- **Authentification** : Inscription et Connexion (JWT Stateless).
- **Historique** : Tableau de bord pour gérer ses envois.
- **Suppression** : Retrait manuel des fichiers.

### Fonctionnalités Avancées (Bonus Implémentés 🌟)

- **Upload Anonyme** : Transfert sans création de compte (US07).
- **Protection par Mot de Passe** : Chiffrement des fichiers sensibles (US09).
- **Gestion des Tags** : Organisation et filtrage des fichiers (US08).
- **Expiration Automatique** : Nettoyage automatique des fichiers après 7 jours via Cron Jobs (US10).

## 🛠 Stack Technique

- **Infrastructure** : Docker Compose, Traefik (Reverse Proxy).
- **Backend** : NestJS (TypeScript), TypeORM, PostgreSQL, Redis.
- **Frontend** : Next.js 14 (App Router), Tailwind CSS, Redux Toolkit Query.
- **Qualité** : Jest (Unit), Cypress (E2E), ESLint, Prettier.

## 📚 Documentation

L'ensemble de la documentation technique et qualité est disponible dans ce dépôt :

- **Documentation Technique** : Architecture, Choix technologiques, Modèle de données.
- **Plan de Tests (TESTING.md)** : Stratégie de tests, couverture (94%), scénarios Cypress.
- **Sécurité (SECURITY.md)** : Audit de vulnérabilités, mesures de protection.
- **Performance (PERF.md)** : Tests de charge (k6) et budget performance frontend.
- **Maintenance (MAINTENANCE.md)** : Procédures de mise à jour et backups.

## ⚡ Installation & Démarrage

### Prérequis

- Docker & Docker Compose (v2.20+)
- Ports 80, 443 et 3000 libres.
- Node.js v20+ (optionnel, pour exécution locale hors conteneur)

### Lancement Rapide (Linux/Mac)

#### 1. Cloner le projet

```sh
git clone <url-du-repo>
cd datashare
```

#### 2. Configuration Environnement

```sh
cp .env.example .env
# Les valeurs par défaut fonctionnent pour le développement local
```

#### 3. Démarrage de l'Infrastructure (Traefik)

Si vous avez déjà un Traefik qui tourne sur le réseau `traefik-webgateway`, passez cette étape.

Sinon, lancez la gateway :

```sh
docker compose -f docker-compose.traefik.yml up -d
```

Vérifiez que le réseau est bien créé avec `docker network ls`.

#### 4. Démarrer la Stack

```sh
docker compose -f docker-compose.yml up -d --build
```

#### 5. Accéder à l'application

```sh
Frontend : http://datashare.localhost
API : http://api.datashare.localhost
Traefik Dashboard : http://localhost:8080
```

## 🧪 Lancer les Tests

### Tests Unitaires (Backend)

```sh
docker compose exec backend npm run test
docker compose exec backend npm run test:cov
```

### Tests E2E (Frontend)

```sh
cd frontend
npm install
npx cypress open
```

## 🤖 Développement assisté par IA

Ce projet a été réalisé en binômage avec une IA agissant comme Architecte DevOps, garantissant des standards de code élevé.
