import { userEmail, userPassword } from "../../support/e2e";

describe("Requests", () => {
  it("Create and Delete Request", () => {
    cy.visit("http://localhost:3000/sign-in");
    cy.get("[data-cy='signin-input-email']").type("sejidi1552@irebah.com");
    cy.get("[data-cy='signin-input-password']").type("test123123");
    cy.get("[data-cy='signin-submit']").click();
    cy.wait(2000);
    // Select a team in which the login user is a Member or Purchaser
    // This is to avoid getting the warning "This team doesn't have any possible approvers yet."
    cy.get("[data-cy='navbar-select-teams']").click();
    cy.contains("ABC TEAM").click();
    cy.wait(2000);
    cy.get("[data-cy='navbar-forms-dropdown']").click();
    cy.wait(500);
    // Create 3 requests to perform delete, approve, and reject
    Cypress._.times(3, () => {
      cy.get("[data-cy='navbar-createRequest']").first().click();
      cy.get("[data-cy='request-title']").type("TEST");
      cy.get("[data-cy='request-description']").type("Lorem ipsum");
      cy.get("[data-cy='request-submit']").click();
      cy.wait(2000);
      cy.contains("Request Created");
    });
    // Delete a Request
    cy.get("[data-cy='request-select-status']").click();
    cy.get(".mantine-Select-item").contains("Pending").click();
    cy.wait(2000);
    cy.get("[data-cy='request-status']").first().contains("Pending").click();
    cy.get("[data-cy='request-delete']").click();
    cy.get("button").contains("Confirm").click();
    cy.contains("Success!");
  });
  it("Approve and Reject Request", () => {
    cy.visit("http://localhost:3000/sign-in");
    cy.get("[data-cy='signin-input-email']").type(userEmail);
    cy.get("[data-cy='signin-input-password']").type(userPassword);
    cy.get("[data-cy='signin-submit']").click();
    cy.wait(2000);
    cy.get("[data-cy='navbar-select-teams']").click();
    cy.contains("ABC TEAM").click();
    cy.wait(1000);
    // Select a Request
    cy.get("[data-cy='navbar-requests']").first().click();
    cy.get("[data-cy='request-select-status']").as("selectStatus").click();
    cy.get(".mantine-Select-item").contains("Pending").click();
    cy.wait(2000);
    // Approve a Pending request
    cy.get("[data-cy='request-status']").first().contains("Pending").click();
    cy.get("[data-cy='request-approve']").click();
    cy.get("button").contains("Confirm").click();
    cy.contains("Success!");
    cy.wait(2000);
    // Reject a Request
    cy.get("[data-cy='request-status']").first().contains("Pending").click();
    cy.get("[data-cy='request-reject']").click();
    cy.get("button").contains("Confirm").click();
    cy.contains("Success!");
  });
});
