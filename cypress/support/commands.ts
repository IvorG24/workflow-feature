/// <reference types="cypress" />

import { LayoutKeys } from "@/components/Layout/LayoutList";
import { MockUser } from "../mocks/user";

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add("loginUser", (user: MockUser) => {
  cy.visit("/sign-in");
  cy.get("[data-cy='signin-input-email']").type(user.email);
  cy.get("[data-cy='signin-input-password']").type(user.password);
  cy.get("[data-cy='signin-button-submit']").click();
});

Cypress.Commands.add("logoutUser", (layout: LayoutKeys) => {
  if (layout === "APP") {
    cy.get("[data-cy='header-account-button']").click();
  }
  cy.get("[data-cy='header-button-logout']").click();
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginUser(user: MockUser): Chainable<void>;
      logoutUser(layout: LayoutKeys): Chainable<void>;
    }
  }
}

// Prevent TypeScript from reading file as legacy script
export {};
