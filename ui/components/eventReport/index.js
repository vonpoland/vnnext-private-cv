import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { PeopleChecks } from '../../../collections/peopleChecks';
import { PeopleCount } from '../../../collections/people';

export const EventReport = ({ event }) => {
  const [stats, setStats] = useState({ checkedInPeopleByCompany: [] });

  useTracker(() => {
    if (!event) {
      return;
    }

    Meteor.subscribe('peopleChecks', { eventId: event._id });
    Meteor.subscribe('peopleCountSubscribe', { eventId: event._id });

    const checks = PeopleChecks.find({
      communityId: event._id,
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
    const checkedInPeopleByCompany = checkedInPeople
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

    setStats({
      ...stats,
      checkedInPeopleByCompany,
      checkedInPeopleCount: checkedInPeople.length,
    });

    const peopleCount = PeopleCount.find({ _id: 'peopleCount' }).fetch();

    setStats({
      ...stats,
      checkedInPeopleByCompany,
      checkedInPeopleCount: checkedInPeople.length,
      peopleCount: peopleCount[0] && peopleCount[0].count,
    });
  }, [event && event._id]);

  if (!event) {
    return null;
  }

  return (
    <Paper
      elevation={3}
      style={{ padding: 10, marginBottom: 10, marginTop: 10 }}
    >
      <Typography variant="h5">Summary</Typography>
      <Typography>
        People in the event right now {stats.checkedInPeopleCount}
      </Typography>
      <Typography>
        People by company in the event right now:
        {stats.checkedInPeopleByCompany
          .map(company => `${company.companyName} (${company.count})`)
          .join(', ')}
      </Typography>
      <Typography>
        People not checked-in: {stats.peopleCount - stats.checkedInPeopleCount}
      </Typography>
    </Paper>
  );
};

EventReport.propTypes = {
  event: PropTypes.object,
};
