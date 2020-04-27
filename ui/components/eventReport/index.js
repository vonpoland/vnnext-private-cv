import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { format } from 'date-fns';
import { CONFIG, TEXTS } from '../../../shared/constants';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { PeopleChecks } from '../../../collections/peopleChecks';

export const EventReport = ({ event }) => {
  const [stats, setStats] = useState({});

  useTracker(() => {
    if (!event) {
      return {};
    }
    Meteor.subscribe('peopleChecks', { eventId: event._id });

    const checks = PeopleChecks.find({
      communityId: event._id,
    }).fetch();

    const checkedInPeople = [];
    const peopleByCompany = {};

    checks.forEach(nextCheck => {
      const previousCheck = checks.find(
        ({ personId, _id }) =>
          _id !== nextCheck._id && nextCheck.personId === personId
      );

      if (previousCheck) {
        checkedInPeople.splice(checkedInPeople.indexOf(previousCheck), 1);
      } else if (nextCheck.companyName) {
        peopleByCompany[nextCheck.companyName] =
          peopleByCompany[nextCheck.companyName]++ || 1;
      }

      if (nextCheck.isCheckedIn) {
        checkedInPeople.push(nextCheck);
      }
    });
    console.info(peopleByCompany, 'xx2222xx');
    setStats({
      ...stats,
      checkedInPeopleCount: checkedInPeople.length,
    });

    Meteor.call('peopleCount', { eventId: event._id }, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      setStats({
        ...stats,
        checkedInPeopleCount: checkedInPeople.length,
        peopleCount: result,
      });
    });
  }, [event && event._id]);

  if (!event) {
    return null;
  }

  return (
    <Paper elevation={3} style={{ padding: 10, marginBottom: 10 }}>
      <Typography>Summary</Typography>
      <Typography>People in the event right now {stats.peopleCount}</Typography>
      <Typography>
        People by company in the event right now: Green Group (10), Hoppe Group
        (5)
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
