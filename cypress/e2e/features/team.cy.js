import {
  teamLogo,
  testfile,
  userA,
  userB,
  userC,
  userD,
} from "../../support/e2e";

const randomTeamName = Math.random().toString(36).slice(2, 10);

describe("Teams", () => {
  it("Create a team, invite User B, and update team", () => {
    cy.loginViaUi(userA);
    cy.get("[data-cy='navbar-select-teams']").as("selectTeam").click();
    cy.contains("Create Team").click();
    cy.get("input").should("have.prop", "required");
    // Step 1 - Add Team Name
    cy.get("[data-cy='team-name']").type(randomTeamName);
    cy.get("[data-cy='team-submit']").click();
    // Step 2 - Invite Members
    cy.get("[data-cy='team-select-members']").type(userB.email);
    cy.contains("+ Invite").click();
    cy.get("[data-cy='team-submit']").click();
    cy.get("@selectTeam").click();
    cy.contains(randomTeamName.toLocaleUpperCase());
    cy.get("@selectTeam").click();
    // Update Team
    cy.get("[data-cy='navbar-settings']").click();
    cy.get("[data-cy='general-tab']").click();
    // Update Team Name
    cy.get("[data-cy='team-name']").type(`testteam+1`);
    // Update Team Logo
    cy.get("input[type='file']").selectFile(teamLogo, { force: true });
    cy.get("[data-cy='update-team']").click();
    cy.get("[data-cy='team-name']")
      .invoke("attr", "placeholder")
      .should("eq", `testteam+1`);
    // Change Team Name to original
    cy.get("[data-cy='team-name']").type(randomTeamName);
    cy.get("[data-cy='update-team']").click();
  });
  it("Signin User B, and Accept Invitation", () => {
    cy.loginViaUi(userB);
    cy.get("[data-cy='navbar-notifications']").click();
    cy.get("[data-cy='notification-item']").contains(randomTeamName).click();
    cy.get("[data-cy='accept-invite']").click();
    cy.get("[data-cy='to-team-dashboard']").click();
  });
  it("Update Team Role and invite User C and User D", () => {
    cy.loginViaUi(userA);
    cy.get("[data-cy='navbar-select-teams']").click();
    cy.contains(randomTeamName.toLocaleUpperCase()).click();
    cy.get("[data-cy='navbar-settings']").click();
    cy.get("[data-cy='memberList-select-role']")
      .last()
      .and("have.value", "Member")
      .click();
    cy.get(".mantine-Select-item").contains("Admin").click();
    cy.contains("Member role updated").should("be.visible");

    // Invite more members
    cy.get("[data-cy='team-select-members']").type(userC.email);
    cy.contains("+ Create").click();
    cy.get("[data-cy='team-select-members']").type(userD.email);
    cy.contains("+ Create").click();
    cy.get("[data-cy='submit']").click();
    cy.contains("Invitations sent successfully");
    cy.get("[data-cy='navbar-logout']").click();
  });
  it("Signin User C, and Accept Invitation", () => {
    cy.loginViaUi(userC);
    cy.get("[data-cy='navbar-notifications']").click();
    cy.get("[data-cy='notification-item']").contains(randomTeamName).click();
    cy.get("[data-cy='accept-invite']").click();
    cy.get("[data-cy='to-team-dashboard']").click();
  });
  it("Signin User D, and Accept Invitation", () => {
    cy.loginViaUi(userD);
    cy.get("[data-cy='navbar-notifications']").click();
    cy.get("[data-cy='notification-item']").contains(randomTeamName).click();
    cy.get("[data-cy='accept-invite']").click();
    cy.get("[data-cy='to-team-dashboard']").click();
  });
  it("Signin User A, and promote User D to Purchaser", () => {
    cy.loginViaUi(userA);
    cy.get("[data-cy='navbar-select-teams']").click();
    cy.contains(randomTeamName.toLocaleUpperCase()).click();
    cy.get("[data-cy='navbar-settings']").click();
    cy.get("[data-cy='memberList-select-role']")
      .last()
      .and("have.value", "Member")
      .click();
    cy.get(".mantine-Select-item").contains("Purchaser").click();
    cy.contains("Member role updated").should("be.visible");
  });
  it("Signin each user and add signature", () => {
    const users = [userA, userB, userC, userD];

    users.forEach((user) => {
      cy.loginViaUi(user);
      cy.get("[data-cy='navbar-select-teams']").click();
      cy.get(".mantine-Select-item")
        .contains(randomTeamName.toLocaleUpperCase())
        .click();
      cy.get("[data-cy='navbar-settings']").click();
      cy.get("[data-cy='profile-tab']").click();
      cy.get("[data-cy='add-signature']").click();
      cy.get("input[type='file']").selectFile(testfile, { force: true });
      cy.get("[data-cy='save-signature']").click({ force: true });
      cy.get("[data-cy='navbar-logout']").click();
    });
  });
});
