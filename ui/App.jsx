import React, { useState } from 'react';
import { TEXTS } from '../shared/constants';
import { SelectEvent } from './components/selectEvent';
import { EventPeopleList } from './components/eventPeopleList';
import { EventReport } from './components/eventReport';
import { useTracker } from 'meteor/react-meteor-data';
import { Communities } from '../collections/communities';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';

export const Header = () => <h1>{TEXTS.HOME_TITLE}</h1>;

/**
 * Represents may layout of app.
 * Fetches Communities collection and passes it to Select Event selector.
 *
 * @param {string} seventId
 * @returns {*}
 * @constructor
 */
export const App = ({ eventId = '' }) => {
  const [appReady, setAppReady] = useState(false);
  const { communities } = useTracker(() => {
    const communityHandle = Meteor.subscribe('communities');
    setAppReady(communityHandle.ready());

    return {
      communities: Communities.find().fetch(),
    };
  }, []);
  const options = [
    { label: TEXTS.SELECT_AN_EVENT, value: '' },
    ...communities.map(({ _id, name }) => ({
      label: name,
      value: _id,
    })),
  ];

  const handleEventChange = ({ target: { value } }) => {
    if (value) {
      FlowRouter.go('event', { eventId: value });
      return;
    }

    FlowRouter.go('index');
  };

  const community = communities.find(({ _id }) => _id === eventId);

  if (!appReady) {
    return <LinearProgress variant="query" />;
  }

  return (
    <div>
      <SelectEvent
        options={options}
        selected={eventId}
        onChange={handleEventChange}
      />
      <EventReport event={community} />
      <EventPeopleList event={community} />
    </div>
  );
};

App.propTypes = {
  eventId: PropTypes.string,
};
