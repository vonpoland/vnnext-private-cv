import { PeopleChecks } from '../collections/peopleChecks';

/**
 * Get checked in people grouped by company.
 *
 * @param {Array} checkedInPeople
 * @returns {Array}
 */
function getCheckedInPeopleByCompany(checkedInPeople) {
  return checkedInPeople
    .reduce((companyCheckIns, nextCheckIn) => {
      const company = companyCheckIns.find(
        ({ companyName }) => nextCheckIn.companyName === companyName
      );

      if (!company) {
        if (nextCheckIn.companyName) {
          companyCheckIns.push({
            companyName: nextCheckIn.companyName,
            count: 1,
          });
        }
      } else {
        company.count++;
      }

      return companyCheckIns;
    }, [])
    .sort((a, b) => (a.count > b.count ? -1 : 1));
}

/**
 * Get checked in people for event.
 * Get checked in people for event grouped by company.
 *
 * @param {string} eventId
 * @returns {{checkedInPeople: Array, checkedInPeopleByCompany: Array}}
 */
export function getCheckedInPeopleForEvent(eventId) {
  const checks = PeopleChecks.find({
    communityId: eventId,
  }).fetch();

  const checkedInPeople = checks.reduce((allChecks, nextCheck) => {
    const previousCheck = allChecks.find(
      ({ personId, _id }) =>
        _id !== nextCheck._id && nextCheck.personId === personId
    );

    if (previousCheck) {
      allChecks.splice(allChecks.indexOf(previousCheck), 1);
    }

    if (nextCheck.isCheckedIn) {
      allChecks.push(nextCheck);
    }

    return allChecks;
  }, []);

  return {
    checkedInPeople,
    checkedInPeopleByCompany: getCheckedInPeopleByCompany(checkedInPeople),
  };
}
