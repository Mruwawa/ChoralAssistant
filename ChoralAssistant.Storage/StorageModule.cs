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
            services.AddTransient<IPieceStorageService, StorageService>();
            services.AddTransient<IFileRepository, GoogleStorageRepository>();
            services.AddSingleton<ISqlRepository, InMemorySQLRepo>();
        }

        public static void RegisterStorageEndpoints(this IEndpointRouteBuilder routes)
        {
            routes.MapPost("api/upload-piece",
                async (HttpContext context, IPieceStorageService pieceStorageService) =>
                {

                    var form = await context.Request.ReadFormAsync();

                    if (!form.TryGetValue("pieceName", out var pieceName))
                    {
                        context.Response.StatusCode = StatusCodes.Status400BadRequest;
                        await context.Response.WriteAsync("Piece name is required");
                        return;
                    }

                    if (!form.TryGetValue("fileType", out var fileType))
                    {
                        context.Response.StatusCode = StatusCodes.Status400BadRequest;
                        await context.Response.WriteAsync("File type is required");
                        return;
                    }

                    var files = form.Files.GetFiles("files");

                    if (files == null || files.Count < 1)
                    {
                        context.Response.StatusCode = StatusCodes.Status400BadRequest;
                        await context.Response.WriteAsync("File input is required");
                        return;
                    }

                    switch (fileType)
                    {
                        case "pdf":
                            {
                                
                                break;
                            }
                        case "image":
                            {
                                break;
                            }
                        default:
                            {
                                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                                await context.Response.WriteAsync("Invalid file type");
                                return;
                            }
                    }

                    var uploadModel = new PieceUploadModel
                    {
                        PieceName = form["pieceName"]!,
                        FileType = form["fileType"]!,
                        Files = form.Files.GetFiles("files").ToList(),
                        AudioFile = form.Files.GetFile("audioFile")!,
                        AudioLink = form.TryGetValue("audioUrl", out var audioLink) ? audioLink : ""
                    };

                    await pieceStorageService.UploadFile(uploadModel);
                });

            routes.MapGet("api/get-all-pieces",
                async (HttpContext context, IPieceStorageService pieceStorageService) =>
                {

                    var pieces = await pieceStorageService.GetAllPieces();

                    await context.Response.WriteAsJsonAsync(pieces);
                });

            routes.MapGet("api/get-piece/{folderId}", async(HttpContext context ,IPieceStorageService pieceStorageService, string folderId) => { 
                var piece = await pieceStorageService.GetPiece(folderId);
                await context.Response.WriteAsJsonAsync(piece);
            });

            routes.MapGet("api/download-file/{fileId}",
                async (HttpContext context, IPieceStorageService pieceStorageService, string fileId) =>
                {
                    var authToken = context.Request.Cookies["AccessToken"];
                    var pieces = await pieceStorageService.DownloadFile(fileId);

                    return Results.File(pieces.fileContent, pieces.mimeType, pieces.fileName);
                });

            routes.MapPost("api/save-drawings/{fileId}",
                async (HttpContext context, IPieceStorageService pieceStorageService, string fileId) =>
                {
                    pieceStorageService.SaveDrawings(fileId, await context.Request.ReadFromJsonAsync<Drawings>());
                });

            routes.MapGet("api/get-drawings/{fileId}",
                async (HttpContext context, IPieceStorageService pieceStorageService, string fileId) =>
                {
                    var drawings = pieceStorageService.GetDrawings(fileId);
                    await context.Response.WriteAsJsonAsync(drawings);
                });

            routes.MapGet("api/get-all-pieces-minimal", async (HttpContext context, IPieceStorageService pieceStorageService) => { 
                var pieces = await pieceStorageService.GetAllPiecesMinimal();
                await context.Response.WriteAsJsonAsync(pieces);
            });

            routes.MapDelete("api/delete-piece/{fileId}", async (HttpContext context, IPieceStorageService pieceStorageService, string fileId) =>
            {
                await pieceStorageService.DeletePiece(fileId);
            });
        }
    }
}
