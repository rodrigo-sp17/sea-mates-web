import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick

export default function Calendar() {

    // Event handlers
    const handleDayClick = () => {
        // TODO: show event
    }

    // Fill calendar data with API shift requests


    return (
        <FullCalendar
            plugins={[ dayGridPlugin, interactionPlugin ]}
            initialView="dayGridMonth"
            height="auto"
            contentHeight="auto"
            locale="pt-br"
        />
    );
}