using ChoralAssistant.Backend.Authorization.Features.Authorization;
using ChoralAssistant.Backend.Storage.Models;
using ChoralAssistant.Backend.Storage.Models.Dbo;
using ChoralAssistant.Storage.Infrastructure;
using ChoralAssistant.Storage.Models;
using Microsoft.AspNetCore.Http;
using PdfSharp.Pdf.IO;
using FileModel = ChoralAssistant.Storage.Models.FileModel;

namespace ChoralAssistant.Backend.Storage.Features.PieceStorage
{
    public interface IPieceStorageService
    {
        public Task<PieceListing> CreatePiece(PieceUploadModel pieceUploadModel);
        public Task<List<PieceListing>> GetPieceList();
        public Task<PieceDto> GetPiece(int pieceId);
        public Task<FileModel> GetNotesFile(int pieceId);
        public Task<FileModel> GetNotesPageImageFile(int pieceId, int page);
        public Task<FileModel> GetAudioFile(int pieceId);
        public Task<FileModel> GetDrawingsFile(int pieceId, int page);
        public Task UploadDrawingsFile(IFormFile file, int pieceId, int page);
        public Task DeletePiece(int pieceId);
        public Task<string> GetSaveThumbnailUrl(int pieceId);
        public Task AddRecentPiece(int pieceId);
        public Task<List<RecentPieceListing>> GetUpdateRecentPieceList();

    }
    internal class PieceStorageService(IUserAccessor _userAccessor, IFileRepository _fileRepository, ISqlRepository _sqlRepository) : IPieceStorageService
    {
        public async Task<PieceListing> CreatePiece(PieceUploadModel pieceUploadModel)
        {
            var folderId = await _fileRepository.CreateFolder(pieceUploadModel.PieceName);

            var thumbnailUrl = "";
            var pageCount = 0;

            if (pieceUploadModel.FileType == "pdf")
            {
                var fileStream = pieceUploadModel.NoteFiles[0].OpenReadStream();

                using var pdfDocument = PdfReader.Open(fileStream, PdfDocumentOpenMode.Import);
                pageCount = pdfDocument.PageCount;

                var uploadedFile = await _fileRepository.UploadFile(folderId, new FileUpload()
                {
                    FileName = pieceUploadModel.NoteFiles[0].FileName,
                    FileType = "application/pdf",
                    FileStream = fileStream,
                    MetaData = new Dictionary<string, string>()
                    {
                        { "FileType", "NotePdf" }
                    }
                });
                thumbnailUrl = uploadedFile.ThumbnailLink;
            }
            else
            {
                int i = 1;
                foreach (var file in pieceUploadModel.NoteFiles)
                {
                    var uploadedFile = await _fileRepository.UploadFile(folderId, new FileUpload()
                    {
                        FileName = file.FileName,
                        FileType = "image/jpeg",
                        FileStream = file.OpenReadStream(),
                        MetaData = new Dictionary<string, string>()
                        {
                            { "FileType", "NoteImage" },
                            { "PageNumber", i.ToString() }
                        }
                    });
                    if (i == 1)
                    {
                        thumbnailUrl = uploadedFile.ThumbnailLink;
                    }
                    i++;
                }
                pageCount = pieceUploadModel.NoteFiles.Count;
            }

            if (pieceUploadModel.AudioFile != null)
            {
                await _fileRepository.UploadFile(folderId, new FileUpload()
                {
                    FileName = pieceUploadModel.AudioFile.FileName,
                    FileType = "audio/mpeg",
                    FileStream = pieceUploadModel.AudioFile.OpenReadStream(),
                    MetaData = new Dictionary<string, string>()
                    {
                        { "FileType", "Audio" }
                    }
                });
            }

            var userGuid = _userAccessor.UserId!;

            var pieceDto = new PieceDto()
            {
                Title = pieceUploadModel.PieceName,
                Description = pieceUploadModel.Description,
                AudioUrl = pieceUploadModel.AudioUrl,
                OwnerUserGuid = userGuid,
                ThumbnailUrl = thumbnailUrl,
                StorageFolderGuid = folderId,
                PageCount = pageCount,
                Type = pieceUploadModel.FileType
            };
            var pieceId = await _sqlRepository.SavePiece(pieceDto);

            return new PieceListing()
            {
                PieceId = pieceId,
                Title = pieceUploadModel.PieceName,
                ThumbnailUrl = thumbnailUrl
            };
        }

        public async Task<PieceDto> GetPiece(int pieceId)
        {
            var userGuid = _userAccessor.UserId!;
            return await _sqlRepository.GetPiece(userGuid, pieceId);
        }

        public async Task DeletePiece(int pieceId)
        {
            var piece = await _sqlRepository.GetPiece(_userAccessor.UserId!, pieceId);
            await _fileRepository.DeleteFile(piece.StorageFolderGuid);
            await _sqlRepository.DeletePiece(_userAccessor.UserId!, pieceId);
        }

        public Task<List<PieceListing>> GetPieceList()
        {
            var userGuid = _userAccessor.UserId!;
            return _sqlRepository.ListPiecesForUser(userGuid);
        }

        public async Task<FileModel> GetNotesFile(int pieceId)
        {
            var piece = await _sqlRepository.GetPiece(_userAccessor.UserId!, pieceId);
            var metaDataQuery = new Dictionary<string, string>()
            {
                { "FileType", "NotePdf" }
            };
            var fileId = await _fileRepository.FindFileId(piece.StorageFolderGuid, metaDataQuery);
            var file = await _fileRepository.DownloadFile(fileId);
            return file;
        }

        public async Task<FileModel> GetNotesPageImageFile(int pieceId, int page)
        {
            var piece = await _sqlRepository.GetPiece(_userAccessor.UserId!, pieceId);
            var metaDataQuery = new Dictionary<string, string>()
            {
                { "FileType", "NoteImage" },
                { "PageNumber", page.ToString() }
            };
            var fileId = await _fileRepository.FindFileId(piece.StorageFolderGuid, metaDataQuery);
            var file = await _fileRepository.DownloadFile(fileId);
            return file;
        }

        public async Task<FileModel> GetAudioFile(int pieceId)
        {
            var piece = await _sqlRepository.GetPiece(_userAccessor.UserId!, pieceId);
            var metaDataQuery = new Dictionary<string, string>()
            {
                { "FileType", "Audio" }
            };
            var fileId = await _fileRepository.FindFileId(piece.StorageFolderGuid, metaDataQuery);
            var file = await _fileRepository.DownloadFile(fileId);
            return file;
        }

        public async Task<FileModel> GetDrawingsFile(int pieceId, int page)
        {
            var piece = await _sqlRepository.GetPiece(_userAccessor.UserId!, pieceId);
            var metaDataQuery = new Dictionary<string, string>()
            {
                { "FileType", "DrawingImage" },
                { "PageNumber", page.ToString() }
            };
            var fileId = await _fileRepository.FindFileId(piece.StorageFolderGuid, metaDataQuery);
            if(string.IsNullOrEmpty(fileId))
            {
                return null;
            }
            var file = await _fileRepository.DownloadFile(fileId);
            return file;
        }

        public async Task UploadDrawingsFile(IFormFile file, int pieceId, int page)
        {
            var piece = await _sqlRepository.GetPiece(_userAccessor.UserId!, pieceId);

            var metaDataQuery = new Dictionary<string, string>()
            {
                { "FileType", "DrawingImage" },
                { "PageNumber", page.ToString() }
            };

            var fileId = await _fileRepository.FindFileId(piece.StorageFolderGuid, metaDataQuery);

            var fileUpload = new FileUpload()
            {
                FileName = $"{piece.Title}_drawing_{page}",
                FileStream = file.OpenReadStream(),
                FileType = "image/jpeg",
                MetaData = metaDataQuery
            };

            if (string.IsNullOrEmpty(fileId))
            {
                await _fileRepository.UploadFile(piece.StorageFolderGuid, fileUpload);
            }
            else
            {
                await _fileRepository.UpdateFile(fileId, fileUpload);
            }
        }

        public async Task<string> GetSaveThumbnailUrl(int pieceId)
        {
            var piece = await _sqlRepository.GetPiece(_userAccessor.UserId!, pieceId);

            Dictionary<string, string> metaDataQuery;

            if (piece.Type == "pdf")
            {
                metaDataQuery = new Dictionary<string, string>()
                {
                    { "FileType", "NotePdf" }
                };
            }
            else 
            {
                metaDataQuery = new Dictionary<string, string>()
                {
                    { "FileType", "NoteImage" },
                    { "PageNumber", "1" }
                };
            }

            var fileId = await _fileRepository.FindFileId(piece.StorageFolderGuid, metaDataQuery);
            if (string.IsNullOrEmpty(fileId)) return "";

            var thumbnailUrl = await _fileRepository.GetThumbnailUrl(fileId);

            if (string.IsNullOrEmpty(thumbnailUrl)) return "";

            await _sqlRepository.UpdatePieceThumbnailUrl(_userAccessor.UserId!, pieceId, thumbnailUrl);

            return thumbnailUrl;
        }
        public async Task AddRecentPiece(int pieceId) 
        {
            var userGuid = _userAccessor.UserId!;
            var currentRecentPieces = await _sqlRepository.ListRecentPieces(userGuid);
            if(currentRecentPieces.Any(p => p.PieceId == pieceId))
            {
                await _sqlRepository.UpdateRecentPieces(userGuid, pieceId);
                return;
            }

            await _sqlRepository.AddRecentPiece(userGuid, pieceId);
        }

        public async Task<List<RecentPieceListing>> GetUpdateRecentPieceList() 
        {
            var userGuid = _userAccessor.UserId!;
            var currentRecentPieces = await _sqlRepository.ListRecentPieces(userGuid);
            var newRecentPieces = currentRecentPieces.Where(p => p.LastAccessed > DateTime.Now.AddDays(-7)).ToList();
            var recentPiecesToDelete = currentRecentPieces.Except(newRecentPieces).ToList();
            return newRecentPieces;
        }
    }
}
