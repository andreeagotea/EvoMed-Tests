/// <reference types="cypress" />
import {LOGIN} from "../support/testids/login"
import { DASHBOARD } from "../support/testids/dashboard"
import { PATIENTS } from "../support/testids/patients"

beforeEach(() => {
  cy.fixture('patientPage').as('patient');
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
  cy.get(PATIENTS.ENTER_NID_INPUT).should('be.visible').should('have.attr', 'placeholder', this.patient.enterNIDPlaceholder).click().clear().type(this.patient.patientNID)
  cy.get(PATIENTS.SEARCH_NID_BUTTON).should('be.visible').and('have.text',this.patient.searchNIDButton).click()
  cy.contains(PATIENTS.SPAN, this.patient.patientNotHospitalizedText).should('be.visible')
})