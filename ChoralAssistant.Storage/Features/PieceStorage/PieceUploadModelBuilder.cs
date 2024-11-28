using ChoralAssistant.Storage.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Storage.Features.PieceStorage
{
    internal interface IPieceUploadModelBuilder 
    {
        public PieceUploadModel BuildPieceUploadModel(IFormCollection form);
    }
    internal class PieceUploadModelBuilder : IPieceUploadModelBuilder
    {
        public PieceUploadModel BuildPieceUploadModel(IFormCollection form)
        {
            if (!form.TryGetValue("pieceName", out var pieceName))
            {
                throw new Exception("Piece name is required");
            }

            if (!form.TryGetValue("fileType", out var fileType))
            {
                throw new Exception("File type is required");
            }

            var files = form.Files.GetFiles("files");

            if (files == null || files.Count < 1)
            {
                throw new Exception("File input is required");
            }

            if(fileType != "pdf" && fileType != "image")
            {
                throw new Exception("Invalid file type");
            }

            var audioUrl = form.TryGetValue("audioUrl", out _) ? form["audioUrl"].ToString() : "";

            return new PieceUploadModel
            {
                PieceName = form["pieceName"]!,
                Description = form.TryGetValue("description", out var description) ? description! : "",
                FileType = form["fileType"]!,
                NoteFiles = [.. form.Files.GetFiles("files")],
                AudioFile = form.Files.GetFile("audioFile")!,
                AudioUrl = audioUrl
            };
        }
    }
}
