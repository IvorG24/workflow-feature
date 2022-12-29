import { userEmail, userPassword } from "../../support/e2e";

describe("Navbar", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/sign-in");
    cy.get("[data-cy='signin-input-email']").type(userEmail);
    cy.get("[data-cy='signin-input-password']").type(userPassword);
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
