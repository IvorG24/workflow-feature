import { userA } from "../../support/e2e";

describe("Forms", () => {
  beforeEach(() => {
    cy.loginViaUi(userA);
  });
  it("Create Form", () => {
    cy.get("[data-cy='create-form']").click();
    cy.url().should("include", "/forms/build");
    cy.get("input").should("have.prop", "required");
    cy.get("[data-cy='form-name']").type("Test Form without Attachment");
    cy.get("[data-cy='add-section']").click();
    cy.get("[data-cy='section-label']").type("Test Section Label");
    cy.get("[data-cy='add-question']").click();
    cy.get("[data-cy='form-question']").first().type("Text Question");
    // cy.get("[data-cy='add-question']").click();
    // cy.get("[data-cy='form-question']").next().type("Number Question");
    // cy.get("[data-cy='response-type']").click();
    // cy.get(".mantine-Select-item").contains("Number").click();
    cy.get("[data-cy='form-submit']").click();
    cy.wait(1000);
    cy.get("[data-cy='form-error-notification']").should("not.exist");
  });
});
