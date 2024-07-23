import React, { useState } from "react";
import {
  Calendar,
  momentLocalizer,
  Event as BigCalendarEvent,
  ToolbarProps,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Define types for events
interface CalendarEvent extends BigCalendarEvent {
  start: Date;
  end: Date;
  title: string;
  color?: string; // Optional color property
}

const localizer = momentLocalizer(moment);

// Function to convert yyyy-mm-dd string to Date object
const parseDate = (dateString: string, isEnd: boolean = false): Date => {
  const date = moment(dateString, "YYYY-MM-DD");
  return isEnd ? date.endOf("day").toDate() : date.startOf("day").toDate();
};

// Custom Toolbar component
const CustomToolbar: React.FC<ToolbarProps> = ({
  label,
  onNavigate,
  onView,
}) => {
  const handleNavigate = (action: "PREV" | "NEXT") => {
   
    onNavigate(action); // Call the provided onNavigate function
  };

  return (
    <div
      className="custom-toolbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px",
      }}
    >
      <button onClick={() => handleNavigate("PREV")}>Previous</button>
      <span>{label}</span>
      <button onClick={() => handleNavigate("NEXT")}>Next</button>
    </div>
  );
};

const MyCalendar: React.FC = () => {
  // Example array of events with color property
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      start: parseDate("2024-07-22"),
      end: parseDate("2024-07-22", true),
      title: "R700",
      color: "lightcoral",
    },
    {
      start: parseDate("2024-07-24"),
      end: parseDate("2024-08-4", true),
      title: "SM70",
      color: "lightblue",
    },
    {
      start: parseDate("2024-07-26"),
      end: parseDate("2024-07-27", true),
      title: "2-Day Mark",
      color: "lightgreen",
    },
  ]);

  // Function to set custom styles for each event
  const eventPropGetter = (event: CalendarEvent) => ({
    style: {
      backgroundColor: event.color || "lightcoral", // Use color property or default to lightcoral
      borderRadius: "0px",
      opacity: 0.8,
      color: "white",
      border: "0px",
    },
  });

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        eventPropGetter={eventPropGetter} // Apply custom styles
        // components={{ toolbar: CustomToolbar }} // Use custom toolbar
      />
    </div>
  );
};

export default MyCalendar;