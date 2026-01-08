import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuration du test
export const options = {
  // Pallier de montée en charge (Ramp-up)
  stages: [
    { duration: '10s', target: 20 }, // Monter à 20 utilisateurs en 10s
    { duration: '30s', target: 50 }, // Rester à 50 utilisateurs pendant 30s
    { duration: '10s', target: 0 },  // Redescendre à 0 (Cool down)
  ],
  // Seuils de réussite (SLO)
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% des requêtes doivent être sous 500ms
    http_req_failed: ['rate<0.01'],   // Moins de 1% d'erreurs
  },
};

export default function () {
  // Remplacer par un token UUID valide existant dans ta BDD locale
  // Tu peux en obtenir un en uploadant un fichier via l'interface
  const token = '29461d82-2f54-408c-899a-097d9e3e8c2c'; 
  
  // ASTUCE DEVOPS :
  // Pour éviter les problèmes de résolution DNS (api.datashare.localhost) à l'intérieur du conteneur k6,
  // on tape directement sur l'IP locale (127.0.0.1) qui correspond à l'hôte (car on lance avec --network host)
  // et on force le header 'Host' pour que Traefik route correctement la requête.
  const params = {
    headers: {
      'Host': 'api.datashare.localhost',
    },
  };

  // Note: On utilise le port 80 (Traefik) via 127.0.0.1
  const res = http.get(`http://127.0.0.1/api/files/${token}/metadata`, params);

  // Vérification robuste : on s'assure que le body existe avant d'appeler includes()
  // pour éviter le crash "TypeError" si la requête échoue (status 0 ou 500 sans body)
  check(res, {
    'status is 200': (r) => r.status === 200,
    'content present': (r) => r.body && r.body.includes('filename'),
  });

  sleep(1);
}