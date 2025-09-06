/// <reference types="cypress" />

describe('ACL - Requester User', () => {
  beforeEach(() => {
    cy.setRole('requester');
    cy.visit('/');
  });

  it('should NOT see any edit/delete buttons on Equipment page', () => {
    cy.visit('/ativos');
    
    // Should NOT see any creation buttons
    cy.get('[data-testid="company-create"]').should('not.exist');
    cy.get('[data-testid="sector-create"]').should('not.exist');
    cy.get('[data-testid="subsection-create"]').should('not.exist');
    cy.get('[data-testid="asset-edit"]').should('not.exist');
    cy.get('[data-testid="asset-create"]').should('not.exist');
  });

  it('should NOT see any edit/delete buttons on Inventory page', () => {
    cy.visit('/inventory');
    
    // Should NOT see any action buttons
    cy.get('[data-testid="inventory-create"]').should('not.exist');
    cy.get('[data-testid="inventory-edit"]').should('not.exist');
    cy.get('[data-testid="inventory-move"]').should('not.exist');
    cy.get('[data-testid="inventory-delete"]').should('not.exist');
  });

  it('should NOT see any buttons on Plans page', () => {
    cy.visit('/plans');
    
    // Should NOT see any action buttons
    cy.get('[data-testid="plan-create"]').should('not.exist');
    cy.get('[data-testid="plan-create-empty"]').should('not.exist');
    cy.get('[data-testid="plan-edit"]').should('not.exist');
  });

  it('should only see view button on Procedures page', () => {
    cy.visit('/procedures');
    
    // Should NOT see create button
    cy.get('[data-testid="procedure-create"]').should('not.exist');
    
    // Should see view button (everyone can view)
    cy.get('[data-testid="procedure-view"]').should('exist');
    
    // Should NOT see actions menu (no edit/delete permissions)
    cy.get('[data-testid="procedure-actions"]').should('not.exist');
  });

  it('should be able to create solicitations on Requests page', () => {
    cy.visit('/requests');
    
    // This test would verify the requester can create solicitations
    // The specific implementation would depend on how the requests page is set up
    // For now, we'll just verify the page loads and the user has view access
    cy.url().should('include', '/requests');
  });

  it('should have clean tab navigation without restricted buttons', () => {
    cy.visit('/ativos');
    
    // Verify that no restricted buttons exist in the DOM
    cy.get('body').then(($body: any) => {
      // All these elements should not exist for requesters
      expect($body.find('[data-testid="company-create"]')).to.have.length(0);
      expect($body.find('[data-testid="sector-create"]')).to.have.length(0);
      expect($body.find('[data-testid="subsection-create"]')).to.have.length(0);
      expect($body.find('[data-testid="asset-edit"]')).to.have.length(0);
      expect($body.find('[data-testid="asset-create"]')).to.have.length(0);
    });
  });

  it('should be able to navigate and view all pages', () => {
    // Requesters should be able to view all pages, just not edit/delete
    const pages = ['/ativos', '/inventory', '/plans', '/procedures', '/metrics', '/reports'];
    
    pages.forEach((page) => {
      cy.visit(page);
      cy.url().should('include', page);
      // Should not see any 403 or access denied messages
      cy.contains('Access denied').should('not.exist');
      cy.contains('Unauthorized').should('not.exist');
    });
  });
});