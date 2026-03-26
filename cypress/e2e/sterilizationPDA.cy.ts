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
  cy.visit("https://qaone-iocn.dev.evozon.com/");
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

it("Create a sterilization cycle -  Compliant cycle", function () {
  cy.url().should("include", this.patient.endpointDashboardPage);
  cy.get(DASHBOARD.TRANSLATE_ICON).should("be.visible");
  cy.get(DASHBOARD.ACCOUNT_ICON).should("be.visible");
  cy.contains(STERILIZATION.DIV, this.sterilization.sterilizationTitle).should("be.visible");
  cy.get(STERILIZATION.STERILIZATION_AVATAR_IMAGE).should("be.visible").click();
  cy.url().should("include", this.sterilization.endpointSterilizationPagePDA);

  cy.contains(STERILIZATION.LABEL, this.sterilization.ward).should("be.visible");
  cy.get(STERILIZATION.DROPDOWN_SELECT_WARD).should("be.visible").click({ force: true });
  cy.get(STERILIZATION.SELECTED_WARD)
    .should("be.visible")
    .then(($options) => {
      const randomIndex = Math.floor(Math.random() * $options.length);
      const randomOption = $options[randomIndex];
      const randomTextWard = randomOption.innerText.trim();
      cy.wrap(randomOption).click({ force: true });
      cy.wrap(randomTextWard).as("selectedWard");
      cy.get("@selectedWard").then((ward) => {
        cy.get(STERILIZATION.COMPLETED_WARD_FIELD).should("be.visible").and("contain", ward);
        cy.contains(STERILIZATION.BUTTON, this.sterilization.save).should("be.disabled");
        cy.wrap(randomTextWard).as("selectedWard");
        cy.get(STERILIZATION.ASSET_CATEGORY_FIELD).should("be.visible").click({ force: true });
        cy.get(STERILIZATION.ASSET_CATEGORY_OPTION, { timeout: 5000 })
          .should("be.visible")
          .then(($options) => {
            const randomIndex = Math.floor(Math.random() * $options.length);
            const randomOption = $options[randomIndex];
            const randomTextAsset = randomOption.innerText.trim();
            cy.wrap(randomOption).click({ force: true });
            cy.wrap(randomTextWard).as("selectedAsset");
            cy.get("@selectedAsset").then((asset) => {
              cy.get(STERILIZATION.SELECTED_ASSET).should("not.be.empty").and("contain", asset);
              cy.wrap(randomTextAsset).as("selectedAsset");
              cy.contains(STERILIZATION.BUTTON, this.sterilization.saveButton).should("be.visible").click({ force: true });
              cy.sign();
              cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
              cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.succesMessageReceptionOfDirty);
              cy.verifySignName(this.users.name);
              cy.contains(STERILIZATION.BUTTON, this.sterilization.nextStep).should("be.visible").click({ force: true });

              cy.contains(STERILIZATION.BUTTON, this.sterilization.receptionTab).should("be.visible");
              cy.get(STERILIZATION.P).should("contain.text", randomTextWard);
              cy.get(STERILIZATION.P).should("contain.text", randomTextAsset);
              cy.get(STERILIZATION.EDIT_ICON).should("be.visible");
              cy.get(STERILIZATION.DELETE_ICON).should("be.visible");
              cy.get(STERILIZATION.CHECKBOX_RECEPTION).click({ force: true }).should("be.checked");
              cy.sign();
              cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
              cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessageReception);
              cy.contains(STERILIZATION.BUTTON, this.sterilization.nextStep).should("be.visible").click({ force: true });

              cy.contains(STERILIZATION.BUTTON, this.sterilization.cleaningButton).should("be.visible");
              cy.get(STERILIZATION.SUBSTANCE_FIELD).scrollIntoView().click({ force: true });
              cy.get(STERILIZATION.SUBSTANCE_OPTION, { timeout: 10000 })
                .should("exist")
                .its("length")
                .should("be.gt", 0)
                .then((count) => {
                  const randomIndex = Math.floor(Math.random() * count);
                  cy.get(STERILIZATION.SUBSTANCE_OPTION)
                    .eq(randomIndex)
                    .scrollIntoView()
                    .click({ force: true })
                    .invoke("text")
                    .then((text) => {
                      const randomTextSubstance = text.trim();
                      cy.wrap(randomTextSubstance).as("selectedSubstance");
                    });
                });
              cy.get("@selectedSubstance").then((substance) => {
                cy.get(STERILIZATION.SPAN, { timeout: 10000 })
                  .should("be.visible")
                  .invoke("text")
                  .then((text) => {
                    expect(text.trim()).to.contain(substance);
                  });
                cy.get(STERILIZATION.CONCENTRATION_FIELD).scrollIntoView({ block: "center" }).click({ force: true });
                cy.get('ul[role="listbox"]', { timeout: 10000 })
                  .should("exist")
                  .find('li[role="option"]')
                  .its("length")
                  .should("be.gt", 0)
                  .then((count) => {
                    const randomIndex = Math.floor(Math.random() * count);
                    cy.get('ul[role="listbox"] li[role="option"]')
                      .eq(randomIndex)
                      .scrollIntoView()
                      .invoke("text")
                      .then((text) => {
                        const selectedConcentration = text.trim();
                        cy.wrap(selectedConcentration).as("selectedConcentration");
                        cy.get('ul[role="listbox"] li[role="option"]').eq(randomIndex).click();
                      });
                  });
                cy.get("@selectedConcentration").then((concentration) => {
                  cy.get(STERILIZATION.CONCENTRATION_FIELD).should("have.value", concentration);
                });
                cy.sign();
                cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
                cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessageCleaning);
                cy.contains(STERILIZATION.BUTTON, this.sterilization.nextStep).should("be.visible").click({ force: true });

                cy.contains(STERILIZATION.BUTTON, this.sterilization.disinfectionTab).should("be.visible");
                cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessageCleaning);

                cy.get(STERILIZATION.DISINFECTION_SUBSTANCE_FIELD).scrollIntoView().should("be.visible").click({ force: true });
                cy.get(STERILIZATION.DISINFECTION_SUBSTANCE_OPTION, { timeout: 10000 })
                  .should("exist")
                  .its("length")
                  .should("be.gt", 0)
                  .then((count) => {
                    const randomIndex = Math.floor(Math.random() * count);

                    cy.get(STERILIZATION.DISINFECTION_SUBSTANCE_OPTION)
                      .eq(randomIndex)
                      .scrollIntoView()
                      .click({ force: true })
                      .invoke("text")
                      .then((text) => {
                        const randomTextDisinfectionSubstance = text.trim();
                        cy.wrap(randomTextDisinfectionSubstance).as("selectedDisinfectionSubstance");
                      });
                  });

                cy.get("@selectedDisinfectionSubstance").then((substance) => {
                  cy.get(STERILIZATION.SPAN, { timeout: 10000 })
                    .should("be.visible")
                    .invoke("text")
                    .then((text) => {
                      expect(text.trim()).to.contain(substance);
                    });
                });

                cy.get(STERILIZATION.CONCENTRATION_FIELD).scrollIntoView().click({ force: true });
                cy.get(STERILIZATION.CONCENTRATION_OPTION, { timeout: 10000 })
                  .should("exist")
                  .its("length")
                  .should("be.gt", 0)
                  .then((count) => {
                    const randomIndex = Math.floor(Math.random() * count);

                    cy.get(STERILIZATION.CONCENTRATION_OPTION)
                      .eq(randomIndex)
                      .scrollIntoView()
                      .click({ force: true })
                      .invoke("text")
                      .then((text) => {
                        const randomTextConcentration = text.trim();
                        cy.wrap(randomTextConcentration).as("selectedConcentration");
                      });
                  });

                cy.get("@selectedConcentration").then((concentration) => {
                  cy.get(STERILIZATION.CONCENTRATION_FIELD).should("have.value", concentration);
                });

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
                cy.get(STERILIZATION.MARKER_FIELD).scrollIntoView().should("be.visible").click({ force: true });
                cy.get(STERILIZATION.MARKER_OPTION, { timeout: 10000 })
                  .should("exist")
                  .its("length")
                  .should("be.gt", 0)
                  .then((count) => {
                    const randomIndex = Math.floor(Math.random() * count);
                    cy.get(STERILIZATION.MARKER_OPTION)
                      .eq(randomIndex)
                      .scrollIntoView()
                      .click({ force: true })
                      .invoke("text")
                      .then((text) => {
                        const selectedMarker = text.trim();
                        cy.wrap(selectedMarker).as("selectedMarker");
                      });
                  });
                cy.get("@selectedMarker").then((marker) => {
                  cy.get(STERILIZATION.SELECTED_TEXT_MARKER_FIELD, { timeout: 10000 })
                    .should("be.visible")
                    .invoke("text")
                    .then((text) => {
                      expect(text.trim()).to.contain(marker);
                    });
                });
                cy.sign();
                cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
                cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessagePacking);
                cy.contains(STERILIZATION.BUTTON, this.sterilization.nextStep).should("be.visible").click({ force: true });

                cy.contains(STERILIZATION.BUTTON, this.sterilization.deviceScheduling).should("be.visible");
                cy.get(STERILIZATION.STERILIZATION_DEVICE_SCHEDULING).scrollIntoView().should("be.visible").click({ force: true });

                cy.get(STERILIZATION.STERILIZATION_DEVICE_SCHEDULING_OPTION, { timeout: 10000 })
                  .should("exist")
                  .its("length")
                  .should("be.gt", 0)
                  .then((count) => {
                    const randomIndex = Math.floor(Math.random() * count);

                    cy.get(STERILIZATION.STERILIZATION_DEVICE_SCHEDULING_OPTION)
                      .eq(randomIndex)
                      .scrollIntoView()
                      .click({ force: true })
                      .invoke("text")
                      .then((text) => {
                        const selectedAutoclav = text.trim();
                        cy.wrap(selectedAutoclav).as("selectedAutoclav");
                        cy.get(STERILIZATION.STERILIZATION_DEVICE_SCHEDULING_SELECTED_TEXT, { timeout: 10000 })
                          .should("be.visible")
                          .invoke("text")
                          .then((displayedText) => {
                            expect(displayedText.trim()).to.contain(selectedAutoclav);
                          });
                      });
                  });
                cy.sign();
                cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
                cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessageDeviceScheduling);
                cy.contains(STERILIZATION.BUTTON, this.sterilization.viewSterilizationCycle).should("be.visible").click({ force: true });
                cy.get<string>("@selectedWard").then((wardName) => {
                  cy.contains("span", wardName, { timeout: 10000 }).should("be.visible");
                });

                cy.get<string>("@selectedAutoclav").then((autoclavName) => {
                  cy.get("button", { timeout: 10000 }).should("be.visible").and("contain.text", autoclavName);
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
                  cy.contains("span", wardName).should("be.visible");
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

it("Create a sterilization cycle -  Non-compliant cycle", function () {
  cy.url().should("include", this.patient.endpointDashboardPage);
  cy.get(DASHBOARD.TRANSLATE_ICON).should("be.visible");
  cy.get(DASHBOARD.ACCOUNT_ICON).should("be.visible");
  cy.contains(STERILIZATION.DIV, this.sterilization.sterilizationTitle).should("be.visible");
  cy.get(STERILIZATION.STERILIZATION_AVATAR_IMAGE).should("be.visible").click();
  cy.url().should("include", this.sterilization.endpointSterilizationPagePDA);

  cy.contains(STERILIZATION.LABEL, this.sterilization.ward).should("be.visible");
  cy.get(STERILIZATION.DROPDOWN_SELECT_WARD).should("be.visible").click({ force: true });
  cy.get(STERILIZATION.SELECTED_WARD)
    .should("be.visible")
    .then(($options) => {
      const randomIndex = Math.floor(Math.random() * $options.length);
      const randomOption = $options[randomIndex];
      const randomTextWard = randomOption.innerText.trim();
      cy.wrap(randomOption).click({ force: true });
      cy.wrap(randomTextWard).as("selectedWard");
      cy.get("@selectedWard").then((ward) => {
        cy.get(STERILIZATION.COMPLETED_WARD_FIELD).should("be.visible").and("contain", ward);
        cy.contains(STERILIZATION.BUTTON, this.sterilization.save).should("be.disabled");
        cy.wrap(randomTextWard).as("selectedWard");
        cy.get(STERILIZATION.ASSET_CATEGORY_FIELD).should("be.visible").click({ force: true });
        cy.get(STERILIZATION.ASSET_CATEGORY_OPTION, { timeout: 5000 })
          .should("be.visible")
          .then(($options) => {
            const randomIndex = Math.floor(Math.random() * $options.length);
            const randomOption = $options[randomIndex];
            const randomTextAsset = randomOption.innerText.trim();
            cy.wrap(randomOption).click({ force: true });
            cy.wrap(randomTextWard).as("selectedAsset");
            cy.get("@selectedAsset").then((asset) => {
              cy.get(STERILIZATION.SELECTED_ASSET).should("not.be.empty").and("contain", asset);
              cy.wrap(randomTextAsset).as("selectedAsset");
              cy.contains(STERILIZATION.BUTTON, this.sterilization.saveButton).should("be.visible").click({ force: true });
              cy.sign();
              cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
              cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.succesMessageReceptionOfDirty);
              cy.verifySignName(this.users.name);
              cy.contains(STERILIZATION.BUTTON, this.sterilization.nextStep).should("be.visible").click({ force: true });

              cy.contains(STERILIZATION.BUTTON, this.sterilization.receptionTab).should("be.visible");
              cy.get(STERILIZATION.P).should("contain.text", randomTextWard);
              cy.get(STERILIZATION.P).should("contain.text", randomTextAsset);
              cy.get(STERILIZATION.EDIT_ICON).should("be.visible");
              cy.get(STERILIZATION.DELETE_ICON).should("be.visible");
              cy.get(STERILIZATION.CHECKBOX_RECEPTION).click({ force: true }).should("be.checked");
              cy.sign();
              cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
              cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessageReception);
              cy.contains(STERILIZATION.BUTTON, this.sterilization.nextStep).should("be.visible").click({ force: true });

              cy.contains(STERILIZATION.BUTTON, this.sterilization.cleaningButton).should("be.visible");
              cy.get(STERILIZATION.SUBSTANCE_FIELD).scrollIntoView().click({ force: true });
              cy.get(STERILIZATION.SUBSTANCE_OPTION, { timeout: 10000 })
                .should("exist")
                .its("length")
                .should("be.gt", 0)
                .then((count) => {
                  const randomIndex = Math.floor(Math.random() * count);
                  cy.get(STERILIZATION.SUBSTANCE_OPTION)
                    .eq(randomIndex)
                    .scrollIntoView()
                    .click({ force: true })
                    .invoke("text")
                    .then((text) => {
                      const randomTextSubstance = text.trim();
                      cy.wrap(randomTextSubstance).as("selectedSubstance");
                    });
                });
              cy.get("@selectedSubstance").then((substance) => {
                cy.get(STERILIZATION.SPAN, { timeout: 10000 })
                  .should("be.visible")
                  .invoke("text")
                  .then((text) => {
                    expect(text.trim()).to.contain(substance);
                  });
                cy.get(STERILIZATION.CONCENTRATION_FIELD).scrollIntoView({ block: "center" }).click({ force: true });
                cy.get('ul[role="listbox"]', { timeout: 10000 })
                  .should("exist")
                  .find('li[role="option"]')
                  .its("length")
                  .should("be.gt", 0)
                  .then((count) => {
                    const randomIndex = Math.floor(Math.random() * count);
                    cy.get('ul[role="listbox"] li[role="option"]')
                      .eq(randomIndex)
                      .scrollIntoView()
                      .invoke("text")
                      .then((text) => {
                        const selectedConcentration = text.trim();
                        cy.wrap(selectedConcentration).as("selectedConcentration");
                        cy.get('ul[role="listbox"] li[role="option"]').eq(randomIndex).click();
                      });
                  });
                cy.get("@selectedConcentration").then((concentration) => {
                  cy.get(STERILIZATION.CONCENTRATION_FIELD).should("have.value", concentration);
                });
                cy.sign();
                cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
                cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessageCleaning);
                cy.contains(STERILIZATION.BUTTON, this.sterilization.nextStep).should("be.visible").click({ force: true });

                cy.contains(STERILIZATION.BUTTON, this.sterilization.disinfectionTab).should("be.visible");
                cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessageCleaning);

                cy.get(STERILIZATION.DISINFECTION_SUBSTANCE_FIELD).scrollIntoView().should("be.visible").click({ force: true });
                cy.get(STERILIZATION.DISINFECTION_SUBSTANCE_OPTION, { timeout: 10000 })
                  .should("exist")
                  .its("length")
                  .should("be.gt", 0)
                  .then((count) => {
                    const randomIndex = Math.floor(Math.random() * count);

                    cy.get(STERILIZATION.DISINFECTION_SUBSTANCE_OPTION)
                      .eq(randomIndex)
                      .scrollIntoView()
                      .click({ force: true })
                      .invoke("text")
                      .then((text) => {
                        const randomTextDisinfectionSubstance = text.trim();
                        cy.wrap(randomTextDisinfectionSubstance).as("selectedDisinfectionSubstance");
                      });
                  });

                cy.get("@selectedDisinfectionSubstance").then((substance) => {
                  cy.get(STERILIZATION.SPAN, { timeout: 10000 })
                    .should("be.visible")
                    .invoke("text")
                    .then((text) => {
                      expect(text.trim()).to.contain(substance);
                    });
                });

                cy.get(STERILIZATION.CONCENTRATION_FIELD).scrollIntoView().click({ force: true });
                cy.get(STERILIZATION.CONCENTRATION_OPTION, { timeout: 10000 })
                  .should("exist")
                  .its("length")
                  .should("be.gt", 0)
                  .then((count) => {
                    const randomIndex = Math.floor(Math.random() * count);

                    cy.get(STERILIZATION.CONCENTRATION_OPTION)
                      .eq(randomIndex)
                      .scrollIntoView()
                      .click({ force: true })
                      .invoke("text")
                      .then((text) => {
                        const randomTextConcentration = text.trim();
                        cy.wrap(randomTextConcentration).as("selectedConcentration");
                      });
                  });

                cy.get("@selectedConcentration").then((concentration) => {
                  cy.get(STERILIZATION.CONCENTRATION_FIELD).should("have.value", concentration);
                });

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
                cy.get(STERILIZATION.MARKER_FIELD).scrollIntoView().should("be.visible").click({ force: true });
                cy.get(STERILIZATION.MARKER_OPTION, { timeout: 10000 })
                  .should("exist")
                  .its("length")
                  .should("be.gt", 0)
                  .then((count) => {
                    const randomIndex = Math.floor(Math.random() * count);
                    cy.get(STERILIZATION.MARKER_OPTION)
                      .eq(randomIndex)
                      .scrollIntoView()
                      .click({ force: true })
                      .invoke("text")
                      .then((text) => {
                        const selectedMarker = text.trim();
                        cy.wrap(selectedMarker).as("selectedMarker");
                      });
                  });
                cy.get("@selectedMarker").then((marker) => {
                  cy.get(STERILIZATION.SELECTED_TEXT_MARKER_FIELD, { timeout: 10000 })
                    .should("be.visible")
                    .invoke("text")
                    .then((text) => {
                      expect(text.trim()).to.contain(marker);
                    });
                });
                cy.sign();
                cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
                cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessagePacking);
                cy.contains(STERILIZATION.BUTTON, this.sterilization.nextStep).should("be.visible").click({ force: true });

                cy.contains(STERILIZATION.BUTTON, this.sterilization.deviceScheduling).should("be.visible");
                cy.get(STERILIZATION.STERILIZATION_DEVICE_SCHEDULING).scrollIntoView().should("be.visible").click({ force: true });

                cy.get(STERILIZATION.STERILIZATION_DEVICE_SCHEDULING_OPTION, { timeout: 10000 })
                  .should("exist")
                  .its("length")
                  .should("be.gt", 0)
                  .then((count) => {
                    const randomIndex = Math.floor(Math.random() * count);

                    cy.get(STERILIZATION.STERILIZATION_DEVICE_SCHEDULING_OPTION)
                      .eq(randomIndex)
                      .scrollIntoView()
                      .click({ force: true })
                      .invoke("text")
                      .then((text) => {
                        const selectedAutoclav = text.trim();
                        cy.wrap(selectedAutoclav).as("selectedAutoclav");
                        cy.get(STERILIZATION.STERILIZATION_DEVICE_SCHEDULING_SELECTED_TEXT, { timeout: 10000 })
                          .should("be.visible")
                          .invoke("text")
                          .then((displayedText) => {
                            expect(displayedText.trim()).to.contain(selectedAutoclav);
                          });
                      });
                  });
                cy.sign();
                cy.contains(STERILIZATION.SPAN, this.sterilization.succesMessage).should("be.visible");
                cy.get(STERILIZATION.DIV).should("be.visible").and("contain.text", this.sterilization.successMessageDeviceScheduling);
                cy.contains(STERILIZATION.BUTTON, this.sterilization.viewSterilizationCycle).should("be.visible").click({ force: true });
                cy.get<string>("@selectedWard").then((wardName) => {
                  cy.contains("span", wardName, { timeout: 10000 }).should("be.visible");
                });

                cy.get<string>("@selectedAutoclav").then((autoclavName) => {
                  cy.get("button", { timeout: 10000 }).should("be.visible").and("contain.text", autoclavName);
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

                cy.get(STERILIZATION.CONFORMITY_RADIO_BUTTON_FALSE).check({ force: false });
                cy.contains(STERILIZATION.BUTTON, this.sterilization.signConformityButton).scrollIntoView().should("be.visible").click({ force: false });
                cy.signCycle();
                cy.get(STERILIZATION.SUCCESS_MESSAGE_MODAL).should("be.visible").and("contain.text", this.sterilization.successMessageSignConformity);
                cy.get(STERILIZATION.ARROW_ICON_BUTTON).click({
                  force: true,
                });
                cy.get<string>("@selectedWard").then((wardName) => {
                  cy.contains("span", wardName).should("be.visible");
                });
                cy.get<string>("@selectedAsset").then((assetName) => {
                  cy.contains("span", assetName).should("be.visible");
                });
              });
              cy.get(STERILIZATION.SPAN, { timeout: 10000 }).should("be.visible").and("contain.text", "Neconform");
            });
          });
      });
    });
});
