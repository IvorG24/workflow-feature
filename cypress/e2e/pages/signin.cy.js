describe("User Sign In Flow", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/sign-in");
    cy.url().should("include", "/sign-in");
  });
  it("Input fields should have required property", () => {
    cy.get("input").should("have.prop", "required");
  });
  it("Sign in a user", () => {
    cy.get("[data-cy='signin-input-email']").type("nojam38531@khaxan.com");
    cy.get("[data-cy='signin-input-password']").type("test123123");
    cy.get("[data-cy='signin-submit']").click();
    cy.url().should("include", "/dashboard");
  });
});
