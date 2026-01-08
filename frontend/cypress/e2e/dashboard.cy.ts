describe('US05, US06, US08 - User Dashboard', () => {

  beforeEach(() => {
    // Quick login
    cy.visit('/login');
    cy.get('input[name="email"]').type('cypress@test.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    
    // Wait for loading
    cy.intercept('GET', '**/api/files/history*').as('getHistory');
    cy.wait('@getHistory');
  });

  it('should display file history (US05)', () => {
    // We accept either /dashboard (en) or /tableau-de-bord (fr)
    cy.url().should('match', /\/(dashboard|tableau-de-bord)/);
    
    // We check that there is at least one file
    // We specifically target cards that have a border (like FileItems) to avoid the sidebar
    cy.get('div[class*="bg-card"].border').should('have.length.at.least', 1);
  });

  it('should add tags to a file (US08)', () => {
    // 1. Open the editing modal (Tag button)
    // We target the first file in the list
    cy.get('div[class*="bg-card"].border').first().within(() => {
      // We are looking for the button that contains the Tag icon (lucide-tag)
      cy.get('button svg.lucide-tag').parent().click();
    });

    // 2. Check that the modal is open
    cy.get('input[placeholder*="tag"]').should('be.visible');

    // 3. Add a tag
    const newTag = 'CypressTest';
    cy.get('input[placeholder*="tag"]').type(`${newTag}{enter}`);

    // 4. To safeguard
    cy.intercept('PATCH', '**/tags').as('updateTags');
    cy.get('button[class*="bg-[#E77A6E]"]').click();

    // 5. Check for success and presence on the list
    cy.wait('@updateTags').its('response.statusCode').should('eq', 200);
    
    // Verify that the tag appears in the list (FileItem)
    cy.contains(newTag).should('be.visible');
  });

});