import { userA } from "../../support/e2e";

describe("Signin", () => {
  it("Sign in, and Logout a user", () => {
    cy.loginViaUi(userA);
    cy.get("[data-cy='navbar-logout']").click();
    cy.url().should("include", "/sign-in");
  });
});
