describe('US05, US06, US08 - User Dashboard', () => {

  beforeEach(() => {
    // 1. Login
    cy.visit('/login');
    cy.get('input[name="email"]').type('cypress@test.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    
    // 2. SEEDING (Data Creation)
    // We force a return to the homepage to access UploadHero
    cy.visit('/'); 

    // Click on the large round UploadHero button to open the modal.
    cy.get('button svg.lucide-upload').closest('button').click();
    
    // 3. Now the modal is open, the input exists
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('Fichier de test pour le Dashboard'),
      fileName: 'dashboard-test.txt',
      mimeType: 'text/plain',
    }, { force: true }); // force:true car le dropzone recouvre souvent l'input

    // 4. The upload is confirmed (using the "Send" or "Upload" button in the modal).
    // We take the submit button which is visible
    cy.get('div[role="dialog"] button').last().click();

    // 5. We are waiting for the upload to finish (either the toast or the readonly input of the link).
    cy.get('input[readonly]', { timeout: 10000 }).should('be.visible');

    // 6. Now we'll go to the Dashboard to test the display
    cy.visit('/dashboard');
    cy.intercept('GET', '**/api/files/history*').as('getHistory');
    cy.wait('@getHistory');
  });

  it('should display file history (US05)', () => {
    cy.url().should('match', /\/(dashboard|tableau-de-bord)/);
    // The test will pass because we just created a file
    cy.get('div[class*="bg-card"].border').should('have.length.at.least', 1);
  });

  it('should add tags to a file (US08)', () => {
    // 1. Define the network spy
    cy.intercept('PATCH', '**/*tags').as('updateTags');

    const newTag = 'CypressTest';

    // 2. Open the modal
    cy.get('div[class*="bg-card"].border').first().within(() => {
      cy.get('button svg.lucide-tag').parent().click();
    });

    // 3. Working in the modal
    cy.get('div[role="dialog"]').within(() => {
      cy.get('input[placeholder*="tag"]').should('be.visible');

      // Added tag + Entry
      cy.get('input[placeholder*="tag"]').type(`${newTag}{enter}`);
      
      // Technical break for the UI animation
      cy.wait(500);

      cy.get('button')
        .contains(/Save|Sauvegarder|Enregistrer|Confirm|Valider/i)
        .should('be.visible')
        .should('not.be.disabled')
        .click();
    });

    // 4. Verification
    // We're increasing the timeout a bit in case the server is slow on the first call.
    cy.wait('@updateTags', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
    
    // Visual verification
    cy.contains(newTag).should('be.visible');
  });

});