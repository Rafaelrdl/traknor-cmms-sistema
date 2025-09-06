/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Custom command to login with specific role
       * @example cy.setRole('admin')
       */
      setRole(role: 'admin' | 'technician' | 'requester'): Chainable<void>
    }
  }
}

Cypress.Commands.add('setRole', (role: 'admin' | 'technician' | 'requester') => {
  const credentials = {
    admin: { email: 'admin@traknor.com', password: 'admin123' },
    technician: { email: 'tecnico@traknor.com', password: 'tecnico123' },
    requester: { email: 'operador@traknor.com', password: 'operador123' },
  };

  const { email, password } = credentials[role];

  // Limpa localStorage primeiro
  cy.clearLocalStorage();
  
  // Vai para a página de login
  cy.visit('/');

  // Aguarda e verifica se está na tela de login
  cy.get('body', { timeout: 10000 }).should('contain', 'TRAKNOR');
  
  // Preenche campos de login e faz login pela interface
  cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible').clear().type(email);
  cy.get('input[type="password"]', { timeout: 10000 }).should('be.visible').clear().type(password);
  cy.get('button').contains('Acessar').should('be.visible').click();

  // Aguarda um tempo fixo para o processamento
  cy.wait(8000);
});

export {};