using ChoralAssistant.Backend.Storage.Models;
using ChoralAssistant.Storage.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Storage.Features.PieceStorage
{
    internal interface IFileUploadFactory
    {
        public List<FileUpload> CreateFileUploads(PieceUploadModel pieceUploadModel);
    }

    internal class FileUploadFactory : IFileUploadFactory
    {
        public List<FileUpload> CreateFileUploads(PieceUploadModel pieceUploadModel)
        {
            List<FileUpload> fileUploads = [];

            if (pieceUploadModel.FileType == "pdf")
            {
                fileUploads.Add(new FileUpload()
                {
                    FileName = pieceUploadModel.PieceName,
                    FileType = "application/pdf",
                    FileStream = pieceUploadModel.NoteFiles[0].OpenReadStream(),
                    MetaData = new Dictionary<string, string>()
                    {
                        { "ThumbnailFile", "" },
                        { "NoteFile", "" },
                        { "FileType", "pdf" }
                    }
                });
            }
            else if (pieceUploadModel.FileType == "image")
            {
                int i = 1;
                foreach (var file in pieceUploadModel.NoteFiles)
                {
                    var metaData = new Dictionary<string, string>()
                    {
                        { "NoteFile", "" },
                        { "FileType", "image" },
                        { "PageNumber", i.ToString() }
                    };

                    if (i == 1)
                    {
                        metaData.Add("ThumbnailFile", "");
                    }

                    fileUploads.Add(new FileUpload()
                    {
                        FileName = $"notesImageFile_{i}",
                        FileType = "image/jpeg",
                        FileStream = file.OpenReadStream(),
                        MetaData = metaData
                    });
                    i++;
                }
            }

            if (pieceUploadModel.AudioFile != null)
            {
                fileUploads.Add(new FileUpload()
                {
                    FileName = pieceUploadModel.PieceName,
                    FileType = "audio/mpeg",
                    FileStream = pieceUploadModel.AudioFile.OpenReadStream(),
                    MetaData = new Dictionary<string, string>()
                    {
                        { "FileType", "audio" }
                    }
                });
            }

            return fileUploads;
        }
    }
}
