import React, { forwardRef, useMemo } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { People } from '/collections/people';
import { Meteor } from 'meteor/meteor';

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
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref}/>),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref}/>),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref}/>),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref}/>),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref}/>),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref}/>),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref}/>),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref}/>),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref}/>),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref}/>),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref}/>),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref}/>),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref}/>),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref}/>),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref}/>),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref}/>),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref}/>),
};

/** Format display data **/

function formatName({ firstName, lastName }) {
  return `${firstName} ${lastName}`;
}

function formatCompanyName({ companyName }) {
  return companyName;
}

function formatDate(date) {
  return new Date(date).toISOString();
}

function formatCheckInDate(checkInfo = []) {
  const lastCheckIn = checkInfo.find(({ isCheckedIn }) => isCheckedIn);


  return lastCheckIn && formatDate(lastCheckIn.date);
}

function formatCheckOutDate(checkInfo = []) {
  const lastCheckOut = checkInfo.find(({ isCheckedIn }) => !isCheckedIn);

  return lastCheckOut && formatDate(lastCheckOut.date);
}

function formatTitle({ title }) {
  return title;
}

function handleEmpty(emptyText) {
  return text => (text || emptyText);
}

// update person
function toggleCheckIn(person) {
  const { communityId, id, isCheckedIn } = person;

  //person.isDirty = true;
  Meteor.call('communities.toggleCheckPerson', {
    communityId,
    personId: id,
    checkIn: !isCheckedIn,
  });
}


// Handle person check in/out button.
const PersonItem = person => {
  const isPersonCheckedIn = person.isCheckedIn;
  const name = formatName(person);
  const variant = isPersonCheckedIn ? 'contained' : 'outlined';
  const buttonText = isPersonCheckedIn ? 'out' : 'in';

  // Memoize button so it doesn't do necessary renders.
  // However minimongo loads items in chunks so it might be nice to investigate material-ui table
  // and useMemo for each row.
  return useMemo(() => <Button
    onClick={() => toggleCheckIn(person)}
    style={{ textTransform: 'none' }} color="primary"
    variant={variant}>{`Check-${buttonText} ${name}`}</Button>, [name, isPersonCheckedIn]);
};


function getUserChecks({ event, personId }) {
  if (!event || !Array.isArray(event.checks)) {
    return;
  }

  return event.checks
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
  if (!event) {
    return null;
  }
  const { people } = useTracker(() => {
    Meteor.subscribe('people');

    return {
      people: People.find({ communityId: event._id }, { limit: 50 }).fetch(),
    };
  }, [event._id]);

  return <div>
    <MaterialTable
      icons={tableIcons}
      columns={[
        { title: 'Name', field: 'name', render: (person) => <PersonItem {...person}/> },
        { title: 'Company name', field: 'companyName' },
        { title: 'Title', field: 'title' },
        { title: 'Check-in date', field: 'checkIn' },
        { title: 'Check-out date', field: 'checkOut' },
      ]}
      data={people.map(person => {
        const checkInfo = getUserChecks({ event, personId: person._id });
        const isUserCheckedIn = !!(checkInfo.length > 0 && checkInfo[0].isCheckedIn);

        return {
          id: person._id,
          communityId: person.communityId,
          firstName: person.firstName,
          lastName: person.lastName,
          //isCheckedIn: person.checkIn,
          isCheckedIn: isUserCheckedIn,
          companyName: handleEmpty('N/A')(formatCompanyName(person)),
          title: handleEmpty('N/A')(formatTitle(person)),

          checkIn: handleEmpty('N/A')(formatCheckInDate(checkInfo)),
          checkOut: handleEmpty('N/A')(formatCheckOutDate(checkInfo)),
        };
      })}
      title={event.name}
    />
  </div>;
};
