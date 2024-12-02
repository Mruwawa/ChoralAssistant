using ChoralAssistant.Backend.Calendar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChorallAssistant.Backend.IntegrationTests
{
    public class MockCalendarRepository : ICalendarRepository
    {
        private Dictionary<string, CalendarEvent> _events = new Dictionary<string, CalendarEvent>();

        public Task AddEvent(CalendarEvent calendarEvent)
        {
            var id = Guid.NewGuid().ToString();
            calendarEvent.Id = id;
            _events.Add(id, calendarEvent);
            return Task.CompletedTask;
        }

        public Task<List<CalendarEvent>> GetEvents(DateTime start, DateTime end)
        {
            return Task.FromResult(_events.Values.Where(e => e.Start >= start && e.End <= end).ToList());
        }

        public Task RemoveEvent(string id)
        {
            _events.Remove(id);
            return Task.CompletedTask;
        }
    }
}
