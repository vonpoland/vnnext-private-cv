import React, { useEffect, useMemo, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { CONFIG, TEXTS } from '../../../shared/constants';
import { formatName } from '../../format';

import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';

/**
 * Insert person check in.
 *
 * @param {Object} person
 */
function insertPersonCheck(person) {
  const { communityId, id, isCheckedIn } = person;

  Meteor.call('peopleChecks.insertUserCheck', {
    communityId,
    personId: id,
    companyName: person.companyName,
    checkIn: !isCheckedIn,
  });
}

// Handle person check in/out button.
export const EventPerson = person => {
  const isPersonCheckedIn = person.isCheckedIn;
  const name = formatName(person);
  const variant = isPersonCheckedIn ? 'contained' : 'outlined';
  const checkType = isPersonCheckedIn ? TEXTS.OUT : TEXTS.IN;
  const allowedToCheckOut =
    isPersonCheckedIn &&
    person.checkInfo.date + CONFIG.ALLOW_CHECK_OUT_TIMEOUT < Date.now();
  const [canCheckout, setCheckout] = useState(allowedToCheckOut);

  useEffect(() => {
    if (isPersonCheckedIn && !allowedToCheckOut) {
      setCheckout(false);
      setTimeout(() => setCheckout(true), CONFIG.ALLOW_CHECK_OUT_TIMEOUT);
    }
  }, [isPersonCheckedIn, allowedToCheckOut]);

  const prefixText =
    canCheckout || !isPersonCheckedIn
      ? `${TEXTS.CHECKPREFIX}${checkType} `
      : '';
  const buttonText = `${prefixText}${name}`;
  const deps = [
    variant,
    buttonText,
    name,
    canCheckout,
    isPersonCheckedIn,
    person._id,
    person.checkInfo && person.checkInfo._id,
  ];
  // Memoize button so it doesn't do necessary renders.
  // However mini-mongo loads items in chunks so it might be nice to investigate material-ui table
  // and useMemo for each row.
  return useMemo(
    () => (
      <Button
        disabled={isPersonCheckedIn && !canCheckout}
        onClick={() => insertPersonCheck(person)}
        style={{ textTransform: 'none' }}
        color="primary"
        variant={variant}
      >
        {buttonText}
      </Button>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deps]
  );
};

EventPerson.propTypes = {
  person: PropTypes.object,
};
