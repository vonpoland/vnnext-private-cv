import { format } from 'date-fns';

/** Format display data * */

export function formatName({ firstName, lastName }) {
  return `${firstName} ${lastName}`;
}

export function formatCompanyName({ companyName }) {
  return companyName;
}

export function formatDate(date) {
  return format(new Date(date), 'MM/dd/yyyy');
}

export function formatCheckInDate(checkInfo = []) {
  const lastCheckIn =
    checkInfo && checkInfo.find(({ isCheckedIn }) => isCheckedIn);

  return lastCheckIn && formatDate(lastCheckIn.date);
}

export function formatCheckOutDate(checkInfo = []) {
  const lastCheckOut =
    checkInfo && checkInfo.find(({ isCheckedIn }) => !isCheckedIn);

  return lastCheckOut && formatDate(lastCheckOut.date);
}

export function formatTitle({ title }) {
  return title;
}

export function handleEmpty(emptyText) {
  return text => text || emptyText;
}
