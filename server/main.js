import { Meteor } from 'meteor/meteor';
import { loadInitialData } from './initial-data';
import peopleChecks from '../collections/peopleChecks';

Meteor.startup(() => {
  // DON'T CHANGE THE NEXT LINE
  loadInitialData();

  // YOU CAN DO WHATEVER YOU WANT HERE
});
