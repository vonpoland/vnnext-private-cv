import React, { useEffect, useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { People, PeopleCount } from '../../../collections/people';
import { PeopleChecks } from '../../../collections/peopleChecks';
import { Meteor } from 'meteor/meteor';
import { CONFIG, TEXTS } from '../../../shared/constants';
import debounce from 'lodash.debounce';
import { EventPerson } from '../eventPerson';
import PropTypes from 'prop-types';

import {
  formatCompanyName,
  formatCheckInDate,
  formatCheckOutDate,
  formatTitle,
  handleEmpty,
} from '../../format';

// ui stuff
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';

/**
 * Get check info. It reverts check array .
 * @param {peopleChecks} array
 * @param {string} personId
 * @returns {null|*} Checks are reversed so first one is the latest.
 */
function getUserChecks({ peopleChecks, personId }) {
  if (!Array.isArray(peopleChecks)) {
    return null;
  }

  return peopleChecks
    .slice()
    .reverse()
    .filter(person => person.personId === personId);
}

/**
 * Displays table with people registered for the event.
 * Can search people [firstName, lastname, companyName], pagination.
 *
 * @param {object} event
 * @returns {null|*}
 *
 * @constructor
 */
export const EventPeopleList = ({ event } = {}) => {
  const eventId = event && event._id;
  const [pagination, setPagination] = useState({
    total: 0,
    pageSize: 5,
    search: '',
    page: 0,
  });

  const { people, peopleChecks, totalCount } = useTracker(() => {
    if (!eventId) {
      return {};
    }

    const skip = pagination.pageSize * pagination.page;

    Meteor.subscribe('people', {
      eventId,
      limit: pagination.pageSize === -1 ? undefined : pagination.pageSize,
      search: pagination.search,
      skip,
    });

    Meteor.subscribe('peopleChecks', { eventId });
    Meteor.subscribe('peopleCountSubscribe', { eventId });
    const peopleCount = PeopleCount.find({ _id: 'peopleCount' }).fetch();

    return {
      totalCount: peopleCount[0] && peopleCount[0].count,
      peopleChecks: PeopleChecks.find({ communityId: event._id }).fetch(),
      people: People.find(
        { communityId: event._id },
        // Skip is not needed here as this operation is performed on server side.
        { limit: pagination.pageSize === -1 ? undefined : pagination.pageSize }
      ).fetch(),
    };
  }, [eventId, pagination]);

  useEffect(
    () => {
      setPagination({
        ...pagination,
        total: totalCount || 0,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalCount]
  );

  const onPaginationChange = query => {
    if (
      query.pageSize !== pagination.pageSize ||
      query.page !== pagination.page ||
      query.search !== pagination.search
    ) {
      setPagination({
        ...pagination,
        pageSize: query.pageSize,
        page: query.page,
        search: query.search,
      });
    }
  };

  const onSearchChange = debounce(
    search => onPaginationChange({ ...pagination, search }),
    CONFIG.DEBOUNCE_INPUT_TIME
  );

  if (!event) {
    return null;
  }
  const columns = [
    {
      title: TEXTS.TABLE.name,
      field: 'name',
      render: person => <EventPerson {...person} />,
    },
    { title: TEXTS.TABLE.companyName, field: 'companyDisplayName' },
    { title: TEXTS.TABLE.title, field: 'title' },
    { title: TEXTS.TABLE.checkInDate, field: 'checkIn' },
    { title: TEXTS.TABLE.checkOutDate, field: 'checkOut' },
  ];

  const tableData = people.map(person => {
    const checkInfos = getUserChecks({
      peopleChecks,
      personId: person._id,
    });

    const isUserCheckedIn = !!(
      checkInfos &&
      checkInfos.length > 0 &&
      checkInfos[0].isCheckedIn
    );

    return {
      id: person._id,
      key: person._id + checkInfos._id,
      communityId: person.communityId,
      checkInfo: checkInfos && checkInfos[0],
      firstName: person.firstName,
      lastName: person.lastName,
      isCheckedIn: isUserCheckedIn,
      companyName: person.companyName,
      companyDisplayName: handleEmpty(TEXTS.NA)(formatCompanyName(person)),
      title: handleEmpty(TEXTS.NA)(formatTitle(person)),
      checkIn: handleEmpty(TEXTS.NA)(formatCheckInDate(checkInfos)),
      checkOut: handleEmpty(TEXTS.NA)(formatCheckOutDate(checkInfos)),
    };
  });

  return (
    <Paper elevation={3}>
      <Grid
        container
        display="row"
        justify="space-between"
        alignItems="center"
        style={{ padding: 10 }}
      >
        <Typography variant="h5">{event.name}</Typography>
        <form onSubmit={e => e.preventDefault()} noValidate autoComplete="off">
          <TextField
            label="Search"
            onChange={({ target }) => onSearchChange(target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
        </form>
      </Grid>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell key={column.field}>{column.title}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map(row => (
              <TableRow key={row.key}>
                {columns.map(column => (
                  <TableCell key={column.field}>
                    {!column.render && row[column.field]}
                    {column.render && column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                onChangePage={(_event, page) =>
                  onPaginationChange({
                    ...pagination,
                    page,
                  })
                }
                onChangeRowsPerPage={({ target }) =>
                  onPaginationChange({
                    ...pagination,
                    page: 0,
                    pageSize: target.value,
                  })
                }
                count={pagination.total}
                rowsPerPage={pagination.pageSize}
                page={pagination.page}
                rowsPerPageOptions={[
                  5,
                  20,
                  50,
                  100,
                  { label: TEXTS.TABLE.all, value: -1 },
                ]}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Paper>
  );
};

EventPeopleList.propTypes = {
  event: PropTypes.object,
};
