import { Mongo } from 'meteor/mongo';

export const People = new Mongo.Collection('people');

if (Meteor.isServer) {
  Meteor.publish('people', () => People.find());
}
