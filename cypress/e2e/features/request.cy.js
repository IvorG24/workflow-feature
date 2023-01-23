import { testfile, userA, userB, userC, userD } from "../../support/e2e";

const titles = [
  "The Great Gatsby",
  "To Kill a Mockingbird",
  "The Lord of the Rings",
  "The Little Prince",
  "Pride and Prejudice",
  "The Hobbit",
  "The Diary of a Young Girl",
  "The Catcher in the Rye",
  "The Picture of Dorian Gray",
  "One Hundred Years of Solitude",
  "The Iliad",
  "The Odyssey",
  "Don Quixote",
  "The Divine Comedy",
  "The Stranger",
  "The Metamorphosis",
  "The Brothers Karamazov",
  "War and Peace",
  "The Count of Monte Cristo",
];

const randomIndexA = Math.floor(Math.random() * titles.length);
const randomIndexB = Math.floor(Math.random() * titles.length);
const randomTitleA = titles[randomIndexA];
const randomTitleB = titles[randomIndexB];

describe("Requests", () => {
  it("Create Request without Attachment", () => {
    cy.loginViaUi(userC);
    cy.get("[data-cy='navbar-forms-dropdown']").click();
    cy.get("[data-cy='create-request']").first().click();
    cy.get("[data-cy='select-approver']").click();
    cy.get(".mantine-Select-item").contains(userB.email.split("@")[0]).click();
    cy.get("[data-cy='request-title']").type(randomTitleA);
    cy.get("[data-cy='request-description']").type("Lorem ipsum");
    cy.get("[data-cy='request-submit']").click();
    cy.contains(randomTitleA);
  });
  it("Create Request with attachment and purchaser, and add comment", () => {
    cy.loginViaUi(userC);
    cy.get("[data-cy='navbar-forms-dropdown']").click();
    cy.get("[data-cy='create-request']").first().click();
    cy.get("[data-cy='select-approver']").click();
    cy.get(".mantine-Select-item").contains(userB.email.split("@")[0]).click();
    cy.get("[data-cy='select-purchaser']").click();
    cy.get(".mantine-Select-item").contains(userD.email.split("@")[0]).click();
    cy.get("[data-cy='request-title']").type(randomTitleB);
    cy.get("[data-cy='request-description']").type("Lorem ipsum");
    cy.get("input[type='file']").selectFile(testfile, { force: true });
    cy.get("[data-cy='request-submit']").click();
    cy.contains(randomTitleB);

    const randomStringA = Math.random().toString(36).slice(2, 10);
    const randomStringB = Math.random().toString(36).slice(2, 10);
    // comment with attachment
    cy.get("[data-cy='request-item']").first().click();
    cy.get("[data-cy='show-comments']").click();
    cy.get("[data-cy='comment-content']").type(randomStringA);
    cy.get("input[type='file']").selectFile(testfile, { force: true });
    cy.get("[data-cy='submit']").click();
    cy.get("[data-cy='comment']").contains(randomStringA);
    // comment without attachment
    cy.get("[data-cy='comment-content']").type(randomStringB);
    cy.get("[data-cy='submit']").click();
    cy.get("[data-cy='comment']").contains(randomStringB);
  });
  it("Download a Pending request", () => {
    cy.loginViaUi(userA);
    cy.get("[data-cy='navbar-requests']").click();
    cy.get("[data-cy='request-item']").contains(randomTitleA).click();
    cy.get("[data-cy='request-status']")
      .children()
      .should("have.text", "pending");
    cy.get("[data-cy='download-request']").click();
    cy.contains("Sorry!");
  });
  it("Approve Request", () => {
    cy.loginViaUi(userB);
    cy.get("[data-cy='navbar-requests']").click();
    cy.get("[data-cy='request-item']").contains(randomTitleA).click();
    cy.get("[data-cy='approve-request']").click();
    cy.get("[data-cy='request-status']")
      .children()
      .should("have.text", "approved");
    cy.get("[data-cy='request-item']").contains(randomTitleB).click();
    cy.get("[data-cy='approve-request']").click();
    cy.get("[data-cy='request-status']")
      .children()
      .should("have.text", "approved");
  });
  it("Purchase Request", () => {
    cy.loginViaUi(userD);
    cy.get("[data-cy='request-item']").contains(randomTitleB).click();
    cy.get("[data-cy='purchase-request']").click();
    cy.get("[data-cy='request-status']")
      .children()
      .should("have.text", "purchased");
  });
  it("Test Filters - Search, Form Type, Status", () => {
    cy.loginViaUi(userA);
    cy.get("[data-cy='navbar-requests']").click();
    cy.get("[data-cy='search-filter']").type(randomTitleB);
    cy.contains(randomTitleB);
    cy.get("[data-cy='form-filter']").click();
    cy.get(".mantine-Select-item").first().click();
    cy.get("[data-cy='status-filter']").click();
    cy.get(".mantine-Select-item").contains("Approved").click();
  });
});
