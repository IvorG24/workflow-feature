describe("Team", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/sign-in");
    cy.url().should("include", "/sign-in");
    // User should be an owner/admin of a team
    cy.get("[data-cy='signin-input-email']").type("nojam38531@khaxan.com");
    cy.get("[data-cy='signin-input-password']").type("test123123");
    cy.get("[data-cy='signin-submit']").click();
    cy.wait(2000);
  });
  it("Create a Team, and update a Member Role", () => {
    cy.get("[data-cy='navbar-select-teams']").as("selectTeam").click();
    cy.contains("Create Team").click();
    cy.url().should("include", "/teams/create");
    cy.get("input").should("have.prop", "required");
    // Step 1 - Add Team Name
    cy.get("[data-cy='team-name']").type("XYZ TEAM");
    cy.get("[data-cy='team-submit']").click();
    // Step 2 - Invite Members
    cy.get("[data-cy='team-select-members']").type("johndoe@gmail.com");
    cy.contains("+ Invite").click();
    cy.get("[data-cy='team-submit']").click();
    cy.get("@selectTeam").click();
    cy.contains("XYZ TEAM");
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
});
