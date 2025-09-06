import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000', // Usa localhost que resolve para IPv4 ou IPv6
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    env: {
      apiUrl: 'http://localhost:3333/api'
    },
    setupNodeEvents(on, config) {
      // Configurações adicionais se necessário
      return config;
    },
    retries: {
      runMode: 2,
      openMode: 0
    }
  },
});