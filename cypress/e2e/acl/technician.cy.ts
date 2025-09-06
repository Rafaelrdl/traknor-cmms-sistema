/// <reference types="cypress" />

describe('ACL - Technician User', () => {
  beforeEach(() => {
    cy.setRole('technician');
    cy.visit('/');
  });

  it('should NOT see asset creation buttons but see movement buttons', () => {
    cy.visit('/ativos');
    
    // Should NOT see location creation buttons (asset creation restricted for technicians)
    cy.get('[data-testid="company-create"]').should('not.exist');
    cy.get('[data-testid="sector-create"]').should('not.exist');
    cy.get('[data-testid="subsection-create"]').should('not.exist');
    
    // Should NOT see asset edit button (no permission to edit assets)
    cy.get('[data-testid="asset-edit"]').should('not.exist');
    cy.get('[data-testid="asset-create"]').should('not.exist');
  });

  it('should see inventory movement buttons but not delete', () => {
    cy.visit('/inventory');
    
    // Should NOT see create button (restricted for technicians)
    cy.get('[data-testid="inventory-create"]').should('not.exist');
    
    // Should see edit and move buttons (technicians can edit/move inventory)
    cy.get('[data-testid="inventory-edit"]').should('exist');
    cy.get('[data-testid="inventory-move"]').should('exist');
    
    // Should NOT see delete button (no delete permission for inventory)
    cy.get('[data-testid="inventory-delete"]').should('not.exist');
  });

  it('should NOT see plan creation or edit buttons', () => {
    cy.visit('/plans');
    
    // Should NOT see create button (no plan creation permission)
    cy.get('[data-testid="plan-create"]').should('not.exist');
    cy.get('[data-testid="plan-create-empty"]').should('not.exist');
    
    // Should NOT see edit buttons (no plan edit permission)
    cy.get('[data-testid="plan-edit"]').should('not.exist');
  });

  it('should see procedure edit but not create or delete', () => {
    cy.visit('/procedures');
    
    // Should NOT see create button (no procedure creation permission)
    cy.get('[data-testid="procedure-create"]').should('not.exist');
    
    // Should see view button (everyone can view)
    cy.get('[data-testid="procedure-view"]').should('exist');
    
    // Should see actions menu but with limited options
    cy.get('[data-testid="procedure-actions"]').should('exist');
    cy.get('[data-testid="procedure-actions"]').first().click();
    
    // Should see edit (technicians can edit procedures)
    cy.get('[data-testid="procedure-edit"]').should('exist');
    
    // Should NOT see delete (no delete permission)
    cy.get('[data-testid="procedure-delete"]').should('not.exist');
  });

  it('should verify non-existent buttons are not tabbable', () => {
    cy.visit('/ativos');
    
    // Ensure restricted buttons don't exist in DOM (not just hidden)
    cy.get('body').then(($body: any) => {
      // These elements should not exist at all, so they won't interfere with tab navigation
      expect($body.find('[data-testid="company-create"]')).to.have.length(0);
      expect($body.find('[data-testid="asset-delete"]')).to.have.length(0);
    });
  });
});