import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

/**
 * Add new collection which holds user check in dates.
 *
 * @type {Mongo.Collection}
 */
export const PeopleChecks = new Mongo.Collection('peopleChecks');

if (Meteor.isServer) {
  Meteor.publish('peopleChecks', ({ eventId }) =>
    PeopleChecks.find({
      communityId: eventId,
    })
  );
}

Meteor.methods({
  /**
   * Insert user checkIn/Out data.
   *
   * @param {string} communityId
   * @param {string} personId
   * @param {boolean} checkIn
   * @param {string} companyName
   */
  'peopleChecks.insertUserCheck': ({
    communityId,
    personId,
    checkIn,
    companyName,
  }) => {
    check(communityId, String);
    check(personId, String);
    check(checkIn, Boolean);

    PeopleChecks.insert({
      communityId,
      personId,
      companyName,
      isCheckedIn: checkIn,
      date: Date.now(),
    });
  },
});
