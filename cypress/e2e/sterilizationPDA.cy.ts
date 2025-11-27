/// <reference types="cypress" />
import { LOGIN } from "../support/testids/login";
import { DASHBOARD } from "../support/testids/dashboard";
import { STERILIZATION } from "../support/testids/sterilization";
import { USERS } from "../support/testids/users";
import { contains } from "cypress/types/jquery";

beforeEach(function () {
  cy.fixture("patientPage").as("patient");
  cy.fixture("sterilizationPage").as("sterilization");
  cy.fixture("usersPage").as("users");
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

it("Access Sterilization section from PDA", function () {
  cy.url().should("include", this.patient.endpointDashboardPage);
  cy.get(DASHBOARD.TRANSLATE_ICON).should("be.visible");
  cy.get(DASHBOARD.ACCOUNT_ICON).should("be.visible");
  cy.contains(STERILIZATION.DIV, "Sterilizare").should("be.visible");
  cy.get(STERILIZATION.STERILIZATION_AVATAR_IMAGE).should("be.visible").click();
  cy.url().should("include", this.sterilization.endpointSterilizationPagePDA);
});

it.only("Create a sterilization cycle -  add an instrument from the list", function () {
  cy.url().should("include", this.patient.endpointDashboardPage);
  cy.get(DASHBOARD.TRANSLATE_ICON).should("be.visible");
  cy.get(DASHBOARD.ACCOUNT_ICON).should("be.visible");
  cy.contains(STERILIZATION.DIV, this.sterilization.sterilizationTitle).should("be.visible");
  cy.get(STERILIZATION.STERILIZATION_AVATAR_IMAGE).should("be.visible").click();
  cy.url().should("include", this.sterilization.endpointSterilizationPagePDA);

  cy.contains(STERILIZATION.LABEL, this.sterilization.ward).should("be.visible");
  cy.get(STERILIZATION.DROPDOWN_SELECT_WARD).should("be.visible").click({ force: true });
  cy.get(STERILIZATION.SELECTED_WARD)
    .first()
    .should("be.visible")
    .then(($option) => {
      const firstOptionTextiAssetCategory = $option.text().trim();
      cy.wrap($option).click({ force: true });
      cy.contains(STERILIZATION.BUTTON, this.sterilization.save).should("be.disabled");
      cy.wrap(firstOptionTextiAssetCategory).as("selectedWard");
      cy.get(STERILIZATION.COMPLETED_WARD_FIELD).should("not.be.empty");
      cy.get(STERILIZATION.ASSET_CATEGORY_FIELD).should("be.visible").click({ force: true });
      cy.get(STERILIZATION.ASSET_CATEGORY_OPTION, { timeout: 5000 })
        .first()
        .should("be.visible")
        .then(($option) => {
          const firstOptionTextDropdown5 = $option.text().trim();
          cy.wrap($option).click({ force: true });
          cy.get(STERILIZATION.SELECTED_ASSET).should("not.be.empty");
          cy.wrap(firstOptionTextDropdown5).as("selectedAsset");
          cy.contains(STERILIZATION.BUTTON, this.sterilization.saveButton).should("be.visible").click({ force: true });
          cy.sign();
          cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
          cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.succesMessageReceptionOfDirty);
          cy.verifySignName(this.users.name);
          cy.contains(STERILIZATION.BUTTON, this.sterilization.nextStep).should("be.visible").click({ force: true });

          cy.contains(STERILIZATION.BUTTON, this.sterilization.receptionTab).should("be.visible");
          cy.get(STERILIZATION.P).should("contain.text", firstOptionTextiAssetCategory);
          cy.get(STERILIZATION.P).should("contain.text", firstOptionTextDropdown5);
          cy.get(STERILIZATION.EDIT_ICON).should("be.visible");
          cy.get(STERILIZATION.DELETE_ICON).should("be.visible");
          cy.get(STERILIZATION.CHECKBOX_RECEPTION).click({ force: true }).should("be.checked");
          cy.sign();
          cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
          cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessageReception);
          cy.contains(STERILIZATION.BUTTON, this.sterilization.nextStep)

            .should("be.visible")
            .click({ force: true });

          cy.contains(STERILIZATION.BUTTON, this.sterilization.cleaningButton).should("be.visible");

          cy.get(STERILIZATION.SUBSTANCE_FIELD).should("be.visible").click({ force: true });

          cy.get(STERILIZATION.SUBSTANCE_OPTION)
            .first()
            .should("be.visible")
            .then(($option) => {
              const firstOptionTextDropdownSubstance = $option.text().trim();
              cy.wrap($option).click({ force: true });

              cy.get(STERILIZATION.SPAN).should("contain.text", firstOptionTextDropdownSubstance);
              cy.get(STERILIZATION.CONCENTRATION_FIELD).should("be.visible").click({ force: true });

              cy.get(STERILIZATION.CONCENTRATION_OPTION)
                .first()
                .should("be.visible")
                .then(($option) => {
                  const firstOptionTextDropdownConcentration = $option.text().trim();
                  cy.wrap($option).click({ force: true });

                  cy.get(STERILIZATION.CONCENTRATION_FIELD).should("have.value", firstOptionTextDropdownConcentration);
                });
              cy.sign();
              cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
              cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessageCleaning);
              cy.contains(STERILIZATION.BUTTON, this.sterilization.nextStep).should("be.visible").click({ force: true });

              cy.contains(STERILIZATION.BUTTON, this.sterilization.disinfectionTab).should("be.visible");
              cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessageCleaning);
              cy.get(STERILIZATION.DISINFECTION_SUBSTANCE_FIELD).should("be.visible").click({ force: true });

              cy.get(STERILIZATION.DISINFECTION_SUBSTANCE_OPTION)
                .first()
                .should("be.visible")
                .then(($option) => {
                  const firstOptionTextDropdownSubstanceDesinfection = $option.text().trim();
                  cy.wrap($option).click({ force: true });

                  cy.get(STERILIZATION.SPAN).should("contain.text", firstOptionTextDropdownSubstance);
                  cy.get(STERILIZATION.CONCENTRATION_FIELD).should("be.visible").click({ force: true });

                  cy.get(STERILIZATION.CONCENTRATION_OPTION)
                    .first()
                    .should("be.visible")
                    .then(($option) => {
                      const firstOptionTextDropdownConcentration = $option.text().trim();
                      cy.wrap($option).click({ force: true });

                      cy.get(STERILIZATION.CONCENTRATION).should("have.value", firstOptionTextDropdownConcentration);
                      cy.contains(STERILIZATION.LABEL, this.sterilization.preparationDate).should("be.visible");
                      cy.contains(STERILIZATION.LABEL, this.sterilization.startDate).should("be.visible");
                      cy.contains(STERILIZATION.LABEL, this.sterilization.finalizationDate).should("be.visible");
                      cy.sign();
                      cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
                      cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.succesMessageDesinfection);
                      cy.contains(STERILIZATION.BUTTON, this.sterilization.nextStep).should("be.visible").click({ force: true });

                      cy.contains(STERILIZATION.BUTTON, this.sterilization.functionalityCheck).should("be.visible");
                      cy.contains(STERILIZATION.DIV, this.sterilization.succesMessageDesinfection).should("be.visible");
                      cy.get(STERILIZATION.COMMENTS_FIELD_CHECK_FUNCTIONALITY).should("be.visible").clear().type("Test");
                      cy.get(STERILIZATION.COMMENTS_FIELD_CHECK_FUNCTIONALITY).should("have.value", "Test");
                      cy.sign();
                      cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
                      cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessageFunctionalityCheck);
                      cy.contains(STERILIZATION.BUTTON, this.sterilization.nextStep).should("be.visible").click({ force: true });

                      cy.contains(STERILIZATION.BUTTON, this.sterilization.packingTab).should("be.visible");
                      cy.get(STERILIZATION.PACKING_SET_NUMBER_FIELD)
                        .should("have.attr", "placeholder", this.sterilization.packingSetNumberFieldPlaceholder)
                        .and("have.value", this.sterilization.packingSetNumber);
                      cy.get(STERILIZATION.MARKER_FIELD).should("be.visible").click({ force: true });
                      cy.get(STERILIZATION.MARKER_OPTION)
                        .first()
                        .should("be.visible")
                        .then(($option) => {
                          const firstOptionTextSelectMarkerField = $option.text().trim();
                          cy.wrap($option, { timeout: 5000 }).click({
                            force: true,
                          });
                          cy.get(STERILIZATION.SELECTED_TEXT_MARKER_FIELD).should("not.be.empty").and("contain.text", firstOptionTextSelectMarkerField);
                          cy.sign();
                          cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
                          cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessagePacking);
                          cy.contains(STERILIZATION.BUTTON, this.sterilization.nextStep).should("be.visible").click({ force: true });

                          cy.contains(STERILIZATION.BUTTON, this.sterilization.deviceScheduling).should("be.visible");
                          cy.get(STERILIZATION.STERILIZATION_DEVICE_SCHEDULING).should("be.visible").click();
                          cy.get(STERILIZATION.STERILIZATION_DEVICE_SCHEDULING_OPTION)
                            .first()
                            .should("be.visible")
                            .then(($option) => {
                              const firstOptionTextSelectSterilizationDeviceField = $option.text().trim();
                              cy.wrap($option, { timeout: 5000 }).click({
                                force: true,
                              });
                              cy.get(STERILIZATION.STERILIZATION_DEVICE_SCHEDULING_SELECTED_TEXT).should("not.be.empty").and("contain.text", firstOptionTextSelectSterilizationDeviceField);
                              cy.wrap(firstOptionTextSelectSterilizationDeviceField).as("selectedAutoclav");
                              cy.sign();
                              cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
                              cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessageDeviceScheduling);
                              cy.contains(STERILIZATION.BUTTON, this.sterilization.viewSterilizationCycle).should("be.visible").click({ force: true });

                              cy.contains(STERILIZATION.BUTTON, this.sterilization.autoclav1Device).should("be.visible");
                              cy.get<string>("@selectedWard").then((wardName) => {
                                cy.contains("span", wardName).should("be.visible");
                              });

                              cy.get<string>("@selectedAutoclav").then((autoclavName) => {
                                cy.get("button").should("be.visible").and("contain.text", autoclavName);
                              });

                              cy.get(STERILIZATION.STERILIZATION_CYCLE_NR).scrollIntoView().should("be.visible");
                              cy.get(STERILIZATION.STERILIZATION_CYCLE_NR)
                                .should("be.visible")
                                .and("have.attr", "type", "number")
                                .clear()
                                .type(this.sterilization.cycleNumber)
                                .and("have.value", this.sterilization.cycleNumber);
                              cy.get(STERILIZATION.TEMPERATURE_FIELD_CYCLE)
                                .should("be.visible")
                                .and("have.attr", "type", "number")
                                .clear()

                                .type(this.sterilization.temperature)
                                .and("have.value", this.sterilization.temperature);
                              cy.get(STERILIZATION.PRESSURE_FIELD_CYCLE).click({ force: true }).clear().type(this.sterilization.pressure).and("have.value", this.sterilization.pressure);
                              cy.get(STERILIZATION.MARKER_PENDING_CYCLES_FIELD).click();
                              cy.get(STERILIZATION.MARKER_PENDING_CYCLES_OPTION)
                                .first()
                                .invoke("text")
                                .then((firstOptionText) => {
                                  cy.get(STERILIZATION.MARKER_PENDING_CYCLES_OPTION).first().click();
                                  cy.get(STERILIZATION.MARKER_PENDING_CYCLES_SELECTED_TEXT).should("not.be.empty").and("contain.text", firstOptionText.trim());
                                });
                              cy.contains(STERILIZATION.BUTTON, this.sterilization.startPendingCycle).should("be.visible").click({ force: true });
                              cy.signCycle();
                              cy.get(STERILIZATION.SUCCESS_MESSAGE_MODAL).should("be.visible").and("contain.text", this.sterilization.successMessageStartPendingCycle);
                              cy.contains(STERILIZATION.BUTTON, this.sterilization.finishCycleButton).should("be.visible").click({ force: true });
                              cy.signCycle();
                              cy.get(STERILIZATION.SUCCESS_MESSAGE_MODAL).should("be.visible").and("contain.text", this.sterilization.successMessageFinishCycle);

                              cy.get(STERILIZATION.CONFORMITY_RADIO_BUTTON_TRUE).check({ force: true });
                              cy.contains(STERILIZATION.BUTTON, this.sterilization.signConformityButton).scrollIntoView().should("be.visible").click({ force: true });
                              cy.signCycle();
                              cy.get(STERILIZATION.SUCCESS_MESSAGE_MODAL).should("be.visible").and("contain.text", this.sterilization.successMessageSignConformity);
                              cy.get(STERILIZATION.ARROW_ICON_BUTTON).click({
                                force: true,
                              });
                              cy.get<string>("@selectedWard").then((wardName) => {
                                cy.contains("span", wardName)

                                  .should("be.visible");
                              });
                              cy.get<string>("@selectedAsset").then((assetName) => {
                                cy.contains("span", assetName).should("be.visible");
                              });
                            });

                          cy.get(STERILIZATION.CONFORMITY_RADIO_BUTTON_TRUE).check({ force: true });
                          cy.contains(STERILIZATION.BUTTON, this.sterilization.signConformityButton).scrollIntoView().should("be.visible").click({ force: true });
                          cy.signCycle();
                          cy.get(STERILIZATION.SUCCESS_MESSAGE_MODAL).should("be.visible").and("contain.text", this.sterilization.successMessageSignConformity);
                          cy.contains(STERILIZATION.BUTTON, this.sterilization.handOverButton).should("be.visible").click({ force: true });
                          cy.signCycle();
                          cy.get(STERILIZATION.SUCCESS_MESSAGE_MODAL).should("be.visible").and("contain.text", this.sterilization.successMessageHandOver);
                          cy.contains(STERILIZATION.BUTTON, this.sterilization.receiveButton).should("be.visible").click({ force: true });
                          cy.signCycle();
                          cy.get(STERILIZATION.SUCCESS_MESSAGE_MODAL).should("be.visible").and("contain.text", this.sterilization.successMessageReceive);
                          cy.contains(STERILIZATION.SPAN, this.sterilization.compliantLabel).should("be.visible");
                          cy.contains(STERILIZATION.SPAN, this.sterilization.handedOverLabel).should("be.visible");
                          cy.contains(STERILIZATION.SPAN, this.sterilization.receivedLabel).should("be.visible");
                        });
                    });
                });
            });
        });
    });
});
