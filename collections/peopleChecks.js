import { Mongo } from 'meteor/mongo';
import { CONFIG } from '../shared/constants';
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
  'peopleChecks.eventStats': ({ eventId }) => {
    console.info(eventId);

    return eventId;
  },
  'peopleChecks.insertUserCheck': ({
    communityId,
    personId,
    checkIn,
    companyName,
  }) => {
    check(communityId, String);
    check(personId, String);
    check(checkIn, Boolean);

    // if (!checkIn) {
    //   const userCheckIn = PeopleChecks.findOne(
    //     {
    //       communityId,
    //       personId,
    //     },
    //     {
    //       sort: { date: -1 },
    //     }
    //   );
    //
    //   if (
    //     userCheckIn.isCheckedIn &&
    //     userCheckIn.date > Date.now() - CONFIG.ALLOW_CHECK_OUT_TIMEOUT
    //   ) {
    //     throw new Error('Cannot checkout person right now');
    //   }
    // }

    PeopleChecks.insert({
      communityId,
      personId,
      companyName,
      isCheckedIn: checkIn,
      date: Date.now(),
    });
  },
});
