using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ChoralAssistant.Backend.Authorization.Features.Authorization;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Util;

namespace ChoralAssistant.Backend.Calendar
{
    internal interface ICalendarRepository
    {
        Task<List<CalendarEvent>> GetEvents(DateTime start, DateTime end);
        Task AddEvent(CalendarEvent calendarEvent);
        Task RemoveEvent(string id);
    }
    internal class GoogleCalendarRepository(IAccessTokenProvider _accessTokenProvider) : ICalendarRepository
    {
        public async Task AddEvent(CalendarEvent calendarEvent)
        {
            var accessToken = await _accessTokenProvider.GetAccessToken();
            var credential = GoogleCredential.FromAccessToken(accessToken);
            var calendarService = new Google.Apis.Calendar.v3.CalendarService(new Google.Apis.Services.BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = "ChoralAssistant"
            });

            var piecesParts = calendarEvent.Pieces != null ? calendarEvent.Pieces.Select(p => $"{p.Id};{p.Title}").ToList() : [];

            var piecesString = piecesParts != null && piecesParts.Count != 0 ? string.Join(",", piecesParts) : "";

            var newEvent = new Event()
            {
                Summary = calendarEvent.Title,
                Description = calendarEvent.Description,
                Start = new EventDateTime() { DateTime = calendarEvent.Start },
                End = new EventDateTime() { DateTime = calendarEvent.End },
                ExtendedProperties = new Event.ExtendedPropertiesData()
                {
                    Private__ = new Dictionary<string, string>
                    {
                        { "tag", "ChoralAssistant" },
                        { "pieces", piecesString }
                    }
                }
            };

            var request = calendarService.Events.Insert(newEvent, "primary");

            var createdEvent = await request.ExecuteAsync();
        }

        public async Task<List<CalendarEvent>> GetEvents(DateTime start, DateTime end)
        {
            var accessToken = await _accessTokenProvider.GetAccessToken();
            var credential = GoogleCredential.FromAccessToken(accessToken);
            var calendarService = new Google.Apis.Calendar.v3.CalendarService(new Google.Apis.Services.BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = "ChoralAssistant"
            });

            var request = calendarService.Events.List("primary");
            request.PrivateExtendedProperty = "tag=ChoralAssistant";
            //request.Q = "tag:ChoralAssistant";
            request.TimeMin = start;
            request.TimeMax = end;

            var events = await request.ExecuteAsync();

            return events.Items.Select(x => new CalendarEvent()
            {
                Title = x.Summary,
                Description = x.Description,
                Start = x.Start.DateTime ?? DateTime.MinValue,
                End = x.End.DateTime ?? DateTime.MinValue,
                Pieces = x.ExtendedProperties.Private__.ContainsKey("pieces") ? [.. GetPieces(x.ExtendedProperties.Private__["pieces"])] : [],
                Id = x.Id
            }).ToList();

        }

        public async Task RemoveEvent(string id)
        {
            var accessToken = await _accessTokenProvider.GetAccessToken();
            var credential = GoogleCredential.FromAccessToken(accessToken);
            var calendarService = new Google.Apis.Calendar.v3.CalendarService(new Google.Apis.Services.BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = "ChoralAssistant"
            });

            var request = calendarService.Events.Delete("primary", id);


            await request.ExecuteAsync();
        }

        private List<Piece> GetPieces(string pieces)
        {
            if (string.IsNullOrEmpty(pieces)) return new List<Piece>();
            return pieces.Split(",").Select(x =>
            {
                var parts = x.Split(";");
                return new Piece()
                {
                    Id = int.TryParse(parts[0], out int id) ? id : 0,
                    Title = parts[1]
                };
            }).ToList();
        }
    }
}
