// cypress/e2e/acl/a11y.cy.ts

describe('ACL - Accessibility Tests', () => {
  it('should ensure hidden buttons are not tabbable for technician role', () => {
    cy.setRole('technician');
    cy.visit('/ativos');
    
    // Tab through the page and ensure we don't encounter hidden buttons
    let tabIndex = 0;
    const maxTabs = 20; // Reasonable limit to avoid infinite loop
    
    cy.get('body').type('{tab}');
    
    // Create a recursive function to tab through elements
    const checkTabbableElements = () => {
      if (tabIndex >= maxTabs) return;
      
      cy.focused().then(($el) => {
        // Ensure focused element is not a restricted button
        const testId = $el.attr('data-testid');
        if (testId) {
          expect(testId).not.to.equal('company-create');
          expect(testId).not.to.equal('asset-delete');
          expect(testId).not.to.equal('plan-create');
        }
        
        tabIndex++;
        if (tabIndex < maxTabs) {
          cy.get('body').type('{tab}');
          checkTabbableElements();
        }
      });
    };
    
    checkTabbableElements();
  });

  it('should ensure hidden buttons are not tabbable for requester role', () => {
    cy.setRole('requester');
    cy.visit('/inventory');
    
    // Similar test for requester role
    let tabIndex = 0;
    const maxTabs = 15;
    
    cy.get('body').type('{tab}');
    
    const checkTabbableElements = () => {
      if (tabIndex >= maxTabs) return;
      
      cy.focused().then(($el) => {
        const testId = $el.attr('data-testid');
        if (testId) {
          expect(testId).not.to.equal('inventory-create');
          expect(testId).not.to.equal('inventory-edit');
          expect(testId).not.to.equal('inventory-delete');
          expect(testId).not.to.equal('inventory-move');
        }
        
        tabIndex++;
        if (tabIndex < maxTabs) {
          cy.get('body').type('{tab}');
          checkTabbableElements();
        }
      });
    };
    
    checkTabbableElements();
  });

  it('should verify ARIA attributes on action buttons for admin', () => {
    cy.setRole('admin');
    cy.visit('/ativos');
    
    // Check that visible buttons have proper ARIA attributes
    cy.get('[data-testid="company-create"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="sector-create"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="asset-edit"]').should('have.attr', 'aria-label');
  });

  it('should verify buttons are not present in DOM for restricted users', () => {
    cy.setRole('requester');
    cy.visit('/plans');
    
    // Use cy.get() with should('not.exist') to ensure elements are not in DOM
    cy.get('[data-testid="plan-create"]').should('not.exist');
    cy.get('[data-testid="plan-edit"]').should('not.exist');
    
    // Also verify using direct DOM query
    cy.get('body').should(($body) => {
      expect($body.find('[data-testid="plan-create"]')).to.have.length(0);
      expect($body.find('[data-testid="plan-edit"]')).to.have.length(0);
    });
  });

  it('should verify focus behavior with keyboard navigation', () => {
    cy.setRole('technician');
    cy.visit('/inventory');
    
    // Test that we can navigate with keyboard and skip hidden buttons
    cy.get('body').tab();
    
    // Should be able to focus on visible elements
    cy.get('[data-testid="inventory-edit"]').should('exist').focus();
    cy.focused().should('have.attr', 'data-testid', 'inventory-edit');
    
    // Should be able to move between visible action buttons
    cy.get('[data-testid="inventory-move"]').should('exist').focus();
    cy.focused().should('have.attr', 'data-testid', 'inventory-move');
  });

  it('should verify role switching works correctly', () => {
    // Start as requester
    cy.setRole('requester');
    cy.visit('/ativos');
    cy.get('[data-testid="asset-edit"]').should('not.exist');
    
    // Switch to admin
    cy.setRole('admin');
    cy.reload();
    cy.get('[data-testid="asset-edit"]').should('exist');
    
    // Switch to technician
    cy.setRole('technician');
    cy.reload();
    cy.get('[data-testid="asset-edit"]').should('not.exist');
  });
});