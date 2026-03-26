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
import { LOGIN } from "../support/testids/login";
import { PATIENTS } from "../support/testids/patients";
import { STERILIZATION } from "../support/testids/sterilization";
import { USERS } from "./testids/users";
import { CLEANING } from "./testids/cleaning";
// import { HOMEPAGE } from "../support/testids/homepage"
// import { TRANSACTION } from "../support/testids/transaction"

// ... (importurile tale rămân neschimbate)

Cypress.Commands.add("sign", function () {
  cy.fixture("usersPage").then((users) => {
    cy.fixture("sterilizationPage").then((sterilization) => {
      cy.contains(STERILIZATION.BUTTON, users.signButton).should("be.visible").click({ force: true });
      cy.get(USERS.SIGN_MODAL_TITLE).should('be.visible').and('contain.text', this.users.signButton);
      cy.get(USERS.SIGNATURE_MODAL).find(USERS.SIGN_MODAL_BARCODE_INPUT).should('be.visible').click({ force: true }).type(users.barcode, { delay: 50, force: true }).type("{enter}");
      cy.get(USERS.SIGNATURE_MODAL).find(USERS.USER_PIN_FIELD).should("be.visible").type(users.pin, { force: true }).type("{enter}");
      cy.get(STERILIZATION.SUCCESS_MESSAGE_MODAL).should("be.visible").and("contain.text", sterilization.succesMessage);
    });
  });
});

Cypress.Commands.add("signCycle", function () {
  cy.fixture("usersPage").as("users");
  cy.fixture("sterilizationPage").as("sterilization");
  cy.contains(USERS.P, this.users.signModalMessage).should("be.visible");
  cy.contains(STERILIZATION.BUTTON, "Caută").should("be.disabled");
  cy.get(USERS.ENTER_NID_INPUT).should("be.visible").type(this.users.barcode).type("{enter}");
  cy.get(USERS.USER_PIN_FIELD).should("be.visible").type(this.users.pin).type("{enter}");
})

Cypress.Commands.add("selectselectWardHospitalization", function () {
  cy.contains(STERILIZATION.LABEL, this.sterilization.ward).should("be.visible");
  cy.get(STERILIZATION.DROPDOWN_SELECT_WARD_HOSPITALIZATION).should("be.visible").click({ force: true });
  cy.get(STERILIZATION.SELECTED_WARD_HOSPITALIZATION)
    .should("be.visible")
    .then(($options) => {
      const randomIndex = Math.floor(Math.random() * $options.length);
      const randomOption = $options[randomIndex];
      const randomTextWard = randomOption.innerText.trim();
      cy.wrap(randomOption).click({ force: true });
      cy.wrap(randomTextWard).as("selectedWard");
      
      // cy.get("@selectedWard").then((ward) => {
        // cy.get(STERILIZATION.COMPLETED_WARD_FIELD).should("be.visible").and("contain", ward);
      // }); // Închide .get("@selectedWard")
    }); // Închide .then(($options)
}); // Închide Cypress.Commands.add

Cypress.Commands.add("verifySignName", function (name) {
  cy.contains(STERILIZATION.DIV, "efectuat", { timeout: 10000 })
    .invoke("text")
    .then((fullText) => {
      const normalized = fullText.replace(/\s+/g, " ").trim();
      const match = normalized.match(/efectuat[ăa] de\s+([^,]+)/i);
      expect(match, `Text invalid: ${normalized}`).to.not.be.null;
      const nameFromText = match[1].trim();

      cy.get("@displayedName").then((displayedName) => {
        expect(nameFromText).to.equal(displayedName);
      });
    });
});

// CORECTAT: Închisă funcția handleCorrectiveAction separat de restul comenzilor
function handleCorrectiveAction() {
  cy.get(CLEANING.CORRECTIVE_ACTION_FIELD, { timeout: 10000 }).should("be.visible").click({ force: true });

  cy.get(CLEANING.CORRECTIVE_ACTION_OPTIONS)
    .should("have.length.greaterThan", 0)
    .then(($options) => {
      const randomIndex = Math.floor(Math.random() * $options.length);
      const randomOption = $options[randomIndex];
      const randomText = randomOption.innerText.trim();

      cy.wrap(randomOption).click({ force: true });
      cy.wrap(randomText).as("selectedCorrectiveAction");

      cy.get("@selectedCorrectiveAction").then((action) => {
        cy.contains(action, { timeout: 10000 }).should("be.visible");
      });
    });
} // <--- Aici trebuia închisă funcția!

Cypress.Commands.add("checkAllActivities", () => {
  cy.get("body").then(($body) => {
    const checkboxes = $body.find('[type="checkbox"]');
    if (checkboxes.length === 0) {
      throw new Error("Nu există activități (checkbox-uri) pentru acest tip de curățenie");
    }
    cy.wrap(checkboxes).each(($cb) => {
      if ($cb.attr("aria-checked") !== "true") {
        cy.wrap($cb).click({ force: true });
      }
    });
  });
});