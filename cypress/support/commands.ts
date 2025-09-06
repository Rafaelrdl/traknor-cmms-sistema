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

  cy.request({
    method: 'POST',
    url: 'http://localhost:3333/api/auth/login',
    body: { email, password },
  }).then((response: any) => {
    expect(response.status).to.eq(200);
    
    // Store token and user info  
    cy.window().then((win: any) => {
      win.localStorage.setItem('auth:token', response.body.token);
      win.localStorage.setItem('auth:user', JSON.stringify(response.body.user));
      win.localStorage.setItem('auth:role', response.body.user.role.toLowerCase());
    });
  });
});

export {};