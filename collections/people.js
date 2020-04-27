import { Mongo } from 'meteor/mongo';
import { SEARCHABLE_COLUMNS } from '../shared/constants';

export const People = new Mongo.Collection('people');

if (Meteor.isServer) {
  Meteor.publish('people', ({ eventId, limit, skip, search }) => {
    return People.find(
      {
        communityId: eventId,
        $or: SEARCHABLE_COLUMNS.map(column => ({
          [column]: { $regex: new RegExp(search, 'i') },
        })),
      },
      { limit, skip }
    );
  });

  Meteor.methods({
    peopleCount: ({ eventId }) => People.find({ communityId: eventId }).count(),
  });
}
