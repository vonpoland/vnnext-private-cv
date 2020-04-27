import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { CONFIG } from '../shared/constants';

export const Communities = new Mongo.Collection('communities');

if (Meteor.isServer) {
  Meteor.publish('communities', () => Communities.find());
}

Meteor.methods({
  'communities.toggleCheckPerson': ({ communityId, personId, checkIn }) => {
    check(communityId, String);
    check(personId, String);
    check(checkIn, Boolean);

    if (!checkIn) {
      const community = Communities.findOne({
        _id: communityId,
      });

      const lastUserCheck = community.checks
        .reverse()
        .find(userCheck => personId === userCheck.personId);
      if (
        lastUserCheck.isCheckedIn &&
        lastUserCheck.date > Date.now() - CONFIG.ALLOW_CHECK_OUT_TIMEOUT
      ) {
        throw new Error('Cannot checkout person right now');
      }
    }

    // However I think better idea is to push each record as new array item so keep track of
    // user check in/out in the past
    Communities.update(
      {
        _id: communityId,
      },
      {
        $push: {
          checks: {
            personId,
            isCheckedIn: checkIn,
            date: Date.now(),
          },
        },
      },
      {
        upsert: true,
      }
    );
  },
});
