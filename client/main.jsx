import React from 'react';
import { Header, App } from '../ui/App';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { mount } from 'react-mounter';
import { render } from 'react-dom';

Meteor.startup(() => {
  // This could be removed and put inside App.jsx but I left it here so test will see H1 component immediately.
  render(<Header />, document.getElementById('app'));
});

FlowRouter.route('/', {
  name: 'index',
  action() {
    mount(App);
  },
});

FlowRouter.route('/event/:eventId', {
  name: 'event',
  action(params) {
    mount(App, params);
  },
});

FlowRouter.route('*', {
  name: 'default',
  action() {
    FlowRouter.go('index');
  },
});
