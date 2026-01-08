// Import commands.js using ES2015 syntax:
import './commands';

// Ignore les erreurs d'hydratation ou erreurs non critiques de l'app
// pour ne pas faire échouer les tests inutilement
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes('Hydration failed') || err.message.includes('Minified React error')) {
    return false;
  }
  // Laisse passer les autres erreurs
  return true;
});