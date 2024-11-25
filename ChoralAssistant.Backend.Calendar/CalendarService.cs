

using Google.Apis.Calendar.v3.Data;
using Ical.Net;
using Ical.Net.DataTypes;
using Ical.Net.Serialization;
using System.Globalization;
using System.IO;
using System.Text;

namespace ChoralAssistant.Backend.Calendar
{
    internal interface ICalendarService
    {
        public Task AddEvent(CalendarEvent calendarEvent);
        public Task<List<CalendarEvent>> GetEvents(DateTime start, DateTime end);

        public Task RemoveEvent(string id);

        public Task<byte[]> Export();

        public Task Import(Stream fileStream);
    }
    internal class CalendarService(ICalendarRepository _calendarRepository) : ICalendarService
    {
        public async Task AddEvent(CalendarEvent calendarEvent)
        {
            await _calendarRepository.AddEvent(calendarEvent);
        }

        public async Task<byte[]> Export()
        {
            var calendarEvents = await _calendarRepository.GetEvents(DateTime.Now.AddYears(-1), DateTime.Now.AddYears(1));

            var serializer = new CalendarSerializer();

            var calendar = new Ical.Net.Calendar();

            var events = calendarEvents.Select(e => new Ical.Net.CalendarComponents.CalendarEvent
            {
                DtStart = new CalDateTime(e.Start),
                DtEnd = new CalDateTime(e.End),
                Description = e.Description,
                Location = e.Location,
                Summary = e.Title
            }).ToList();

            calendar.Events.AddRange(events);

            var serializedCalendar = serializer.SerializeToString(calendar);

            return Encoding.UTF8.GetBytes(serializedCalendar);
        }

        public async Task<List<CalendarEvent>> GetEvents(DateTime start, DateTime end)
        {
            return await _calendarRepository.GetEvents(start, end);
        }

        public async Task Import(Stream fileStream)
        {
            var calendar = Ical.Net.Calendar.Load(fileStream);

            if (calendar == null)
            {
                return;
            }

            var events = calendar.Events.Select(e => new CalendarEvent
            {
                Start = e.DtStart.Value,
                End = e.DtEnd.Value,
                Description = e.Description,
                Location = e.Location,
                Title = e.Summary
            }).ToList();

            foreach (var e in events)
            {
                await _calendarRepository.AddEvent(e);
            }
        }

        public async Task RemoveEvent(string id)
        {
            await _calendarRepository.RemoveEvent(id);
        }
    }
}
