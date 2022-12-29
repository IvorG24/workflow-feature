describe("Navbar", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/sign-in");
    cy.url().should("include", "/sign-in");
    cy.get("[data-cy='signin-input-email']").type("nojam38531@khaxan.com");
    cy.get("[data-cy='signin-input-password']").type("test123123");
    cy.get("[data-cy='signin-submit']").click();
  });
  it("Check if Navbar links are redirecting to correct url", () => {
    cy.get("[data-cy='navbar-profiles']").click();
    cy.url().should("include", "/profiles");
    cy.get("[data-cy='navbar-requests']").click();
    cy.url().should("include", "/requests");
    cy.get("[data-cy='navbar-notifications']").click();
    cy.url().should("include", "/notifications");
    cy.get("[data-cy='navbar-settings']").click();
    cy.url().should("include", "/settings");
  });
});
