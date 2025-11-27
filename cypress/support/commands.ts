
// ******Cypress.Commands.add('loginViaUI', (email: string, password: string) => 
// *****************************************
// This example commands.js shows you how to
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
import {LOGIN} from "../support/testids/login"
import { PATIENTS } from "../support/testids/patients"
import { STERILIZATION } from "../support/testids/sterilization"
import { USERS } from "./testids/users"
// import { HOMEPAGE } from "../support/testids/homepage"
// import { TRANSACTION } from "../support/testids/transaction"

Cypress.Commands.add('sign', function() {
cy.fixture('usersPage').as('users')
cy.fixture('sterilizationPage').as('sterilization')
cy.contains(USERS.BUTTON, this.users.signButton).should('be.visible').click({force: true})
cy.contains(USERS.P, this.users.signModalMessage).should('be.visible')
cy.contains(USERS.BUTTON, this.users.searchButton).should('be.disabled')
cy.get(USERS.ENTER_NID_INPUT).should('be.visible').type(this.users.barcode).type('{enter}')
cy.get(USERS.USER_PIN_FIELD).should('be.visible').type(this.users.pin).type('{enter}')
cy.get(STERILIZATION.SUCCESS_MESSAGE_MODAL).should('be.visible').and('contain.text', this.sterilization.succesMessage)
})

Cypress.Commands.add('signCycle', function() {
    cy.fixture('usersPage').as('users')
    cy.fixture('sterilizationPage').as('sterilization')
    cy.contains(USERS.P, this.users.signModalMessage).should('be.visible')
    cy.contains(STERILIZATION.BUTTON, 'Caută').should('be.disabled')
    cy.get(USERS.ENTER_NID_INPUT).should('be.visible').type(this.users.barcode).type('{enter}')
    cy.get(USERS.USER_PIN_FIELD).should('be.visible').type(this.users.pin).type('{enter}')
});

Cypress.Commands.add('verifySignName', function(name) {
    cy.get(STERILIZATION.DIV)
  .invoke("text")
  .then((fullText) => {
    let nameFromText = "";
    if (fullText && fullText.includes("efectuată de")) {
      const after = fullText.split("efectuată de ")[1] || "";
      nameFromText = (after.split(",")[0] || "").trim();
    } else {
      const m = fullText.match(/efectuat[ăa] de\s+(.*?),/i);
      nameFromText = m ? m[1].trim() : "";
    }
    cy.get("@displayedName").then((displayedName) => {
      expect(nameFromText).to.equal(displayedName);
    });
  });
});