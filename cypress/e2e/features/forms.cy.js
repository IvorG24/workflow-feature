describe("Creating Forms", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/sign-in");
    cy.url().should("include", "/sign-in");
    cy.get("[data-cy='signin-input-email']").type("nojam38531@khaxan.com");
    cy.get("[data-cy='signin-input-password']").type("test123123");
    cy.get("[data-cy='signin-submit']").click();
    cy.wait(2000);
  });
  it("Test form validations", () => {
    cy.get("[data-cy='navbar-createForm']").click();
    cy.url().should("include", "/forms/build");
    cy.contains("Create Request Form");
    cy.get("input").should("have.prop", "required");
    cy.get("[data-cy='formBuilder-formName']").as("formName").type("Test Form");
    cy.get("[data-cy='formBuilder-addSection']").click();
    cy.get("[data-cy='formBuilder-sectionLabel']").type("Test Section Title");
    cy.get("[data-cy='formBuilder-addQuestion']").click();
    cy.get("[data-cy='formBuilder-question']").type("Test Question");
    cy.get("[data-cy='formBuilder-saveForm']").click();
    cy.wait(1000);
    cy.contains("Form built");
  });
});
