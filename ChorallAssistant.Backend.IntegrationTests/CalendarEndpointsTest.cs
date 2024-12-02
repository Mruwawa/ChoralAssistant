using ChoralAssistant.Backend.Calendar;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Newtonsoft.Json;
using System.Net;
using System.Text;

namespace ChorallAssistant.Backend.IntegrationTests
{
    [TestFixture]
    public class CalendarEndpointsTest
    {
        private HttpClient _httpClient;

        [SetUp]
        public void Setup()
        {
            var factory = new CustomWebApplicationFactory();
            _httpClient = factory.CreateClient();
        }

        [Test]
        public async Task ApiAddEvent_Should_Add_Event_When_UserIsAuthorized()
        {
            var requestEvent = new CalendarEvent
            {
                Title = "Test",
                Description = "Test",
                Start = new DateTime(2024, 11, 30),
                End = new DateTime(2024, 12, 1),
                Location = "Test",
                Pieces =
                [
                    new()
                    {
                        Id = 1,
                        Title = "Test"
                    }
                ]
            };

            var token = MockJwtGenerator.GenerateToken("Bardzo dlugi klucz uzywany tylko i wylacznie w celach testow integracyjnych systemu itd itp");
            _httpClient.DefaultRequestHeaders.Add("Cookie", $"AuthToken={token}");

            var request = new HttpRequestMessage(HttpMethod.Post, "/api/add-event")
            {
                Content = new StringContent(JsonConvert.SerializeObject(requestEvent), Encoding.UTF8, "application/json")
            };

            request.Headers.Add("Cookie", $"AuthToken={token}");

            var response = await _httpClient.SendAsync(request);

            response.StatusCode.Should().Be(HttpStatusCode.Created);
        }

        [Test]
        public async Task ApiAddEvent_Should_Return_Unauthorized_When_UserIsUnAuthorized()
        {
            var requestEvent = new CalendarEvent
            {
                Title = "Test",
                Description = "Test",
                Start = new DateTime(2024, 11, 30),
                End = new DateTime(2024, 12, 1),
                Location = "Test",
                Pieces = new List<Piece>
                {
                    new Piece
                    {
                        Id = 1,
                        Title = "Test"
                    }
                }
            };

            var test = await _httpClient.PostAsync("/api/add-event", new StringContent(JsonConvert.SerializeObject(requestEvent), Encoding.UTF8, "application/json"));

            test.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Test]
        public async Task ApiCalendar_Should_Return_Events_WithSpecifiedDate()
        {
            await AddEvent(new CalendarEvent
            {
                Title = "Test",
                Description = "Test",
                Start = new DateTime(2024, 11, 30),
                End = new DateTime(2024, 12, 1),
                Location = "Test",
                Pieces =
                [
                    new()
                    {
                        Id = 1,
                        Title = "Test"
                    }
                ]
            });

            await AddEvent(new CalendarEvent
            {
                Title = "WydarzenieZaRok",
                Description = "Test",
                Start = new DateTime(2025, 11, 30),
                End = new DateTime(2025, 12, 1),
                Location = "Test",
                Pieces =
                [
                    new()
                    {
                        Id = 1,
                        Title = "Test"
                    }
                ]
            });

            var token = MockJwtGenerator.GenerateToken("Bardzo dlugi klucz uzywany tylko i wylacznie w celach testow integracyjnych systemu itd itp");
            _httpClient.DefaultRequestHeaders.Add("Cookie", $"AuthToken={token}");

            var response = await _httpClient.GetAsync("/api/calendar?start=2024-11-29T23:00:00.000Z&end=2024-12-10T00:00:00.000Z");

            var responseContent = await response.Content.ReadAsStringAsync();

            var parsedResponse = JsonConvert.DeserializeObject<List<CalendarEvent>>(responseContent);

            parsedResponse.Should().NotBeEmpty();
            parsedResponse.Should().HaveCount(1);
            parsedResponse.Should().ContainSingle(x => x.Title == "Test");
            parsedResponse.Should().NotContain(x => x.Title == "WydarzenieZaRok");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }


        [Test]
        public async Task ApiRemove_Should_Remove_Event_From_Calendar()
        {
            await AddEvent(new CalendarEvent
            {
                Title = "Event1",
                Description = "Test",
                Start = new DateTime(2024, 11, 30),
                End = new DateTime(2024, 12, 1),
                Location = "Test",
                Pieces =
                [
                    new()
                    {
                        Id = 1,
                        Title = "Test"
                    }
                ]
            });

            await AddEvent(new CalendarEvent
            {
                Title = "NiechcianeWydarzenie",
                Description = "Test",
                Start = new DateTime(2024, 12, 6),
                End = new DateTime(2024, 12, 7),
                Location = "Test",
                Pieces =
                [
                    new()
                    {
                        Id = 1,
                        Title = "Test"
                    }
                ]
            });


            var token = MockJwtGenerator.GenerateToken("Bardzo dlugi klucz uzywany tylko i wylacznie w celach testow integracyjnych systemu itd itp");
            _httpClient.DefaultRequestHeaders.Add("Cookie", $"AuthToken={token}");

            var currentEvents = await _httpClient.GetAsync("/api/calendar?start=2024-11-30T23:00:00.000Z&end=2024-12-20T00:00:00.000Z");

            var parsedCurrentEvents = JsonConvert.DeserializeObject<List<CalendarEvent>>(await currentEvents.Content.ReadAsStringAsync());

            var unwantedEvent = parsedCurrentEvents.FirstOrDefault(x => x.Title == "NiechcianeWydarzenie");


            var removeRequestBody = new RemoveEventRequest
            {
                Id = unwantedEvent.Id
            };

            await _httpClient.PostAsync("/api/calendar/remove", new StringContent(JsonConvert.SerializeObject(removeRequestBody), Encoding.UTF8, "application/json"));

            var response = await _httpClient.GetAsync("/api/calendar?start=2024-11-30T23:00:00.000Z&end=2024-12-20T00:00:00.000Z");

            var responseContent = await response.Content.ReadAsStringAsync();
            var parsedResponse = JsonConvert.DeserializeObject<List<CalendarEvent>>(responseContent);
            parsedResponse.Should().NotContain(x => x.Title == "NiechcianeWydarzenie");
        }


        private async Task AddEvent(CalendarEvent calendarEvent)
        {
            var token = MockJwtGenerator.GenerateToken("Bardzo dlugi klucz uzywany tylko i wylacznie w celach testow integracyjnych systemu itd itp");
            _httpClient.DefaultRequestHeaders.Add("Cookie", $"AuthToken={token}");

            var request = new HttpRequestMessage(HttpMethod.Post, "/api/add-event")
            {
                Content = new StringContent(JsonConvert.SerializeObject(calendarEvent), Encoding.UTF8, "application/json")
            };

            request.Headers.Add("Cookie", $"AuthToken={token}");

            await _httpClient.SendAsync(request);
        }
    }
}