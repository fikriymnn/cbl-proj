import React, { useState, useCallback } from 'react';
import {
  Calendar,
  momentLocalizer,
  Event as BigCalendarEvent,
  View,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Define types for events
interface CalendarEvent extends BigCalendarEvent {
  start: Date;
  end: Date;
  title: string;
  color?: string;
}

const localizer = momentLocalizer(moment);

// Function to convert yyyy-mm-dd string to Date object
const parseDate = (dateString: string, isEnd: boolean = false): Date => {
  const date = moment(dateString, 'YYYY-MM-DD');
  return isEnd ? date.endOf('day').toDate() : date.startOf('day').toDate();
};

interface MyCalendarProps {
  data: any;
  onMonthChange?: (month: number) => void;
}

const MyCalendar: React.FC<MyCalendarProps> = ({ data, onMonthChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>('month');

  const events = [
    ...data?.map((data: any, index: number) => ({
      start: parseDate(data.tgl_request_from, true),
      end: parseDate(data.tgl_request_to, true),
      title: data.nama_mesin,
      color: 'red',
    })),
    ...data?.map((data: any, index: number) => ({
      start: parseDate(data.tgl_approve_from, true),
      end: parseDate(data.tgl_approve_to, true),
      title: data.nama_mesin,
      color: 'blue',
    })),
  ];

  // Handle navigation changes
  const handleNavigate = useCallback(
    (newDate: Date, view?: View) => {
      console.log(
        'Calendar navigated to:',
        newDate,
        'View:',
        view || currentView,
      );
      setCurrentDate(newDate);

      // Extract month from the new date and call the callback
      const month = newDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
      console.log('Extracted month:', month);

      if (onMonthChange) {
        onMonthChange(month);
      }
    },
    [onMonthChange, currentView],
  );

  // Handle view changes
  const handleViewChange = useCallback((newView: View) => {
    console.log('View changed to:', newView);
    setCurrentView(newView);
  }, []);

  // Function to set custom styles for each event
  const eventPropGetter = (event: CalendarEvent) => ({
    style: {
      backgroundColor: event.color || 'lightcoral',
      borderRadius: '0px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
    },
  });

  return (
    <div className="w-full">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        eventPropGetter={eventPropGetter}
        date={currentDate}
        view={currentView}
        onNavigate={handleNavigate}
        onView={handleViewChange}
      />
    </div>
  );
};

export default MyCalendar;
