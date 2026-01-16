import http from 'k6/http';
import { check, sleep } from 'k6';

// ==============================================================================
// TEST SETUP
// ==============================================================================
export const options = {
  // Loading scenario
  stages: [
    { duration: '5s', target: 10 },  // Rapid heating
    { duration: '30s', target: 50 }, // Sustained load (50 SUVs)
    { duration: '5s', target: 0 },   // Return to calm
  ],
  // Success criteria (SLO)
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests are completed in under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failure rate
  },
};

// Network configuration for Docker/Localhost via Traefik
const BASE_URL = 'http://127.0.0.1/api'; // We're hitting the local Traefik
const PARAMS = {
  headers: {
    'Host': 'api.datashare.localhost', // We force the Host for Traefik routing
    'Content-Type': 'application/json',
  },
};

// ==============================================================================
// 1. SETUP
// ==============================================================================
export function setup() {
  console.log('🔄 Initialisation : Création utilisateur et upload fichier...');

  const userCreds = {
    email: `k6-${Date.now()}@test.com`,
    password: 'Password123!',
  };

  // A. INSCRIPTION
  const regRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify(userCreds), PARAMS);
  // We accept 201 (Created) or 400 (Already existing)
  check(regRes, { 'Register success': (r) => r.status === 201 || r.status === 400 });

  // B. LOGIN
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: userCreds.email,
    password: userCreds.password
  }), PARAMS);
  
  const authToken = loginRes.json('token'); 

  if (!authToken) {
    throw new Error(`❌ Login failed (Token introuvable): ${loginRes.body}`);
  }
  console.log('✅ Login OK');

  // C. UPLOAD FILE
  const uploadParams = {
    headers: {
      'Host': 'api.datashare.localhost',
      'Authorization': `Bearer ${authToken}`,
    },
  };

  const filePayload = {
    file: http.file('This is a k6 test file.', 'k6-loadtest.txt'),
    expirationDays: '1',
  };

  const uploadRes = http.post(`${BASE_URL}/files/upload`, filePayload, uploadParams);
  const fileData = uploadRes.json();
  const fileToken = fileData ? (fileData.token || fileData.id) : null;

  if (uploadRes.status !== 201 || !fileToken) {
    throw new Error(`❌ Upload failed: Status ${uploadRes.status} - Body: ${uploadRes.body}`);
  }
  
  console.log(`✅ Upload OK - File Token: ${fileToken}`);

  return { fileToken: fileToken }; 
}

// ==============================================================================
// 2. DEFAULT
// ==============================================================================
export default function (data) {
  // We retrieve the token generated in the setup
  const token = data.fileToken;

  // We type the Metadata route (Read-only, very busy)
  const res = http.get(`${BASE_URL}/files/${token}/metadata`, PARAMS);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'content check': (r) => r.body && r.body.includes('k6-loadtest.txt'),
  });

  sleep(1);
}