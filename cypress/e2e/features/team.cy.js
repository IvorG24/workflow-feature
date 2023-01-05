import { user } from "../../support/e2e";

const invitedUser = {
  email: "sejidi1552@irebah.com",
  password: "test123123",
};

const teamName = "TEST 002 TEAM";

describe("Team", () => {
  it("Create a Team, and update a Member Role", () => {
    cy.loginViaUi(user);
    cy.get("[data-cy='navbar-select-teams']").as("selectTeam").click();
    cy.contains("Create Team").click();
    cy.url().should("include", "/teams/create");
    cy.get("input").should("have.prop", "required");
    // Step 1 - Add Team Name
    cy.get("[data-cy='team-name']").type(teamName);
    cy.get("[data-cy='team-submit']").click();
    // Step 2 - Invite Members
    cy.get("[data-cy='team-select-members']").type(invitedUser.email);
    cy.contains("+ Invite").click();
    cy.get("[data-cy='team-submit']").click();
    cy.get("@selectTeam").click();
    cy.contains(teamName);
    cy.wait(500);

    // Update a member role. The selected team should have atleast Member role
    cy.get("@selectTeam").invoke("val", "ABC TEAM").trigger("change");
    cy.contains("ABC TEAM").click();
    cy.wait(1000);
    cy.get("[data-cy='navbar-members']").click();
    cy.get("@selectTeam").should("have.value", "ABC TEAM");
    // Select a random member with a Member role and update to Purchaser
    cy.get("[data-cy='memberList-select-role']")
      .last()
      .and("have.value", "Member")
      .as("lastSelectRole")
      .click();
    // Select Purchaser from the Select dropdown and click()
    cy.get(".mantine-Select-item")
      .as("mantineSelectItem")
      .contains("Purchaser")
      .click();
    cy.contains("Member role updated").should("be.visible");
    cy.get("@lastSelectRole").should("have.value", "Purchaser");
    cy.wait(1000);
    // Revert role back to Member
    cy.get("@lastSelectRole").click();
    cy.get("@mantineSelectItem").contains("Member").click();
    cy.get("@lastSelectRole").should("have.value", "Member");
  });
  it("Accept an Invite", () => {
    cy.loginViaUi(invitedUser);
    cy.get("[data-cy='navbar-notifications']").click();
    cy.get("[data-cy='notification-message']")
      .contains("invited")
      .first()
      .click();
    cy.url().should("include", "/team-invitations");
    cy.get("[data-cy='invitation-button']").click();
    cy.contains(teamName);
  });
});
