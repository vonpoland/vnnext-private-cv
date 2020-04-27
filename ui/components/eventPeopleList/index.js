import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { People } from '../../../collections/people';
import { PeopleChecks } from '../../../collections/peopleChecks';
import { Meteor } from 'meteor/meteor';
import { format } from 'date-fns';
import { CONFIG, TEXTS } from '../../../shared/constants';

// ui stuff
import MaterialTable from 'material-table';
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import Button from '@material-ui/core/Button';

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

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

function formatCheckInDate(checkInfo = [], isUserCheckedIn) {
  if (!isUserCheckedIn) {
    return TEXTS.NA;
  }

  const lastCheckIn =
    checkInfo && checkInfo.find(({ isCheckedIn }) => isCheckedIn);

  return lastCheckIn && formatDate(lastCheckIn.date);
}

function formatCheckOutDate(checkInfo = [], isUserCheckedIn) {
  if (isUserCheckedIn) {
    return TEXTS.NA;
  }

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
  //const canCheckout = allowedToCheckOut;
  person.firstName === 'Connie' &&
    console.info('settt', allowedToCheckOut, isPersonCheckedIn);
  const [canCheckout, setCheckout] = useState(allowedToCheckOut);
  person.firstName === 'Connie' &&
    console.info('GOTTT', canCheckout, isPersonCheckedIn && !canCheckout);
  // if (person.firstName === 'Connie') {
  //   console.info(
  //     allowedToCheckOut,
  //     canCheckout,
  //     person.checkInfo.date + CONFIG.ALLOW_CHECK_OUT_TIMEOUT < Date.now()
  //   );
  // }

  const id = person._id + person.checkInfo && person.checkInfo._id;

  useEffect(() => {
    if (isPersonCheckedIn && !allowedToCheckOut) {
      //setCheckout(false);
      //setTimeout(() => setCheckout(true), CONFIG.ALLOW_CHECK_OUT_TIMEOUT);
    }
  }, [isPersonCheckedIn, allowedToCheckOut]);

  const prefixText = canCheckout ? `${TEXTS.CHECKPREFIX}${checkType} ` : '';
  const buttonText = `${prefixText}${name}`;
  return (
    <Button
      key={id}
      disabled={isPersonCheckedIn && !canCheckout}
      onClick={() => toggleCheckIn(person)}
      style={{ textTransform: 'none' }}
      color="primary"
      variant={variant}
    >
      {buttonText}
    </Button>
  );
  // Memoize button so it doesn't do necessary renders.
  // However minimongo loads items in chunks so it might be nice to investigate material-ui table
  // and useMemo for each row.
  // return useMemo(
  //   () => (
  //     <Button
  //       disabled={isPersonCheckedIn && !canCheckout}
  //       onClick={() => toggleCheckIn(person)}
  //       style={{ textTransform: 'none' }}
  //       color="primary"
  //       variant={variant}
  //     >
  //       {buttonText}
  //     </Button>
  //   ),
  //   [
  //     variant,
  //     buttonText,
  //     name,
  //     canCheckout,
  //     isPersonCheckedIn,
  //     person._id,
  //     person.checkInfo && person.checkInfo._id,
  //   ]
  // );
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
 * Event people list.
 *
 * Uses https://material-table.com
 *
 * @param people
 * @param event
 * @returns {null|*}
 *
 * @constructor
 */

export const EventPeopleList = ({ event }) => {
  const eventId = event && event._id;
  const tableRef = React.createRef();
  const [pagination, setPagination] = useState({
    total: 0,
    pageSize: 20,
    search: '',
    page: 0,
  });

  const safeRefreshTable = () => {
    if (tableRef && tableRef.current) {
      tableRef.current.onQueryChange({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: pagination.search, // TODO: Add debounce to minimize client-server calls.
      });
    }
  };

  const { people, peopleChecks } = useTracker(() => {
    if (!eventId) {
      return {};
    }

    const skip = pagination.pageSize * pagination.page;

    Meteor.subscribe('people', {
      eventId,
      limit: pagination.pageSize,
      search: pagination.search,
      skip,
    });
    Meteor.subscribe('peopleChecks', { eventId });

    return {
      peopleChecks: PeopleChecks.find({ communityId: event._id }).fetch(),
      people: People.find(
        { communityId: event._id },
        // Skip is not needed here as this operation is performed on server side.
        { limit: pagination.pageSize }
      ).fetch(),
    };
  }, [eventId, pagination]);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    // load people count
    Meteor.call('peopleCount', { eventId }, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      setPagination({
        ...pagination,
        total: result,
      });
    });
  }, [eventId]);

  const getPeopleQuery = query => {
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
    return Promise.resolve({
      page: query.page,
      totalCount: pagination.total,
      data: people.map(person => {
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
          communityId: person.communityId,
          checkInfo: checkInfos && checkInfos[0],
          firstName: person.firstName,
          lastName: person.lastName,
          // isCheckedIn: person.checkIn,
          isCheckedIn: isUserCheckedIn,
          companyName: person.companyName,
          companyDisplayName: handleEmpty(TEXTS.NA)(formatCompanyName(person)),
          title: handleEmpty(TEXTS.NA)(formatTitle(person)),
          checkIn: handleEmpty(TEXTS.NA)(
            formatCheckInDate(checkInfos, isUserCheckedIn)
          ),
          checkOut: handleEmpty(TEXTS.NA)(
            formatCheckOutDate(checkInfos, isUserCheckedIn)
          ),
        };
      }),
    });
  };

  // Material-table is not reactive when we use pagination & remote data.
  // To achieve this use table tableRef which allows to access
  // tableRef.current.onQueryChange() which will trigger table refresh.
  // https://github.com/mbrn/material-table/issues/383
  useEffect(() => {
    safeRefreshTable();
  });

  if (!event) {
    return null;
  }

  return (
    <div>
      <MaterialTable
        tableRef={tableRef}
        options={{
          sorting: false,
          pageSize: pagination.pageSize,
          pageSizeOptions: [20, 50, 100],
        }}
        icons={tableIcons}
        columns={[
          {
            title: 'Name',
            field: 'name',
            render: person => <PersonItem {...person} />,
          },
          { title: 'Company name', field: 'companyDisplayName' },
          { title: 'Title', field: 'title' },
          { title: 'Check-in date', field: 'checkIn' },
          { title: 'Check-out date', field: 'checkOut' },
        ]}
        data={getPeopleQuery}
        title={event.name}
      />
    </div>
  );
};
