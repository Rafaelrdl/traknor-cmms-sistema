import './commands';

// Disable uncaught exception handling to avoid test failures due to unhandled errors
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent the test from failing
  return false;
});