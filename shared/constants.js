export const TEXTS = {
  HOME_TITLE: 'Event Check-in',
  IN: 'in',
  OUT: 'out',
  CHECKPREFIX: 'Check-',
  NA: 'N/A',
  SELECT_AN_EVENT: 'Select an event',
  TABLE: {
    name: 'Name',
    companyName: 'Company name',
    title: 'title',
    checkInDate: 'Check-in date',
    checkOutDate: 'Check-out date',
    all: 'All',
  },
  SUMMARY: 'Summary',
  SUMMARY_PEOPLE_IN_THE_EVENT: 'People in the event right now',
  SUMMARY_PEOPLE_BY_COMPANY: 'People by company in the event right now:',
  SUMMARY_PEOPLE_NOT_CHECKED_IN: 'People not checked-in:',
};

export const SEARCHABLE_COLUMNS = [
  'firstName',
  'lastName',
  'title',
  'companyName',
];

export const CONFIG = {
  ALLOW_CHECK_OUT_TIMEOUT: 5000,
  DEBOUNCE_INPUT_TIME: 300,
};
