#!/usr/bin/env node

/**
 * entrypoint.js
 * =============
 * Custom entrypoint pour Next.js en output: "standalone"
 *
 * Problem solved:
 * In standalone mode, Next.js "freezes" (hardcodes) the images.remotePatterns configuration at build time.
 * Environment variables defined at runtime (docker-compose) are ignored by server.js
 * and by image optimization workers (which read a private internal environment variable).
 *
 * Solution:
 * 1. We read the environment variables when the container starts.
 * 2. A physical next.config.js file is generated for reference.
 * 3. On "Monkey Patch", the server.js file before running it to:
 * - Update the configuration object in memory.
 * - Update the variable process.env.__NEXT_PRIVATE_STANDALONE_CONFIG.
 *
 * This script is Idempotent: it checks if the patch is already applied.
 */

const fs = require('fs');
const path = require('path');

console.log("🚀 [Entrypoint] Démarrage du patch runtime pour Next.js standalone");

// Critical paths in the .next/standalone folder
const STANDALONE_DIR = __dirname; // The folder where server.js is located
const SERVER_JS_PATH = path.join(STANDALONE_DIR, 'server.js');
const NEXT_CONFIG_JS_PATH = path.join(STANDALONE_DIR, 'next.config.js');

// ============================================================================
// 1. Extraction and preparation of domains from the environment variable
// ============================================================================
const envDomains = process.env.ALLOWED_IMAGE_DOMAINS;

let remotePatterns = [];
let legacyDomains = []; // For compatibility with the old `domains`

if (!envDomains || envDomains.trim() === '') {
  console.warn("⚠️ [Entrypoint] ALLOWED_IMAGE_DOMAINS empty or missing → external images disabled");
} else {
  console.log(`🔧 [Entrypoint] ALLOWED_IMAGE_DOMAINS = "${envDomains}"`);

  envDomains
    .split(',')
    .map(d => d.trim())
    .filter(Boolean)
    .forEach(domain => {
      // Aggressive cleaning: only the pure hostname is kept
      let hostname = domain
        .replace(/^https?:\/\//, '') // remove protocol
        .split('/')[0]               // remove path
        .split(':')[0];              // remove port

      if (hostname && !legacyDomains.includes(hostname)) {
        legacyDomains.push(hostname);

        // HTTP and HTTPS are allowed (Next.js checks the protocol in the actual URL).
        remotePatterns.push({ protocol: 'https', hostname });
        remotePatterns.push({ protocol: 'http',  hostname });
      }
    });

  console.log(`✅ [Entrypoint] ${legacyDomains.length} domain(s) processed:`, legacyDomains);
  console.log(`   remotePatterns generated: ${remotePatterns.length} entries`);
}

// ============================================================================
// 2. Generating a temporary next.config.js file (for easy requirements)
// ============================================================================
const tempConfigContent = `
module.exports = {
  images: {
    remotePatterns: ${JSON.stringify(remotePatterns, null, 2)},
    domains: ${JSON.stringify(legacyDomains)}
  }
};
`;

try {
  fs.writeFileSync(NEXT_CONFIG_JS_PATH, tempConfigContent);
  console.log(`✅ [Entrypoint] next.config.js temporary generated successfully`);
} catch (err) {
  console.error("❌ [Entrypoint] Error writing next.config.js:", err);
  process.exit(1);
}

// ============================================================================
// 3. Monkey patch de server.js (injection juste avant startServer)
// ============================================================================
if (!fs.existsSync(SERVER_JS_PATH)) {
  console.error(`❌ [Entrypoint] server.js not found at ${SERVER_JS_PATH}`);
  process.exit(1);
}

let serverContent;
try {
  serverContent = fs.readFileSync(SERVER_JS_PATH, 'utf8');
} catch (err) {
  console.error("❌ [Entrypoint] Unable to read server.js:", err);
  process.exit(1);
}

// Single marker to avoid multiple patches
const INJECTION_MARKER = '// === RUNTIME CONFIG INJECTION BY ENTRYPOINT ===';

if (serverContent.includes(INJECTION_MARKER)) {
  console.log("ℹ️ [Entrypoint] server.js already patched → we skip the patch");
} else {
  const injectionCode = `
${INJECTION_MARKER}
  console.log("💉 [Runtime Patch] Injecting dynamic image configuration...");

  try {
    const runtimeConfig = require('./next.config.js');

    // Updating the nextConfig object in memory
    // Note: nextConfig is defined in the parent scope of server.js
    if (typeof nextConfig === 'object' && nextConfig !== null) {
      if (!nextConfig.images) nextConfig.images = {};
      
      // Pattern override
      nextConfig.images.remotePatterns = runtimeConfig.images.remotePatterns || [];
      nextConfig.images.domains = runtimeConfig.images.domains || [];

      // CRITICAL NOTE: This is the variable that image-optimizer workers read.
      process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig);

      console.log("✅ [Runtime Patch] Configuration images successfully injected");
      console.log("   Active domains:", runtimeConfig.images.domains);
    } else {
      console.warn("⚠️ [Runtime Patch] nextConfig not found or invalid in server.js");
    }
  } catch (e) {
    console.error("❌ [Runtime Patch] Error during injection:", e);
  }
${INJECTION_MARKER.replace('===', '=== END')}
`;

  // Precise insertion point: just before the final call startServer({
  // This string is stable in recent versions of Next.js
  const insertionPoint = 'startServer({';
  const insertIndex = serverContent.indexOf(insertionPoint);

  if (insertIndex === -1) {
    console.error("❌ [Entrypoint] Could not find 'startServer({' in server.js");
    console.error("   WARNING: The internal structure of Next.js may have changed.");
    process.exit(1);
  }

  const newServerContent =
    serverContent.slice(0, insertIndex) +
    injectionCode +
    serverContent.slice(insertIndex);

  try {
    fs.writeFileSync(SERVER_JS_PATH, newServerContent);
    console.log("✅ [Entrypoint] server.js successfully patched");
  } catch (err) {
    console.error("❌ [Entrypoint] Error writing patched server.js:", err);
    process.exit(1);
  }
}

// ============================================================================
// 4. Server launch
// ============================================================================
console.log("🚀 [Entrypoint] Launching the Next.js application...\n");

require('./server.js');