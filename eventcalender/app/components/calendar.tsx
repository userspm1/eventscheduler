"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

export default function MyFullCalendar() {
  type CalendarEvent = {
    title: string;
    date: string;
    allDay?: boolean;
  };
  const [events, setEvents] = useState<CalendarEvent[]>([
    { title: "Meeting", date: new Date().toISOString().slice(0, 10) ,allDay:false},
    { title: "Client Meeting", date: "2025-04-14" },
    { title: "Task Update", date: "2025-04-30" },
    { title: "Project Status Update", date: "2025-04-30" },
    { title: "Team Meeting", date: "2025-05-03" },
    { title: "Changes Discussion", date: "2025-05-13" },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [selectedInfo, setSelectedInfo] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [error, setError] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("06:00");
  const handleDateSelect = (selectInfo: any) => {
    setSelectedInfo(selectInfo);
    setIsAddModalOpen(true);
  };
  console.log("newEventTitle", events);
  const handleEventSubmit = () => {
    if (newEventTitle == "") {
      setError(true);
    }

    if (newEventTitle && selectedInfo) {
      setError(false);
      let calendarApi = selectedInfo.view.calendar;
      calendarApi.unselect();
      const [hours, minutes] = newEventTime.split(":");
      const dateWithTime = new Date(selectedInfo.startStr);
      dateWithTime.setHours(parseInt(hours), parseInt(minutes));
      dateWithTime.setSeconds(0);
      dateWithTime.setMilliseconds(0);

      setEvents([
        ...events,
        {
          title: newEventTitle,
          date: dateWithTime.toISOString(),
          allDay: false,
        },
      ]);

      setNewEventTitle("");
      setNewEventTime("06:00");
      setIsAddModalOpen(false);
    }
  };

  const handleEventCancel = () => {
    setNewEventTitle("");
    setError(false);
    setIsAddModalOpen(false);
  };

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event);
    setEditedTitle(clickInfo.event.title);
    setIsViewModalOpen(true);
  };

  const handleViewCancel = () => {
    setIsViewModalOpen(false);
  };

  const [currentPage, setCurrentPage] = useState(0);
  const eventsPerPage = 5;

  const getPaginatedEvents = () => {
    const today = new Date();
    const upcomingEvents = events
      .filter((event) => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const startIndex = currentPage * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    return upcomingEvents.slice(startIndex, endIndex);
  };
  useEffect(() => {
    getPaginatedEvents();
  }, [events, selectedEvent]);
  const paginatedEvents = getPaginatedEvents();

  const handleUpdateEvent = () => {
    if (selectedEvent && editedTitle.trim() !== "") {
      const updatedDate = selectedEvent.start;

      const originalTitle = selectedEvent.title;

      selectedEvent.setProp("title", editedTitle);

      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (
            event.title === originalTitle &&
            new Date(event.date).toISOString() === updatedDate.toISOString()
          ) {
            return { ...event, title: editedTitle };
          }
          return event;
        })
      );
      setIsViewModalOpen(false);
    }
  };

  const handleDeleteEvent = () => {
    getPaginatedEvents();
    if (selectedEvent) {
      selectedEvent.remove();

      const confirmed = window.confirm(
        "Are you sure you want to delete this event?"
      );
      if (!confirmed) return;

      selectedEvent.remove(); 

      setEvents((data) =>
        data.filter(
          (event) =>
            !(
              event.title === selectedEvent.title &&
              new Date(event.date).toISOString() ===
                selectedEvent.start.toISOString()
            )
        )
      );

      setIsViewModalOpen(false);
    }
  };

  const totalPages = Math.ceil(
    events.filter((e) => new Date(e.date) >= new Date()).length / eventsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };
  const renderEventContent = (eventInfo: any) => {
    const startTime = new Date(eventInfo.event.start);
    const hours = startTime.getHours();
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const suffix = hours >= 12 ? "pm" : "am";
  
    return (
      <div className=" rounded bg-blue-100 text-blue-800 text-sm font-medium overflow-hidden border-none">
        {`${displayHour}${suffix}`} - {eventInfo.event.title}
      </div>
    );
  };
  return (
    <div className="p-4 bg-gray-100 ">
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-3">
          <h1 className="text-4xl font-bold text-center mb-8 text-dark ">
            Event Scheduler
          </h1>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <FullCalendar
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
              ]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              initialView="dayGridMonth"
              selectable={true}
              editable={true}
              selectMirror={true}
              select={handleDateSelect}
              events={events}
              eventClick={handleEventClick}
              height="auto"
              buttonText={{
                today: "Today",
                month: "Month",
                week: "Week",
                day: "Agenda",
              }}
              eventContent={renderEventContent}
            />
          </div>
        </div>
        <div className="col-span-1 mt-6">
          <h2 className="text-2xl font-bold mb-4 ms-6">Upcoming Events</h2>

          {paginatedEvents.length === 0 ? (
            <p className="text-gray-700">No upcoming events.</p>
          ) : (
            paginatedEvents.map((event, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 mb-4"
              >
                <p className="font-bold">{event.title}</p>
                <p>{new Date(event.date).toDateString()}</p>
              </div>
            ))
          )}

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50">
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Add New Event</h2>

            <input
              type="text"
              placeholder="Enter event title"
              className="w-full border p-2 mb-4 rounded bg-white/50"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
            <p>
              <strong>Time:</strong>
              <input
                type="time"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                className="w-full border p-2 mb-4 rounded bg-white/50"
              />
            </p>
            <br />
            {error ? (
              <small className="text-red-700">Event Title is Mantatory</small>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleEventCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEventSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md backdrop-blur-lg bg-white/30 z-50">
          <div className="bg-white backdrop-blur-md p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Event Details</h2>

            <p className="mb-4">
              <strong>Title:</strong>{" "}
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </p>

            <p className="mb-4">
              <strong>Start:</strong> {selectedEvent.startStr}
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleUpdateEvent}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={handleViewCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={handleDeleteEvent}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
