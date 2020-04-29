import React from 'react';
import { Header } from '../ui/App';
import { render } from 'react-dom';

require('./router');

Meteor.startup(() => {
  // This could be removed and put inside App.jsx but I left it here so test will see H1 component immediately.
  render(<Header />, document.getElementById('app'));
});
