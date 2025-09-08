/// <reference types="cypress" />

describe('Debug Login Process', () => {
  it('should successfully login with admin credentials', () => {
    // Limpa o localStorage
    cy.window().then((win: any) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });

    // Visita a página inicial
    cy.visit('/');
    
    // Aguarda a página carregar e verifica se está na tela de login
    cy.get('body', { timeout: 10000 }).should('contain', 'TRAKNOR');
    
    // Verifica se existe campos de login
    cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible');
    cy.get('input[type="password"]', { timeout: 10000 }).should('be.visible');
    
    // Faz o login
    cy.get('input[type="email"]').type('admin@traknor.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button').contains('Acessar').click();
    
    // Aguarda redirecionamento ou mudança de estado
    cy.wait(3000);
    
    // Verifica se foi redirecionado (URL não deve mais conter login)
    cy.url().then((url) => {
      cy.log('Current URL:', url);
    });
    
    // Verifica se tem token no localStorage
    cy.window().then((win: any) => {
      const keys = Object.keys(win.localStorage);
      cy.log('LocalStorage keys:', keys);
      
      keys.forEach(key => {
        const value = win.localStorage.getItem(key);
        cy.log(`${key}:`, value ? value.substring(0, 50) + '...' : 'null');
      });
    });
    
    // Tenta navegar para uma página interna
    cy.visit('/ativos');
    cy.wait(2000);
    
    // Verifica o conteúdo atual da página
    cy.get('body').then(($body) => {
      const text = $body.text();
      cy.log('Page content:', text.substring(0, 200));
    });
  });
});
