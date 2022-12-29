describe("User Team Flow", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/sign-in");
    cy.url().should("include", "/sign-in");
    cy.get("[data-cy='signin-input-email']").type("nojam38531@khaxan.com");
    cy.get("[data-cy='signin-input-password']").type("test123123");
    cy.get("[data-cy='signin-submit']").click();
    cy.wait(2000);
  });
  it("Create a Team", () => {
    cy.get("[data-cy='navbar-select-teams']").click();
    cy.contains("Create Team").click();
    cy.url().should("include", "/teams/create");
    cy.get("input").should("have.prop", "required");
    cy.get("[data-cy='createTeam-input-teamName']").type("XYZ TEAM");
    cy.get("[data-cy='createTeam-submit']").click();
    cy.get("[data-cy='createTeam-select-members']").type("johndoe@gmail.com");
    cy.contains("+ Invite").click();
    cy.get("[data-cy='createTeam-submit']").click();
    cy.get("[data-cy='navbar-select-teams']").click();
    cy.contains("XYZ TEAM");
  });
  it("Select a Team, and update a Member to Purchaser", () => {
    cy.get("[data-cy='navbar-select-teams']").click();
    cy.contains("ABC TEAM").scrollIntoView();
    cy.contains("ABC TEAM").click();
    cy.get("[data-cy='navbar-members']").click();
    cy.get("[data-cy='navbar-select-teams']").should("have.value", "ABC TEAM");
    cy.get("[data-cy='memberList-select-role']")
      .last()
      .and("have.value", "Member")
      .as("lastSelectRole")
      .click();
    cy.contains("Purchaser").click();
    cy.contains("Member role updated").should("be.visible");
    cy.get("@lastSelectRole").should("have.value", "Purchaser");
  });
});
