describe('US02 & US09 - File Download', () => {
  let downloadUrl: string;
  let protectedDownloadUrl: string;
  const password = 'SecretPassword123';

  // Setup: Creating real files before the test
  before(() => {
    // 1. Upload Public File
    cy.visit('/');
    
    // Opening the modal first
    cy.get('button.group.relative').should('be.visible').click();
    
    // File selection
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg', { force: true });
    
    // Click on transfer (via class w-full)
    cy.get('button.w-full').should('not.be.disabled').click();
    
    // Retrieving the link
    cy.get('input[readonly]').invoke('val').then((val) => {
      downloadUrl = val as string;
    });

    // 2. Upload Protected File
    cy.reload(); // Reset form by reloading the page
    
    // Opening the modal (after reloading)
    cy.get('button.group.relative').should('be.visible').click();
    
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg', { force: true });
    
    // Password
    cy.get('input[id="password"]').type(password);
    
    // Transfer
    cy.get('button.w-full').should('not.be.disabled').click();
    
    // Retrieving the protected link
    cy.get('input[readonly]').invoke('val').then((val) => {
      protectedDownloadUrl = val as string;
    });
  });

  it('should download a public file directly (US02)', () => {
    // We visit the generated link
    cy.visit(downloadUrl);

    // Metadata verification
    cy.contains('test-image.jpg').should('be.visible');
    
    // Download interception
    cy.intercept('POST', '**/download').as('downloadCall');
    
    cy.contains('button', 'Télécharger').click();
    
    cy.wait('@downloadCall').its('response.statusCode').should('eq', 201);
    cy.contains('Téléchargement lancé').should('be.visible');
  });

  it('should ask for password for protected file (US09)', () => {
    cy.visit(protectedDownloadUrl);

    // Verification that the password field is present
    cy.get('input[type="password"]').should('be.visible');
    
    // 1. Incorrect password attempt
    cy.get('input[type="password"]').type('WrongPass');
    cy.contains('button', 'Télécharger').click();
    
    // UI error check (Toast or red text)
    cy.contains('Mot de passe incorrect').should('be.visible');

    // 2. Attempting correct password
    cy.get('input[type="password"]').clear().type(password);
    
    cy.intercept('POST', '**/download').as('downloadCall');
    cy.contains('button', 'Télécharger').click();
    
    cy.wait('@downloadCall').its('response.statusCode').should('eq', 201);
    cy.contains('Téléchargement lancé').should('be.visible');
  });
});