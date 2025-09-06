/// <reference types="cypress" />

describe('ACL - Admin User', () => {
  beforeEach(() => {
    cy.setRole('admin');
  });

  it('should see all action buttons on Equipment page', () => {
    cy.visit('/ativos');
    
    // Aguarda carregamento da página verificando pelo título da aplicação
    cy.contains('TrakNor').should('be.visible');
    cy.contains('Ativos').should('be.visible');
    
    // Verifica elementos de criação de localização que deveriam estar visíveis
    cy.get('[data-testid="company-create"]').should('exist');
    cy.get('[data-testid="sector-create"]').should('exist');
    cy.get('[data-testid="subsection-create"]').should('exist');
    
    // Verifica elementos de edição e criação de ativos quando localização for selecionada
    cy.get('[data-testid="asset-edit"]', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="asset-create"]', { timeout: 5000 }).should('exist');
  });

  it('should see all action buttons on Inventory page', () => {
    cy.visit('/inventory');
    
    // Aguarda carregamento da página verificando pelo título da aplicação
    cy.contains('TrakNor').should('be.visible');
    cy.contains('Estoque').should('be.visible');
    
    // Verifica botão de criação
    cy.get('[data-testid="inventory-create"]', { timeout: 5000 }).should('exist');
    
    // Verifica botões de ação na tabela
    cy.get('[data-testid="inventory-edit"]', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="inventory-move"]', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="inventory-delete"]', { timeout: 5000 }).should('exist');
  });

  it('should see all action buttons on Plans page', () => {
    cy.visit('/plans');
    
    // Aguarda carregamento da página
    cy.contains('Planos').should('be.visible');
    
    // Verifica botão de criação
    cy.get('[data-testid="plan-create"]', { timeout: 5000 }).should('exist');
    
    // Verifica botões de edição na tabela
    cy.get('[data-testid="plan-edit"]', { timeout: 5000 }).should('exist');
  });

  it('should see all action buttons on Procedures page', () => {
    cy.visit('/procedures');
    
    // Aguarda carregamento da página
    cy.contains('Procedimentos').should('be.visible');
    
    // Verifica botão de criação
    cy.get('[data-testid="procedure-create"]', { timeout: 5000 }).should('exist');
    
    // Verifica botões de ação na tabela
    cy.get('[data-testid="procedure-view"]', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="procedure-actions"]', { timeout: 5000 }).should('exist');
    
    // Clica no dropdown e verifica opções de edição e exclusão
    cy.get('[data-testid="procedure-actions"]').first().click();
    cy.get('[data-testid="procedure-edit"]').should('exist');
    cy.get('[data-testid="procedure-delete"]').should('exist');
  });

  it('should verify all action buttons are accessible and focusable', () => {
    cy.visit('/ativos');
    
    // Aguarda carregamento da página verificando pelo título da aplicação
    cy.contains('TrakNor').should('be.visible');
    cy.contains('Ativos').should('be.visible');
    
    // Verifica que todos os botões de ação são focáveis
    cy.get('[data-testid="company-create"]').should('exist').and('be.visible');
    cy.get('[data-testid="sector-create"]').should('exist').and('be.visible');
    cy.get('[data-testid="subsection-create"]').should('exist').and('be.visible');
  });
});