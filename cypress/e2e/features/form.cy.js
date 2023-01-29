import { userA } from "../../support/e2e";

describe("Forms", () => {
  beforeEach(() => {
    cy.loginViaUi(userA);
  });
  it("Create Form", () => {
    cy.get("[data-cy='create-form']").click();
    cy.url().should("include", "/forms/build");
    cy.get("input").should("have.prop", "required");
    cy.get("[data-cy='form-name']").type(`Test Form`);
    cy.get("[data-cy='add-section']").click();
    cy.get("[data-cy='section-label']").type("Test Section Label");
    cy.get("[data-cy='add-question']").click();
    // Text
    cy.get("[data-cy='form-question']").first().type("Text Question");
    cy.get("[data-cy='add-question']").click();
    // Number
    cy.get("[data-cy='form-question']").last().type("Number Question");
    cy.get("[data-cy='response-type']").last().click();
    cy.get(".mantine-Select-item").contains("NUMBER").click();
    cy.get("[data-cy='add-question']").click();
    // Date
    cy.get("[data-cy='form-question']").last().type("Date Question");
    cy.get("[data-cy='response-type']").last().click();
    cy.get(".mantine-Select-item").contains("DATE").first().click();
    cy.get("[data-cy='add-question']").click();
    // Daterange
    cy.get("[data-cy='form-question']").last().type("Daterange Question");
    cy.get("[data-cy='response-type']").last().click();
    cy.get(".mantine-Select-item").contains("DATERANGE").click();
    cy.get("[data-cy='add-question']").click();
    // Email
    cy.get("[data-cy='form-question']").last().type("Email Question");
    cy.get("[data-cy='response-type']").last().click();
    cy.get(".mantine-Select-item").contains("EMAIL").click();
    cy.get("[data-cy='add-question']").click();
    // Multiple
    cy.get("[data-cy='form-question']").last().type("Multiple Select Question");
    cy.get("[data-cy='response-type']").last().click();
    cy.get(".mantine-Select-item").contains("MULTIPLE").click();
    cy.get("[data-cy='select-field']").type("Option A");
    cy.get(".mantine-Select-dropdown").click();
    cy.get("[data-cy='select-field']").type("Option B");
    cy.get(".mantine-Select-dropdown").click();
    cy.get("[data-cy='add-question']").click();
    // Slider
    cy.get("[data-cy='form-question']").last().type("Slider Question");
    cy.get("[data-cy='response-type']").last().click();
    cy.get(".mantine-Select-item").contains("SLIDER").click();
    cy.get("[data-cy='add-question']").click();
    // Select
    cy.get("[data-cy='form-question']").last().type("Select Question");
    cy.get("[data-cy='response-type']").last().click();
    cy.get(".mantine-Select-item").contains("SELECT").click();
    cy.get("[data-cy='select-field']").last().type("Option 1");
    cy.get(".mantine-Select-dropdown").click();
    cy.get("[data-cy='select-field']").last().type("Option 2");
    cy.get(".mantine-Select-dropdown").click();
    cy.get("[data-cy='add-question']").click();
    // Time
    cy.get("[data-cy='form-question']").last().type("Time Question");
    cy.get("[data-cy='response-type']").last().click();
    cy.get(".mantine-Select-item").contains("TIME").click();
    cy.get("[data-cy='form-submit']").click();
    cy.wait(1000);
    cy.get("[data-cy='form-error-notification']").should("not.exist");
  });
});
