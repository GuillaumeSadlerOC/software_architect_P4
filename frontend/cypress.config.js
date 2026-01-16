const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://datashare.localhost',
    
    // Pattern for finding tests
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    
    pluginsFile: false,
    
    viewportWidth: 1280,
    viewportHeight: 720,
    chromeWebSecurity: false,

    setupNodeEvents(on, config) {},
  },
});