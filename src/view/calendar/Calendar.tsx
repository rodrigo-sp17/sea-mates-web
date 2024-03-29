import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import { Container, Fab, Grid, makeStyles } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import EventDialog from './EventDialog';
import Shift from 'api/data/shift';
import { shiftListState } from 'api/model/shift_model';
import { useRecoilValue } from 'recoil';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 1200,
  },
  fab: {
    position: 'fixed',
    left: 'auto', 
    right: 20,
    bottom: 20,
    zIndex: 100
  }
}));

export default function Calendar(props: any) {
  const { changeTitle } = props;
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
    changeTitle("Calendário");
  }, [changeTitle])

  // Parses Shift objects to FullCalendars's Event objects
  // Shifts are assumed to always be a Shift array/list
  const parseEvents = (): any => {
    var events = shifts.map((shift: Shift) => {
      var unavailable = {
        id: shift.shiftId.toString(),
        title: "Pré-embarque",
        start: shift.unavailabilityStartDate,
        end: shift.boardingDate,
        display: "block",
        backgroundColor: "rgb(255,92,0)",
        allDay: "true",
        extendedProps: {
          group: shift.shiftId.toString()
        }
      };

      var onBoard = {
        id: "board" + shift.shiftId.toString(),
        title: "A bordo",
        start: shift.boardingDate,
        end: shift.leavingDate,
        display: "block",
        backgroundColor: "rgb(170,0,0)",
        allDay: "true",
        extendedProps: {
          group: shift.shiftId.toString()
        }
      };

      var available = {
        id: "available" + shift.shiftId.toString(),
        title: "Pós-embarque",
        start: shift.leavingDate,
        end: shift.unavailabilityEndDate,
        display: "block",
        backgroundColor: "rgb(0,185,185)",
        allDay: "true",
        extendedProps: {
          group: shift.shiftId.toString()
        }
      }

      return [unavailable, onBoard, available];
    });

    return events.flat();
  }

  return (
    <Container disableGutters className={classes.root}>
      <Grid item>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          height="auto"
          contentHeight="auto"
          locale="pt-br"
          events={parseEvents()}
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
    </Container>
  );
}