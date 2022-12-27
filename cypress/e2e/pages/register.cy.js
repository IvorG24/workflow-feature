describe("User Registration Flow", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/register");
    cy.url().should("include", "/register");
  });
  it("Input fields should have required property", () => {
    cy.get("input").should("have.prop", "required");
  });
  it("Register a user with wrong input", () => {
    cy.get("[data-cy='register-input-email']").type("wrongemail@com");
    cy.get("[data-cy='register-input-password']").type("123");
    cy.get("[data-cy='register-input-confirmPassword']").type("123");
    cy.get("[data-cy='register-submit']").click();

    cy.get("[data-cy='register-notification']").should("not.exist");
  });
  it("Register a user with correct input", () => {
    cy.get("[data-cy='register-input-email']").type("imjohndoe@gmail.com");
    cy.get("[data-cy='register-input-password']").type("testpassword123");
    cy.get("[data-cy='register-input-confirmPassword']").type(
      "testpassword123"
    );
    cy.get("[data-cy='register-submit']").click();

    cy.get("[data-cy='register-notification']").should("exist");
  });
});
