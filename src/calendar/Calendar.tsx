import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import { Fab, Grid, makeStyles } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import EventDialog from './EventDialog';
import Shift from 'data/shift';
import { shiftListState } from 'model/shift_model';
import { useRecoilValue } from 'recoil';

const useStyles = makeStyles(theme => ({
  fab: {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    zIndex: 100
  }
}));

export default function Calendar(props: any) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const shifts = useRecoilValue(shiftListState);
  const [clickedDate, setClickedDate] = useState(new Date().toISOString());

  const closeDialog = () => {
    setOpen(false);
  }

  // Handlers
  const handleDayClick = (info: any) => {
    setClickedDate(info.dateStr);
    setOpen(true);
  }

  // Changes parent title
  useEffect(() => {
    props.changeTitle("Calendário");
  }, [])

  // Parses Shift objects to FullCalendars's Event objects
  // Shifts are assumed to always be a Shift array/list
  const parseEvents = (): any => {
    var events = shifts.map((shift: Shift) => {
      var unavailable = {
        id: shift.shiftId,
        title: "Pré-embarque",
        start: shift.unavailabilityStartDate,
        end: shift.boardingDate,
        display: "block",
        backgroundColor: "rgb(255,92,0)",
        allDay: "true",
        extendedProps: {
          group: shift.shiftId
        }
      };

      var onBoard = {
        id: "board" + shift.shiftId,
        title: "A bordo",
        start: shift.boardingDate,
        end: shift.leavingDate,
        display: "block",
        backgroundColor: "rgb(170,0,0)",
        allDay: "true",
        extendedProps: {
          group: shift.shiftId
        }
      };

      var available = {
        id: "available" + shift.shiftId,
        title: "Pós-embarque",
        start: shift.leavingDate,
        end: shift.unavailabilityEndDate,
        display: "block",
        backgroundColor: "rgb(0,185,185)",
        allDay: "true",
        extendedProps: {
          group: shift.shiftId
        }
      }

      return [unavailable, onBoard, available];
    });

    return events.flat();
  }

  return (
    <Grid container spacing={3}>
      <Grid item>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          height="auto"
          contentHeight="auto"
          locale="pt-br"
          events={parseEvents}
          dateClick={handleDayClick}
        />
      </Grid>
      <Fab
        className={classes.fab}
        variant="extended"
        color="primary"
        aria-label="add"
        component={Link}
        to="/shift"
      >
        <Add />
        Escala
      </Fab>
      <EventDialog open={open} onClose={closeDialog} date={clickedDate} />
    </Grid>
  );
}