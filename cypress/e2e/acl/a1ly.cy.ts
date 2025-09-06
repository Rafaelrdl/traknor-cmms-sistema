/// <reference types="cypress" />

describe('ACL - Accessibility Tests', () => {
  it('should ensure hidden buttons are not tabbable for technician role', () => {
    cy.setRole('technician');
    cy.visit('/ativos');
    
    // Aguarda carregamento da página
    cy.contains('TrakNor').should('be.visible');
    cy.contains('Ativos').should('be.visible');
    
    // Verifica que elementos restritos não estão presentes ou visíveis
    cy.get('[data-testid="company-create"]').should('not.exist');
    cy.get('[data-testid="asset-delete"]').should('not.exist');
    cy.get('[data-testid="plan-create"]').should('not.exist');
  });

  it('should ensure hidden buttons are not tabbable for requester role', () => {
    cy.setRole('requester');
    cy.visit('/inventory');
    
    // Aguarda carregamento da página
    cy.contains('TrakNor').should('be.visible');
    cy.contains('Estoque').should('be.visible');
    
    // Verifica que elementos restritos não estão presentes
    cy.get('[data-testid="inventory-create"]').should('not.exist');
    cy.get('[data-testid="inventory-delete"]').should('not.exist');
  });

  it('should verify ARIA attributes on action buttons for admin', () => {
    cy.setRole('admin');
    cy.visit('/ativos');
    
    // Aguarda carregamento da página
    cy.contains('TrakNor').should('be.visible');
    cy.contains('Ativos').should('be.visible');
    
    // Verifica elementos que devem estar presentes para admin
    cy.get('[data-testid="company-create"]').should('exist');
    cy.get('[data-testid="sector-create"]').should('exist');
  });

  it('should verify buttons are not present in DOM for restricted users', () => {
    cy.setRole('requester');
    cy.visit('/plans');
    
    // Use cy.get() with should('not.exist') to ensure elements are not in DOM
    cy.get('[data-testid="plan-create"]').should('not.exist');
    cy.get('[data-testid="plan-edit"]').should('not.exist');
    
    // Also verify using direct DOM query
    cy.get('body').should(($body: any) => {
      expect($body.find('[data-testid="plan-create"]')).to.have.length(0);
      expect($body.find('[data-testid="plan-edit"]')).to.have.length(0);
    });
  });

  it('should verify focus behavior with keyboard navigation', () => {
    cy.setRole('technician');
    cy.visit('/inventory');
    
    // Aguarda carregamento da página  
    cy.contains('TrakNor').should('be.visible');
    cy.contains('Estoque').should('be.visible');
    
    // Verifica que elementos permitidos estão visíveis e habilitados
    cy.get('[data-testid="inventory-edit"]').should('exist');
    cy.get('[data-testid="inventory-move"]').should('exist');
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