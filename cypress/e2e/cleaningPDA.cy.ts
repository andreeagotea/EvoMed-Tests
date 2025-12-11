/// <reference types="cypress" />
import { LOGIN } from "../support/testids/login";
import { DASHBOARD } from "../support/testids/dashboard";
import { CLEANING } from "../support/testids/cleaning";
import { STERILIZATION } from "../support/testids/sterilization";

beforeEach(function () {
  cy.fixture("patientPage").as("patient");
  cy.fixture("usersPage").as("users");
  cy.fixture("cleaningPage").as("cleaning");
  cy.fixture("sterilizationPage").as("sterilization");
  cy.visit("https://qaintegrat-iocn.dev.evozon.com/");
  cy.viewport(350, 650);

  const username = Cypress.env("username");
  const [first, last] = username.split(".") || ["", ""];

  const lastUpper = (last || "").toUpperCase();
  const firstCapitalized = (first || "").charAt(0).toUpperCase() + (first || "").slice(1);
  const displayedName = `${lastUpper} ${firstCapitalized}`;

  cy.wrap(displayedName).as("displayedName");

  cy.get(LOGIN.USER_NAME_LOGIN).should("be.visible").type(Cypress.env("username"));
  cy.get(LOGIN.PASSWORD_LOGIN).should("be.visible").type(Cypress.env("password"));
  cy.get(LOGIN.LOGIN_BUTTON).should("be.visible").click();
});

it("Access Cleaning section from PDA", function () {
  cy.url().should("include", this.patient.endpointDashboardPage);
  cy.get(DASHBOARD.TRANSLATE_ICON).should("be.visible");
  cy.get(DASHBOARD.ACCOUNT_ICON).should("be.visible");
  cy.contains(CLEANING.DIV, "Curățenie").should("be.visible");
  cy.get(CLEANING.CLEANING_AVATAR_IMAGE).should("be.visible").click();
  cy.url().should("include", this.cleaning.endpointCleaningPage);
});

it.only("Add a new cleaning -  Compliant cycle", function () {
  cy.url().should("include", this.patient.endpointDashboardPage);
  cy.get(DASHBOARD.TRANSLATE_ICON).should("be.visible");
  cy.get(DASHBOARD.ACCOUNT_ICON).should("be.visible");
  cy.contains(CLEANING.DIV, "Curățenie").should("be.visible");
  cy.get(CLEANING.CLEANING_AVATAR_IMAGE).should("be.visible").click();
  cy.url().should("include", this.cleaning.endpointCleaningPage);

  cy.contains(CLEANING.H6, this.cleaning.newCleaningLabel).should("be.visible").click({ force: true });
  cy.get(CLEANING.DROPDOWN_SELECT_WARD, { timeout: 20000 }).should("be.visible").click({ force: true });
  cy.get(CLEANING.SELECTED_WARD)
    .should("be.visible")
    .then(($options) => {
      const randomIndex = Math.floor(Math.random() * $options.length);
      const randomOption = $options[randomIndex];
      const randomTextWard = randomOption.innerText.trim();
      cy.wrap(randomOption).click({ force: true });
      cy.wrap(randomTextWard).as("selectedWard");
      cy.get("@selectedWard").then((ward) => {
        cy.get(STERILIZATION.COMPLETED_WARD_FIELD).should("be.visible").and("contain", ward);
      });
    });

  cy.get(CLEANING.LOCATION_FIELD, { timeout: 50000 }).should("be.visible").click({ force: true });

  const optionSelector = CLEANING.LOCATION_OPTIONS;
  const noOptionsText = this.cleaning.noOptionsTextLocation;

  cy.get("body", { timeout: 10000 }).should(($body) => {
    const foundOptions = $body.find(optionSelector).length;
    const foundNoOptions = $body.find(`*:contains("${noOptionsText}")`).length;
    expect(foundOptions + foundNoOptions).to.be.greaterThan(0);
  });

  cy.get("body").then(($body) => {
    const $options = $body.find(optionSelector);

    if ($options.length === 0) {
      throw new Error(`Nu există opțiuni pentru LOCATION FIELD — câmpul este obligatoriu.`);
    }

    const randomIndex = Math.floor(Math.random() * $options.length);
    const randomOption = $options[randomIndex];
    const randomTextLocation = randomOption.innerText.trim();

    cy.wrap(randomOption).click({ force: true });

    cy.wrap(randomTextLocation).as("selectedLocation");
    cy.get("@selectedLocation").then((location) => {
      cy.get(CLEANING.COMPLETED_LOCATION_FIELD, { timeout: 10000 }).should("be.visible").and("contain.text", location);
    });
  });

  cy.get(CLEANING.CLEANING_TYPE_FIELD).should("be.visible").click({ force: true });
  cy.get(CLEANING.SELECTED_CLEANING_TYPE)
    .should("be.visible")
    .then(($options) => {
      const randomIndex = Math.floor(Math.random() * $options.length);
      const randomOption = $options[randomIndex];
      const randomTextCleaningType = randomOption.innerText.trim();
      cy.wrap(randomOption).click({ force: true });
      cy.wrap(randomTextCleaningType).as("selectedCleaningType");
      cy.get("@selectedCleaningType").then((cleaningType) => {
        cy.get(CLEANING.COMPLETED_CLEANING_TYPE_FIELD).should("be.visible").and("contain", cleaningType);
      });

      cy.get(CLEANING.SUBSTANCE_FIELD, { timeout: 50000 }).should("be.visible").click({ force: true });
      cy.get(CLEANING.SELECTED_SUBSTANCE)
        .should("be.visible")
        .then(($options) => {
          const randomIndex = Math.floor(Math.random() * $options.length);
          const randomOption = $options[randomIndex];
          const randomTextSubstance = randomOption.innerText.trim();
          cy.wrap(randomOption).click({ force: true });
          cy.wrap(randomTextSubstance).as("selectedSubstance");
          cy.get("@selectedSubstance").then((substance) => {
            cy.get(CLEANING.COMPLETED_CLEANING_TYPE_FIELD).should("be.visible").and("contain", substance);
          });
          cy.contains(CLEANING.BUTTON, this.cleaning.cancelButton).should("be.visible");
          cy.contains(CLEANING.BUTTON, this.sterilization.saveButton).should("be.visible").click({ force: true });
        });
      cy.get(STERILIZATION.EDIT_ICON).should("be.visible");
      cy.get(STERILIZATION.DELETE_ICON).should("be.visible");

      cy.get<string>("@selectedWard").then((wardName) => {
        cy.contains("p", wardName, { timeout: 10000 }).should("be.visible");
      });

      cy.get<string>("@selectedCleaningType").then((cleaningType) => {
        cy.contains("p", cleaningType, { timeout: 10000 }).should("be.visible");
      });

      cy.get('[type="checkbox"]').each((_, index) => {
        cy.get('[type="checkbox"]')
          .eq(index)
          .then(($cb) => {
            if ($cb.attr("aria-checked") !== "true") {
              cy.wrap($cb).click({ force: true });
            }
          });
      });
      cy.sign();
      cy.contains(CLEANING.SPAN, this.sterilization.succesMessage).should("be.visible");
    });
});
