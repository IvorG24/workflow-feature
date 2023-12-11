import { userA, userE } from "@/cypress/mocks/user";

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

  it("should onboard user E", () => {
    cy.loginUser(userE);
    cy.url().should("include", "/onboarding");

    cy.get("[data-cy='onboarding-input-username']").type(userE.username);
    cy.get("[data-cy='onboarding-input-first-name']").type(userE.firstName);
    cy.get("[data-cy='onboarding-input-last-name']").type(
      `${userE.lastName}{enter}`
    );
    cy.url().should("include", "/create-team");
  });
});
