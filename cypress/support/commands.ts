// cypress/support/commands.ts

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to set user role
       * @example cy.setRole('admin')
       */
      setRole(role: 'admin' | 'technician' | 'requester'): Chainable<void>
    }
  }
}

Cypress.Commands.add('setRole', (role: 'admin' | 'technician' | 'requester') => {
  cy.window().then((win) => {
    win.localStorage.setItem('auth:role', role);
  });
});

export {};