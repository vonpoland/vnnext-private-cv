import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

/**
 * React selectEvent wrapper.
 * Returns native selectEvent component with options elements.
 *
 * @param onChange {function}
 * @param options {array}
 * @param selected {string}
 *
 * @returns {*}
 * @constructor
 */
export const SelectEvent = ({ onChange, options, selected }) => {
  let selectedValue = selected;

  if (!options.map(({ value }) => value).includes(selected)) {
    selectedValue = '';
  }
  return (
    <form>
      <Select onChange={onChange} value={selectedValue} displayEmpty>
        {options.map(({ value, label }) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </form>
  );
};

SelectEvent.propTypes = {
  selected: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
};
