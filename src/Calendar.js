import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick

export default function Calendar(props) {

    // Event handlers
    const handleDayClick = () => {
        // TODO: show event
    }

    // Parses Shift objects to FullCalendars's Event objects
    const parseEvents = (props) => {
        var events = props.shifts.map(shift => {            
            var unavailable = {
                id: shift.shiftId,
                title: "Pré-embarque",
                start: shift.unavailabilityStartDate.toISOString(),
                end: shift.boardingDate.toISOString(),
                display: "block",
                backgroundColor: "rgb(255,92,0)",
                allDay: "true",
                extendedProps: {
                    group: shift.shiftId
                }
            };
            //console.log(event);

            var onBoard = {
                id: "board" + shift.shiftId,
                title: "A bordo",
                start: shift.boardingDate.toISOString(),
                end: shift.leavingDate.toISOString(),
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
                start: shift.leavingDate.toISOString(),
                end: shift.unavailabilityEndDate.toISOString(),
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
        <FullCalendar
            plugins={[ dayGridPlugin, interactionPlugin ]}
            initialView="dayGridMonth"
            selectable={true}
            height="auto"
            contentHeight="auto"
            locale="pt-br"
            events={parseEvents(props)}
        />
    );
}