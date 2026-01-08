describe('US01 & US07 - File Upload', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should upload a file anonymously (US07)', () => {
    cy.intercept('POST', '**/api/files/upload-anonymous').as('uploadRequest');

    // Opening the upload modal (React stability)
    cy.get('button.group.relative').should('be.visible');
    cy.get('button.group.relative').click();

    cy.get('input[type="file"]').should('exist');

    // File selection
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg', { force: true });

    // UI Verification
    cy.contains('test-image.jpg').should('be.visible');

    // Action (w-full button)
    cy.get('button.w-full').should('not.be.disabled').click();

    // Validation Response (201 Created)
    cy.wait('@uploadRequest').its('response.statusCode').should('eq', 201);

    // Real success story
    cy.contains('Félicitations').should('be.visible');

    // We check that the link contains 'telechargement' (fr) or 'download' (en)
    cy.get('input[readonly]').invoke('val').should('match', /\/(download|telechargement)\/.*/);
  });

  it('should upload a file as logged user (US01)', () => {
    // --- Login ---
    cy.visit('/login');
    cy.get('input[name="email"]').type('cypress@test.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    
    // i18n
    cy.url().should('match', /\/(dashboard|tableau-de-bord)/);
    
    // Return to homepage to upload
    cy.visit('/'); 
    
    // --- Upload ---
    cy.intercept('POST', '**/api/files/upload').as('authUploadRequest');
    
    // Opening
    cy.get('button.group.relative').should('be.visible');
    cy.get('button.group.relative').click();
    
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg', { force: true });
    
    // Optional password test
    cy.get('input[id="password"]').type('Secret123'); 

    // Action
    cy.get('button.w-full').should('not.be.disabled').click();
    cy.wait('@authUploadRequest').its('response.statusCode').should('eq', 201);
    cy.contains('Félicitations').should('be.visible');
  });
});