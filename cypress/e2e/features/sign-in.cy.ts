import { userA } from "@/cypress/mocks/user";

describe("Sign In", () => {
  beforeEach(() => {
    cy.visit("/sign-in");
  });

  it("should sign in user A and redirect to dashboard", () => {
    cy.loginUser(userA);
    cy.url().should("include", "/team-requests/dashboard");
    cy.contains("Dashboard");
  });

  it("should display invalid login credentials notification", () => {
    cy.get("[data-cy='signin-input-email']").type(userA.email);
    cy.get("[data-cy='signin-input-password']").type("123{enter}");
    cy.contains("Invalid login credentials");
  });
});
