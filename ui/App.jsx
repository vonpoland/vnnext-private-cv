import React, { useEffect } from 'react';
import { TEXTS } from '../shared/constants';
import { SelectEvent } from './components/selectEvent';
import { EventPeopleList } from './components/eventPeopleList';
import { useTracker } from 'meteor/react-meteor-data';
import { Communities } from '/collections/communities';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import PropTypes from 'prop-types';

export const App = ({ eventId = '' }) => {
  useEffect(() => {
    Meteor.subscribe('communities');
  }, []);
  const { communities } = useTracker(() => {
    console.info('commnunites tracker')
    return {
      communities: Communities.find().fetch(),
    };
  }, []);
  const options = [
    { label: 'Select an event', value: '' },
    ...communities.map(({ _id, name }) => ({
      label: name,
      value: _id,
    })),
  ];

  const handleEventChange = ({ target: { value } }) => {
    if(value) {
      FlowRouter.go('event', { eventId: value });
      return;
    }

    FlowRouter.go('index');
  };

  return <div>
    <h1>{TEXTS.HOME_TITLE}</h1>
    <form>
      <SelectEvent options={options} selected={eventId} onChange={handleEventChange}/>
      <EventPeopleList event={communities.find(({_id}) => _id === eventId)}/>
    </form>
  </div>;
};

App.propTypes = {
  eventId: PropTypes.string
}
