import { user } from "../../support/e2e";

describe("Signin", () => {
  it("Sign in, and Logout a user", () => {
    cy.loginViaUi(user);
    cy.url().should("include", "/dashboard");
    cy.get("[data-cy='navbar-logout']").click();
    cy.url().should("include", "/sign-in");
  });
});
