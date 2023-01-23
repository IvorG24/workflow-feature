import { userA } from "../../support/e2e";

describe("Navbar", () => {
  it("Check if Navbar links are redirecting to correct url", () => {
    cy.loginViaUi(userA);
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
