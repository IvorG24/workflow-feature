describe("Signin", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/sign-in");
    cy.url().should("include", "/sign-in");
    cy.get("input").should("have.prop", "required");
    cy.get("[data-cy='signin-input-email']").type("nojam38531@khaxan.com");
    cy.get("[data-cy='signin-input-password']").type("test123123");
  });
  it("Sign in a user", () => {
    cy.get("[data-cy='signin-submit']").click();
    cy.url().should("include", "/dashboard");
  });
  it("Logout a user", () => {
    cy.get("[data-cy='signin-submit']").click();
    cy.get("[data-cy='navbar-logout']").click();
    cy.url().should("include", "/sign-in");
  });
});
