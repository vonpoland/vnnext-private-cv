import { TEXTS } from '../../shared/constants';

describe('Home', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  context('Check integrity', () => {
    it('h1 is correct', () => {
      cy.queryByText(TEXTS.HOME_TITLE).should('exist');
    });
  });

  context('Check user check in', () => {
    it('should check in user', () => {
      cy.get('.MuiSelect-root').click();
      cy.get('.MuiListItem-root:nth-child(2)').click();
      cy.queryByText(TEXTS.SUMMARY).should('exist');
      cy.get('.MuiTableRow-root:nth-child(2) button').click();
    });
  });
});
