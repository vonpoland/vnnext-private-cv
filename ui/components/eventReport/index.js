import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { getCheckedInPeopleForEvent } from '../../../shared/people';
import { PeopleCount } from '../../../collections/people';
import { TEXTS } from '../../../shared/constants';
import { handleEmpty } from '../../format';

export const EventReport = ({ event }) => {
  const [stats, setStats] = useState({ checkedInPeopleByCompany: [] });

  useTracker(() => {
    if (!event) {
      return;
    }

    Meteor.subscribe('peopleChecks', { eventId: event._id });
    Meteor.subscribe('peopleCountSubscribe', { eventId: event._id });

    const {
      checkedInPeopleByCompany,
      checkedInPeople,
    } = getCheckedInPeopleForEvent(event._id);

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
      <Typography variant="h5">{TEXTS.SUMMARY}</Typography>
      <Typography>
        {TEXTS.SUMMARY_PEOPLE_IN_THE_EVENT} {stats.checkedInPeopleCount}
      </Typography>
      <Typography>
        {TEXTS.SUMMARY_PEOPLE_BY_COMPANY}{' '}
        {handleEmpty(TEXTS.NA)(
          stats.checkedInPeopleByCompany
            .map(company => `${company.companyName} (${company.count})`)
            .join(', ')
        )}
      </Typography>
      <Typography>
        {TEXTS.SUMMARY_PEOPLE_NOT_CHECKED_IN}{' '}
        {stats.peopleCount - stats.checkedInPeopleCount}
      </Typography>
    </Paper>
  );
};

EventReport.propTypes = {
  event: PropTypes.object,
};
