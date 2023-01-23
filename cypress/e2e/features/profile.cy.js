import { testAvatar, userA } from "../../support/e2e";

describe("Profile", () => {
  it("Update User Profile", () => {
    cy.loginViaUi(userA);
    cy.get("[data-cy='navbar-profiles']").click();
    cy.get("[data-cy='edit-profile']").click();
    cy.get("input[type='file']").selectFile(testAvatar, { force: true });
    cy.get("[data-cy='username']").clear().type("johnnydoe");
    cy.get("[data-cy='firstname']").clear().type("John");
    cy.get("[data-cy='lastname']").clear().type("Doe");
    cy.get("[data-cy='submit']").click();
    cy.contains("johnnydoe");
    cy.contains("John Doe");
    cy.get("[data-cy='edit-profile']").click();
    cy.get("[data-cy='username']").clear().type(userA.email.split("@")[0]);
    cy.get("[data-cy='submit']").click();
    cy.contains(userA.email.split("@")[0]);
  });
});
