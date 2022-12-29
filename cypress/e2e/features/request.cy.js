describe("Requests", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/sign-in");
    cy.url().should("include", "/sign-in");
    cy.get("[data-cy='signin-input-email']").type("sejidi1552@irebah.com");
    cy.get("[data-cy='signin-input-password']").type("test123123");
    cy.get("[data-cy='signin-submit']").click();
    cy.wait(2000);
  });
  it("Create Request", () => {
    cy.get("[data-cy='navbar-select-teams']").click();
    cy.contains("ABC TEAM").click();
    cy.wait(2000);
    cy.get("[data-cy='navbar-forms-dropdown']").click();
    cy.wait(500);
    cy.get("[data-cy='navbar-createRequest']").first().click();
    cy.get("[data-cy='request-title']").type("TEST");
    cy.get("[data-cy='request-description']").type("Lorem ipsum");
    cy.get("[data-cy='request-submit']").click();
    cy.contains("TEST");
  });
});
