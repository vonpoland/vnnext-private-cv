import { TEXTS } from '../../shared/constants';

describe('Event', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  context('Event list page', () => {
    it('should verify event list page', () => {
      cy.get('.MuiSelect-root').click();
      cy.get('.MuiListItem-root:nth-child(2)').click();
      cy.queryByText(TEXTS.SUMMARY).should('exist');

      cy.get('.MuiTableRow-root:nth-child(1) button').should('exist');
      cy.get('#searchEventInput').should('exist');
    });
  });
});
