import { Mongo } from 'meteor/mongo';
import { SEARCHABLE_COLUMNS } from '../shared/constants';

export const People = new Mongo.Collection('people');

// eslint-disable-next-line no-undef
export const PeopleCount = Counts;

if (Meteor.isServer) {
  Meteor.publish('people', ({ eventId, limit, skip, search }) =>
    People.find(
      {
        communityId: eventId,
        $or: SEARCHABLE_COLUMNS.map(column => ({
          [column]: { $regex: new RegExp(search, 'i') },
        })),
      },
      { limit, skip }
    )
  );

  Meteor.publish('peopleCountSubscribe', function publishPeopleCount({
    eventId,
  }) {
    PeopleCount.publish(
      this,
      'peopleCount',
      People.find({ communityId: eventId })
    );
  });

  Meteor.methods({
    peopleCount: ({ eventId }) => People.find({ communityId: eventId }).count(),
    /**
     * This is not need as I misunderstood requirements.
     * The 'People by company in the event right now' requirement means checked-in people grouped by company.
     * However I initially thought that we need to group any people by company. But leaving this code for reference.
     * @param {string} eventId
     * @returns {Promise<*>}
     */
    peopleByCompany: async ({ eventId }) => {
      const rawPeople = People.rawCollection();

      return rawPeople
        .aggregate([
          {
            $match: { communityId: eventId, companyName: { $exists: true } },
          },
          {
            $group: {
              _id: '$companyName',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 },
          },
        ])
        .toArray();
    },
  });
}
