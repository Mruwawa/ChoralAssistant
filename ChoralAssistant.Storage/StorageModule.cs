using ChoralAssistant.Backend.Storage.Features.PieceStorage;
using ChoralAssistant.Backend.Storage.Models;
using ChoralAssistant.Storage.Features.PieceStorage;
using ChoralAssistant.Storage.Infrastructure;
using ChoralAssistant.Storage.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace ChoralAssistant.Storage
{
    public static class StorageModule
    {
        public static void AddStorageModule(this IServiceCollection services)
        {
            services.AddTransient<IStorageService, StorageService>();
            services.AddTransient<IFileRepository, GoogleStorageRepository>();
            services.AddTransient<ISqlRepository, MSSQLRepository>();
            services.AddSingleton<InMemorySQLRepo>();
            services.AddTransient<IPieceUploadModelBuilder, PieceUploadModelBuilder>();
            services.AddTransient<IPieceStorageService, PieceStorageService>();
            services.AddTransient<IFileUploadFactory, FileUploadFactory>();
        }

        public static void RegisterStorageEndpoints(this IEndpointRouteBuilder routes)
        {
            routes.MapPost("api/upload-piece",
                async (HttpContext context, IPieceUploadModelBuilder pieceUploadModelBuilder, IPieceStorageService pieceStorageService) =>
                {

                    var form = await context.Request.ReadFormAsync();

                    if (form.Count == 0)
                    {
                        context.Response.StatusCode = StatusCodes.Status400BadRequest;
                        await context.Response.WriteAsync("No form data found");
                        return;
                    }

                    try
                    {
                        var uploadModel = pieceUploadModelBuilder.BuildPieceUploadModel(form);
                        var pieceListing = await pieceStorageService.CreatePiece(uploadModel);
                        context.Response.StatusCode = StatusCodes.Status201Created;
                        await context.Response.WriteAsJsonAsync(pieceListing);

                    }
                    catch (Exception e)
                    {
                        context.Response.StatusCode = StatusCodes.Status400BadRequest;
                        await context.Response.WriteAsync(e.Message);
                        return;
                    }

                });

            routes.MapGet("api/list-pieces",
                async (HttpContext context, IPieceStorageService pieceStorageService) =>
                {
                    var pieceListings = await pieceStorageService.GetPieceList();
                    await context.Response.WriteAsJsonAsync(pieceListings);
                });

            routes.MapGet("api/get-piece/{pieceId}", async (HttpContext context, IPieceStorageService pieceStorageService, int pieceId) =>
            {
                var piece = await pieceStorageService.GetPiece(pieceId);
                await context.Response.WriteAsJsonAsync(piece);
            });

            routes.MapGet("api/download-notes-file/{pieceId}",
                async (HttpContext context, IPieceStorageService pieceStorageService, int pieceId) =>
                {
                    var notesFile = await pieceStorageService.GetNotesFile(pieceId);
                    return Results.File(notesFile.Content, notesFile.MimeType, notesFile.Name);
                });

            routes.MapGet("api/download-notes-page-file/{pieceId}/{page}",
                async (HttpContext context, IPieceStorageService pieceStorageService, int pieceId, int page) =>
                {
                    var pageFile = await pieceStorageService.GetNotesPageImageFile(pieceId, page);
                    return Results.File(pageFile.Content, pageFile.MimeType, pageFile.Name);
                });

            routes.MapGet("api/download-audio-file/{pieceId}",
                async (HttpContext context, IPieceStorageService pieceStorageService, int pieceId) =>
                {
                    var audioFile = await pieceStorageService.GetAudioFile(pieceId);
                    if (audioFile != null)
                    {
                        return Results.File(audioFile.Content, audioFile.MimeType, audioFile.Name);
                    }
                    else
                    {
                        return Results.NotFound("Audio file not found");
                    }
                });

            routes.MapPost("api/save-drawings/{pieceId}/{page}",
                async (HttpContext context, IPieceStorageService pieceStorageService, int pieceId, int page) =>
                {
                    var form = await context.Request.ReadFormAsync();
                    var drawingsFile = form.Files["drawings"];

                    if (drawingsFile == null)
                    {
                        context.Response.StatusCode = StatusCodes.Status400BadRequest;
                        await context.Response.WriteAsync("No drawings file found");
                        return;
                    }

                    await pieceStorageService.UploadDrawingsFile(drawingsFile, pieceId, page);
                });

            routes.MapGet("api/get-drawings/{pieceId}/{page}",
                async (HttpContext context, IPieceStorageService pieceStorageService, int pieceId, int page) =>
                {
                    var drawingsFile = await pieceStorageService.GetDrawingsFile(pieceId, page);
                    if (drawingsFile != null)
                    {
                        return Results.File(drawingsFile.Content, drawingsFile.MimeType, drawingsFile.Name);
                    }
                    else
                    {
                        return Results.NotFound("Drawings file not found");
                    }
                });

            routes.MapDelete("api/delete-piece/{fileId}", async (HttpContext context, IStorageService pieceStorageService, string fileId) =>
            {
                await pieceStorageService.DeletePiece(fileId);
            });
        }
    }
}
