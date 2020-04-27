import React, { useEffect, useMemo, useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { People, PeopleCount } from '../../../collections/people';
import { PeopleChecks } from '../../../collections/peopleChecks';
import { Meteor } from 'meteor/meteor';
import { format } from 'date-fns';
import { CONFIG, TEXTS } from '../../../shared/constants';
import debounce from 'lodash.debounce';

// ui stuff
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';

/** Format display data * */

function formatName({ firstName, lastName }) {
  return `${firstName} ${lastName}`;
}

function formatCompanyName({ companyName }) {
  return companyName;
}

function formatDate(date) {
  return format(new Date(date), 'MM/dd/yyyy');
}

function formatCheckInDate(checkInfo = []) {
  const lastCheckIn =
    checkInfo && checkInfo.find(({ isCheckedIn }) => isCheckedIn);

  return lastCheckIn && formatDate(lastCheckIn.date);
}

function formatCheckOutDate(checkInfo = []) {
  const lastCheckOut =
    checkInfo && checkInfo.find(({ isCheckedIn }) => !isCheckedIn);

  return lastCheckOut && formatDate(lastCheckOut.date);
}

function formatTitle({ title }) {
  return title;
}

function handleEmpty(emptyText) {
  return text => text || emptyText;
}

// update person
function toggleCheckIn(person) {
  const { communityId, id, isCheckedIn } = person;

  // person.isDirty = true;
  Meteor.call('peopleChecks.insertUserCheck', {
    communityId,
    personId: id,
    companyName: person.companyName,
    checkIn: !isCheckedIn,
  });
}

// Handle person check in/out button.
const PersonItem = person => {
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
  // However minimongo loads items in chunks so it might be nice to investigate material-ui table
  // and useMemo for each row.
  return useMemo(
    () => (
      <Button
        disabled={isPersonCheckedIn && !canCheckout}
        onClick={() => toggleCheckIn(person)}
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
      render: person => <PersonItem {...person} />,
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
