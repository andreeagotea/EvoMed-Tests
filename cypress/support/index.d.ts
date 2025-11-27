declare namespace Cypress {
  interface Chainable {
    loginViaUI(email: string, password: string): Chainable<void>;
    createNewTransaction(
      amount: string,
      note: string,
      input: string,
      endpointNewTransaction: string
    ): Chainable<void>;
    loginByAPI(username?: string, password?: string): Chainable<any>;
    authenticatedRequest(
      options: Partial<Cypress.RequestOptions>
    ): Chainable<Cypress.Response<any>>;
    apiUrl(endpoint: string): Chainable<string>;
    visitWithSession(url?: string): Chainable<void>;
    sign(): Chainable<void>;
    signCycle(): Chainable<void>;
    verifySignName(name: string): Chainable<void>;
  }
}
