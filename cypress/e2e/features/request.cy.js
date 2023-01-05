import { user } from "../../support/e2e";

function selectStatus(status) {
  cy.get("[data-cy='request-select-status']").click();
  cy.get(".mantine-Select-item").contains(status).click();
  cy.wait(2000);
}

describe("Requests", () => {
  it("Create and Delete Request", () => {
    cy.loginViaUi({ email: "sejidi1552@irebah.com", password: "test123123" });
    // Select a team in which the login user is a Member or Purchaser
    // This is to avoid getting the warning "This team doesn't have any possible approvers yet."
    cy.selectTeam("ABC TEAM");
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
    cy.get("[data-cy='navbar-requests']").click();
    selectStatus("Pending");
    cy.get("[data-cy='request-status']").first().contains("Pending").click();
    cy.get("[data-cy='request-delete']").click();
    cy.get("button").contains("Confirm").click();
    cy.contains("Success!");
  });
  it("Approve and Reject Request", () => {
    cy.loginViaUi(user);
    cy.selectTeam("ABC TEAM");
    cy.get("[data-cy='navbar-requests']").click();
    selectStatus("Pending");
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
  it("Add, Edit, and Delete Comment", () => {
    const comment = "Test comment";
    cy.loginViaUi(user);
    cy.selectTeam("ABC TEAM");
    cy.get("[data-cy='navbar-requests']").click();
    cy.get("[data-cy='request-status']").first().click();
    // Create Comment
    cy.get("[data-cy='request-input-comment']").type(comment);
    cy.get("[data-cy='request-submit-comment']").click();
    cy.contains("Success!");
    // Edit Comment
    cy.contains(comment)
      .get("[data-cy='request-comment-options']")
      .as("testCommentOptions")
      .click();
    cy.get("[data-cy='request-edit-comment']").click();
    cy.get("[data-cy='request-input-edit-comment']").type(
      `{selectAll}{backspace}Edited: ${comment}`
    );
    cy.get("[data-cy='request-submit-edited-comment']").click();
    cy.contains("Success!");
    // Delete Comment
    cy.get("@testCommentOptions").click();
    cy.get("[data-cy='request-delete-comment']").click();
    cy.contains("Success!");
  });
});
