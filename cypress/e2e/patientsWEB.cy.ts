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
  cy.visit('https://qaone-iocn.dev.evozon.com/')
  cy.get(LOGIN.USER_NAME_LOGIN).should('be.visible').type(Cypress.env('username'))
  cy.get(LOGIN.PASSWORD_LOGIN).should('be.visible').type(Cypress.env('password'))
  cy.get(LOGIN.LOGIN_BUTTON).should('be.visible').click()
})

it.only('Access Patiens section from PDA - Add hospitalization.', function() {
  cy.url().should('include', this.patient.endpointPatientsPageWEB);
  cy.contains(PATIENTS.BUTTON, this.patient.exportPatientsButton).should('be.visible');
  cy.get(PATIENTS.SEARCH_BUTTON).should('be.visible').click();
  cy.get(PATIENTS.SEARCH_BUTTON).type(this.patient.patientNIDnotHospitalized, { timeout: 50000 }).type('{enter}');
  cy.contains(PATIENTS.TD, this.patient.patientNIDnotHospitalized)
    .parent(PATIENTS.TR)
    .find('a[href^="/patients/"]')
    .click();
   cy.wait(500);

    cy.contains(PATIENTS.BUTTON, this.patient.addHospitalizationButton).then(($btn) => {
        const tabIndex = parseInt($btn.attr('tabindex'));
      
        if (tabIndex === -1) {
          cy.log('Pacientul este deja internat');
                    expect($btn).to.have.attr('tabindex', '-1');
          expect($btn).to.have.class('Mui-disabled');
        } else {
          cy.wrap($btn).click();
        }
const randomNumber = Math.floor(100 + Math.random() * 900).toString();

cy.get('input[placeholder="Nr. FO"]').should('be.visible').type(randomNumber);

const todayStartDate = new Date().toISOString().split('T')[0]; 

cy.get('input[name="startDate"]')
  .invoke('val', todayStartDate) 
  .trigger('input')             
  .trigger('change');         

cy.get('input[name="startDate"]').should('have.value', todayStartDate);

const todayEndDate = new Date().toISOString().split('T')[0]; 

cy.get('input[name="endDate"]')
  .invoke('val', todayEndDate)  
  .trigger('input')             
  .trigger('change');         

cy.get('input[name="endDate"]').should('have.value', todayEndDate);

cy.get('.custom-select__control').should('contain', 'Continuă');});

cy.selectselectWardHospitalization();
});
