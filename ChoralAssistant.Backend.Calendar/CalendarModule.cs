using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace ChoralAssistant.Backend.Calendar
{
    public static class CalendarModule
    {
        public static void AddCalendarModule(this IServiceCollection services)
        {
            services.AddTransient<ICalendarRepository, GoogleCalendarRepository>();
            services.AddTransient<ICalendarService, CalendarService>();
        }

        public static void RegisterCalendarEndpoints(this IEndpointRouteBuilder routes)
        {
            routes.MapGet("/api/calendar", async (HttpContext context, ICalendarService calendarService) =>
            {
                var startDate = context.Request.Query["start"];
                var endDate = context.Request.Query["end"];

                var events = await calendarService.GetEvents(DateTime.Parse(startDate), DateTime.Parse(endDate));

                await context.Response.WriteAsJsonAsync(events);
            });

            routes.MapPost("/api/add-event", async (HttpContext context, ICalendarService calendarService) =>
            {
                var newEvent = await context.Request.ReadFromJsonAsync<CalendarEvent>();

                await calendarService.AddEvent(newEvent);

                context.Response.StatusCode = 201;
            });

            routes.MapPost("/api/calendar/remove", async (HttpContext context, ICalendarService calendarService) =>
            {

                var removeRequest = await context.Request.ReadFromJsonAsync<RemoveEventRequest>();

                if (removeRequest == null)
                {
                    context.Response.StatusCode = 400;
                    return;
                }

                if (string.IsNullOrEmpty(removeRequest.Id))
                {
                    context.Response.StatusCode = 400;
                    return;
                }

                await calendarService.RemoveEvent(removeRequest.Id);
                context.Response.StatusCode = StatusCodes.Status200OK;
            });

            routes.MapGet("/api/export-calendar", async (HttpContext context, ICalendarService calendarService) =>
            {
                var calendarBytes = await calendarService.Export();

                context.Response.ContentType = "text/calendar";
                context.Response.Headers.ContentDisposition = "attachment; filename=\"calendar.ics\"";
                await context.Response.Body.WriteAsync(calendarBytes);
            });

            routes.MapPost("/api/import-calendar", async (HttpContext context, ICalendarService calendarService) =>
            {
                var form = await context.Request.ReadFormAsync();

                var file = form.Files.GetFile("file");

                if (file == null) 
                {
                    context.Response.StatusCode = 400;
                    return;
                }

                await calendarService.Import(file.OpenReadStream());

            });
        }

    }
}
