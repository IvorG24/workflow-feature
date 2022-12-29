import { userEmail, userPassword } from "../../support/e2e";

describe("Forms", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/sign-in");
    cy.get("[data-cy='signin-input-email']").type(userEmail);
    cy.get("[data-cy='signin-input-password']").type(userPassword);
    cy.get("[data-cy='signin-submit']").click();
    cy.wait(2000);
  });
  it("Create Form", () => {
    cy.get("[data-cy='navbar-createForm']").click();
    cy.url().should("include", "/forms/build");
    cy.contains("Create Request Form");
    cy.get("input").should("have.prop", "required");
    cy.get("[data-cy='form-name']").type("Test Form");
    cy.get("[data-cy='add-section']").click();
    cy.get("[data-cy='section-label']").type("Test Section Label");
    cy.get("[data-cy='add-question']").click();
    cy.get("[data-cy='form-question']").type("Test Question");
    cy.get("[data-cy='form-submit']").click();
    cy.wait(1000);
    cy.get("[data-cy='form-error-notification']").should("not.exist");
  });
});
