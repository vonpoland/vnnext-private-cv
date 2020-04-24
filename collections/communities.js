import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const Communities = new Mongo.Collection('communities');

if (Meteor.isServer) {
  Meteor.publish('communities', () => Communities.find());
}

Meteor.methods({
  'communities.toggleCheckPerson'({ communityId, personId, checkIn }) {
    check(communityId, String);
    check(personId, String);


    // If we would like keep check data like
    // {personId, checkInDate, checkOutDate}
    // this should be doable with 'positnional-all' operator with one operation
    // but mini mongo doesn't support it
    // https://docs.mongodb.com/manual/reference/operator/update/positional-all/
    // Communities.update({
    //   _id: communityId, checks: [{ personId }],
    // }, {
    //   $set: {
    //     'checks.$[]': {
    //       personId,
    //       checkInDate: Date.now(),
    //     },
    //   },
    // }, {
    //   upsert: true,
    // });

    // However I think better idea is to push each record as new array item so keep track of
    // all user check in/out in the past
    Communities.update({
      _id: communityId,
    }, {
      $push: {
        'checks': {
          personId,
          isCheckedIn: checkIn,
          date: Date.now(),
        },
      },
    }, {
      upsert: true,
    });
  },
});

