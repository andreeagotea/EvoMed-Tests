/// <reference types="cypress" />
import {LOGIN} from "../support/testids/login"
import { DASHBOARD } from "../support/testids/dashboard"
import { ACCOUNT_CARD_DETAILS } from "../support/testids/accountCardDetails";

beforeEach(() => {
  cy.fixture('patientPage').as('patient');
  cy.fixture('loginPage').as('login');
  cy.fixture('accountCardDetailsPage').as('accountCardDetails');
  cy.visit('https://qaintegrat-iocn.dev.evozon.com/')
  cy.get(LOGIN.USER_NAME_LOGIN).should('be.visible').type(Cypress.env('username'))
  cy.get(LOGIN.PASSWORD_LOGIN).should('be.visible').type(Cypress.env('password'))
  cy.get(LOGIN.LOGIN_BUTTON).should('be.visible').click()
})

it('Logout', function() {
  cy.get(DASHBOARD.ACCOUNT_ICON).should('be.visible').click()
  cy.contains(ACCOUNT_CARD_DETAILS.p, this.accountCardDetails.changePassword).should('be.visible')
  cy.contains(ACCOUNT_CARD_DETAILS.button, this.accountCardDetails.logOut).should('be.visible').click()
  cy.url().should('include', this.login.endpointLoginPage);
  cy.get(LOGIN.FORM_LOGIN).should('be.visible')
})