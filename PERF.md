# Suivi de Performance - DataShare

Ce document présente les résultats des tests de charge côté serveur et définit le budget de performance côté client.

## 1. Test de performance Backend (k6)

Nous utilisons l'outil **k6** via Docker pour simuler une charge utilisateur réaliste sur l'API.

### Scénario de test

- **Cible** : `GET /api/files/:token/metadata`
- **Justification** : C'est l'endpoint public le plus sollicité (page de téléchargement), accessible sans authentification, donc critique pour la tenue en charge.
- **Charge** : Montée progressive jusqu'à **50 utilisateurs simultanés** (VUs) sur une période de 50 secondes.

### Procédure d'exécution

1. **Prérequis** : L'application doit être lancée (`docker compose up -d`).
2. **Script** : Le script de test se trouve dans `tests/k6/load-test.js`.
3. **Commande** (depuis la racine) :

```sh
docker run --rm -i \
  -v $(pwd)/tests/k6:/scripts \
  --network host \
  grafana/k6 run /scripts/load-test.js
```

### Script utilisé (`tests/k6/load-test.js`)

```sh
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp-up
    { duration: '30s', target: 50 }, // Plateau 50 users
    { duration: '10s', target: 0 },  // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], 
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Token valide d'un fichier existant (généré lors de l'upload)
  const token = '29461d82-2f54-408c-899a-097d9e3e8c2c'; 
  
  const params = {
    headers: { 'Host': 'api.datashare.localhost' },
  };

  // Accès via IP locale pour contourner le DNS Docker
  const res = http.get(`http://127.0.0.1/api/files/${token}/metadata`, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'content present': (r) => r.body && r.body.includes('filename'),
  });

  sleep(1);
}
```

### Résultats et Interprétation (Test du 02/01/2026)

Test réalisé sur environnement de développement Linux (Docker).

| Métrique | Résultat | Objectif (SLO) | Statut |
|---------------------|--------|-----|
| **Requêtes Totales** | 1409 | - | ✅ |
| **Débit (RPS)** | ~28 req/s | - | ✅ |
| **Taux d'erreur HTTP** | 0.00% | < 1% | ✅ Validé |
| **Latence Moyenne** | 2.3 ms | - | 🚀 Excellent |
| **Latence P95** | 3.29 ms | < 500 ms | 🚀 Excellent |

**Interprétation** : L'API NestJS démontre une performance exceptionnelle sur ce scénario de lecture (I/O Bound). Avec 50 utilisateurs simultanés, le temps de réponse reste négligeable (< 4ms), prouvant l'efficacité de l'architecture asynchrone et l'optimisation de la base de données PostgreSQL.

## 2. Budget de performance Frontend

Nous surveillons ces métriques via **Lighthouse** (Chrome DevTools).

### Métriques Cibles

| Métrique                           | Objectif | Impact Utilisateur                      |
|------------------------------------|----------|-----------------------------------------|
| **LCP** (Largest Contentful Paint) | < 2.5 s  | Perception de la vitesse de chargement. |
| **CLS** (Cumulative Layout Shift)  | < 0.1    | Stabilité visuelle.                     |
| **FID** (First Input Delay)        | < 100 ms | Réactivité.                             |
| **Bundle Size** (JS Initial)       | < 200 KB | Temps de téléchargement réseau.         |

### Stratégies d'optimisation

1. **Images** : Utilisation du composant `next/image` pour le format WebP automatique.
2. **Code Splitting** : Chargement différé (Lazy Loading) des composants lourds comme `UploadSheet` et `ConfirmDialog`.
3. **Font Optimization** : Utilisation de `next/font` pour zéro layout shift.

### Procédure d'audit

1. Ouvrir l'application dans Chrome (Navigation privée).
2. Ouvrir les outils de développement (`F12`) > **Onglet Lighthouse**.
3. Sélectionner : *Mode Navigation, Device Mobile, Categories Performance*.
4. Cliquer sur **Analyze page load**.

### Logs Performance Navigateur (Indicatif Dev)

- Temps de chargement DOM : ~800ms
- Taille transférée (Page Accueil) : ~150kb (gzippé)
