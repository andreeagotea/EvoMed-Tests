import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    baseUrl: 'https://qaone-iocn.dev.evozon.com',
    setupNodeEvents() {
      // implement node event listeners here
    },
    env: {
      apiUrl: 'https://qaone-iocn.dev.evozon.com',
      // defaultUsername: 'Arvilla_Hegmann',
      // defaultPassword: 's3cret'
    }
  },
})
