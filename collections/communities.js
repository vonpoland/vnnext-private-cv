import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const Communities = new Mongo.Collection('communities');

if (Meteor.isServer) {
  Meteor.publish('communities', () => Communities.find());
}
