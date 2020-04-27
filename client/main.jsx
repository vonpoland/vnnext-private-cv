import { App } from '../ui/App';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { mount } from 'react-mounter';

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
