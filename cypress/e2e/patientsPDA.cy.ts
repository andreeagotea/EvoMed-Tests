/// <reference types="cypress" />
import {LOGIN} from "../support/testids/login"
import { DASHBOARD } from "../support/testids/dashboard"
import { PATIENTS } from "../support/testids/patients"
import { STERILIZATION } from "../support/testids/sterilization";
import { USERS } from "../support/testids/users";

beforeEach(() => {
  cy.fixture('patientPage').as('patient');
  cy.fixture('sterilizationPage').as('sterilization');
  cy.fixture('usersPage').as('users');
  cy.visit('https://qaintegrat-iocn.dev.evozon.com/')
  cy.viewport(350, 650)
  cy.get(LOGIN.USER_NAME_LOGIN).should('be.visible').type(Cypress.env('username'))
  cy.get(LOGIN.PASSWORD_LOGIN).should('be.visible').type(Cypress.env('password'))
  cy.get(LOGIN.LOGIN_BUTTON).should('be.visible').click()
})

it('Access Patiens section from PDA - The patient is not hospitalized.', function() {
  cy.url().should('include', this.patient.endpointDashboardPage);
  cy.get(DASHBOARD.TRANSLATE_ICON).should('be.visible')
  cy.get(DASHBOARD.ACCOUNT_ICON).should('be.visible')
  cy.get(DASHBOARD.PATIENTS_AVATAR_IMAGE).should('be.visible').click()
  cy.get(PATIENTS.SCANNER_ICON).should('be.visible')
  cy.contains(PATIENTS.p, this.patient.scanNIDText).should('be.visible')
  cy.url().should('include', this.patient.endpointPatientsPage);
  cy.get(PATIENTS.SEARCH_NID_BUTTON).should('be.visible').should('be.disabled').and('have.text',this.patient.searchNIDButton)
  cy.get(PATIENTS.ENTER_NID_INPUT).should('be.visible').should('have.attr', 'placeholder', this.patient.enterNIDPlaceholder).click()
  cy.get(PATIENTS.ENTER_NID_INPUT).clear()
  cy.get(PATIENTS.ENTER_NID_INPUT).type(this.patient.patientNIDnotHospitalized)
  cy.get(PATIENTS.SEARCH_NID_BUTTON).should('be.visible').and('have.text',this.patient.searchNIDButton).click()
  cy.contains(PATIENTS.SPAN, this.patient.patientNotHospitalizedText).should('be.visible')
})

it('Access Patients section from PDA - The patient is hospitalized - add activity', function () {
  cy.url().should('include', this.patient.endpointDashboardPage)
  cy.get(DASHBOARD.TRANSLATE_ICON).should('be.visible')
  cy.get(DASHBOARD.ACCOUNT_ICON).should('be.visible')
  cy.get(DASHBOARD.PATIENTS_AVATAR_IMAGE).should('be.visible').click()
  cy.get(PATIENTS.SCANNER_ICON).should('be.visible')
  cy.contains(PATIENTS.p, this.patient.scanNIDText).should('be.visible')
  cy.url().should('include', this.patient.endpointPatientsPage)
  cy.get(PATIENTS.SEARCH_NID_BUTTON).should('be.visible').should('be.disabled').and('have.text', this.patient.searchNIDButton)
  cy.get(PATIENTS.ENTER_NID_INPUT).should('be.visible').clear().type(this.patient.patientNIDhospitalized)
  cy.get(PATIENTS.SEARCH_NID_BUTTON).should('be.visible').click()
  cy.get('span.MuiTypography-caption', { timeout: 10000 }).invoke('text')
    .then(text => {
      const match = text.match(/NID:\s*(\d+)/)
      expect(match?.[1]).to.eq(this.patient.patientNIDhospitalized)
    })
  cy.get(PATIENTS.VACCIN_ICON).should('be.visible').first().click()

  const excludeOptions = [
    'Operatiuni medicale preoperatorii',
    'ustensile folosite',
    'Materiale folosite'
  ]

  cy.get(PATIENTS.DROPDOWN_PERFORM_PROCEDURE).filter(':visible').first().click()
  cy.get(PATIENTS.DROPDOWN_PERFORM_PROCEDURE_OPTION).then($options => {

    const validOptions = Cypress._.filter(
      $options,
      el => !excludeOptions.includes(el.innerText.trim())
    )

    if (!validOptions.length) {
      throw new Error('Nu există opțiuni valide')
    }

    const randomIndex = Math.floor(Math.random() * validOptions.length)
    const selectedText = validOptions[randomIndex].innerText.trim()

    cy.wrap<string>(selectedText).as('firstDropdownSelection')
    cy.wrap(validOptions[randomIndex]).click()
  })

  cy.get('input.MuiAutocomplete-input:visible', { timeout: 5000 }).should('exist').click()
  cy.get('.MuiAutocomplete-popper .MuiAutocomplete-option:visible').then($options => {

    if (!$options.length) {
      throw new Error('Nu există opțiuni autocomplete')
    }

    const randomIndex = Math.floor(Math.random() * $options.length)
    const selectedText = $options[randomIndex].innerText.trim()

    cy.wrap<string>(selectedText).as('autocompleteSelection')
    cy.wrap($options[randomIndex]).click() })

  cy.contains(STERILIZATION.BUTTON, this.sterilization.saveButton).should('be.visible').click()
  cy.sign()
  cy.get<string>('@firstDropdownSelection').then(firstSelection => {
  cy.contains('span', firstSelection).should('be.visible')})
  cy.get<string>('@autocompleteSelection').then(autoSelection => {
  cy.contains('div', autoSelection).should('be.visible')
  })
})


it.only('Access Patients section from PDA - The patient is hospitalized - add medical tool', function () {
  cy.url().should('include', this.patient.endpointDashboardPage);
  cy.get(DASHBOARD.PATIENTS_AVATAR_IMAGE).should('be.visible').click();
  cy.get(PATIENTS.ENTER_NID_INPUT).should('be.visible').clear().type(this.patient.patientNIDhospitalized);
  cy.get(PATIENTS.SEARCH_NID_BUTTON).should('be.visible').click();
  cy.get(PATIENTS.VACCIN_ICON).should('be.visible').first().click();
  cy.get(PATIENTS.DROPDOWN_PERFORM_PROCEDURE).filter(':visible').first().click();
  cy.get(PATIENTS.DROPDOWN_PERFORM_PROCEDURE_USED_MEDICAL_TOOL, { timeout: 10000 }).scrollIntoView().click();
  cy.get(PATIENTS.BARCODE_INPUT).should('be.visible').type(this.patient.medicalToolSterile);
  cy.contains(PATIENTS.BUTTON, this.patient.searchButton).should('be.visible').click();
  cy.get('body').should(($body) => {

    const errorVisible = $body.text().includes('Ustensila nu este sterilă');
    const signBtn = $body.find(`button:contains("${this.users.signButton}")`);
    const btnActive = signBtn.length > 0 && !signBtn.prop('disabled');
    expect(errorVisible || btnActive, "Așteptare validare instrument (eroare sau buton activ)").to.be.true;
    
  }).then(() => {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Ustensila nu este sterilă')) {
        cy.log('Instrumentul este nesteril - Testul se oprește aici.');
        cy.contains(STERILIZATION.BUTTON, this.users.signButton).should('be.disabled');
      } else {
        cy.log('Instrumentul este steril - Continuam procesul de semnare.');
        cy.sign(); 
      }
    });
  });
});