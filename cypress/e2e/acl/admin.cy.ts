/// <reference types="cypress" />

describe('ACL - Admin User', () => {
  beforeEach(() => {
    cy.setRole('admin');
    cy.visit('/');
  });

  it('should see all action buttons on Equipment page', () => {
    cy.visit('/ativos');
    
    // Should see location creation buttons
    cy.get('[data-testid="company-create"]').should('exist');
    cy.get('[data-testid="sector-create"]').should('exist');
    cy.get('[data-testid="subsection-create"]').should('exist');
    
    // Should see asset edit and create buttons when location is selected
    cy.get('[data-testid="asset-edit"]').should('exist');
    cy.get('[data-testid="asset-create"]').should('exist');
  });

  it('should see all action buttons on Inventory page', () => {
    cy.visit('/inventory');
    
    // Should see create button
    cy.get('[data-testid="inventory-create"]').should('exist');
    
    // Should see action buttons in table
    cy.get('[data-testid="inventory-edit"]').should('exist');
    cy.get('[data-testid="inventory-move"]').should('exist');
    cy.get('[data-testid="inventory-delete"]').should('exist');
  });

  it('should see all action buttons on Plans page', () => {
    cy.visit('/plans');
    
    // Should see create button
    cy.get('[data-testid="plan-create"]').should('exist');
    
    // Should see edit buttons in table
    cy.get('[data-testid="plan-edit"]').should('exist');
  });

  it('should see all action buttons on Procedures page', () => {
    cy.visit('/procedures');
    
    // Should see create button
    cy.get('[data-testid="procedure-create"]').should('exist');
    
    // Should see action buttons in table
    cy.get('[data-testid="procedure-view"]').should('exist');
    cy.get('[data-testid="procedure-actions"]').should('exist');
    
    // Should see edit and delete in dropdown
    cy.get('[data-testid="procedure-actions"]').first().click();
    cy.get('[data-testid="procedure-edit"]').should('exist');
    cy.get('[data-testid="procedure-delete"]').should('exist');
  });

  it('should be able to tab through all visible action buttons', () => {
    cy.visit('/ativos');
    
    // Tab through action buttons - they should all be focusable
    cy.get('[data-testid="company-create"]').focus();
    cy.focused().should('have.attr', 'data-testid', 'company-create');
    
    cy.get('[data-testid="sector-create"]').focus();
    cy.focused().should('have.attr', 'data-testid', 'sector-create');
    
    cy.get('[data-testid="subsection-create"]').focus();
    cy.focused().should('have.attr', 'data-testid', 'subsection-create');
  });
});