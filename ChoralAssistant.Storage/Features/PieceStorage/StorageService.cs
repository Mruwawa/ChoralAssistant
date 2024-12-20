﻿using ChoralAssistant.Storage.Infrastructure;
using ChoralAssistant.Storage.Models;
using File = ChoralAssistant.Storage.Models.FileModel;

namespace ChoralAssistant.Storage.Features.PieceStorage
{
    internal interface IStorageService
    {
        public Task<List<Google.Apis.Drive.v3.Data.File>> GetAllPieces();
        public Drawings GetDrawings(string fileId);

        public void SaveDrawings(string fileId, Drawings drawings);
        public Task<List<PieceListing>> GetAllPiecesMinimal();

        public Task DeletePiece(string fileId);

        public Task<Piece> GetPiece(string folderId);
    }
    internal class StorageService(IFileRepository _fileRepository, InMemorySQLRepo _sqlRepository) : IStorageService
    {
        public async Task<List<Google.Apis.Drive.v3.Data.File>> GetAllPieces()
        {
            var allFolders = await _fileRepository.GetAllFolders();

            var pieces = allFolders.Select(f =>
            new Google.Apis.Drive.v3.Data.File()
            {
                Id = f.Id,
                Name = f.Name
            }).ToList();

            for (int i = 0; i < pieces.Count; i++)
            {
                var piece = pieces[i];
                var thumbnailUrl = await _fileRepository.GetThumbnailUrl(piece.Id);
                piece.ThumbnailLink = thumbnailUrl;
            }

            return pieces;
        }

        public async Task<List<PieceListing>> GetAllPiecesMinimal()
        {
            var pieces = await _fileRepository.GetAllFolders();
            return pieces.Select(p => new PieceListing()
            {
                PieceId = 1,//p.Id,
                Title = p.Name,
                ThumbnailUrl = p.ThumbnailLink
            }).ToList();
        }
        public async Task<Piece> GetPiece(string folderId) {
            var folderName = await _fileRepository.GetFolderName(folderId);
            var files = await _fileRepository.GetAllFiles(folderId);
            var piece = new Piece()
            {
                FolderId = folderId,
                Title = folderName
            };

            var pdfFile = files.FirstOrDefault(f => f.Name == "notesPDFFile");
            if (pdfFile != null) 
            {
                piece.PDFFileId = pdfFile.Id;
            }

            var imageFiles = files.Where(f => f.MimeType.Contains("image"));
            if(imageFiles != null)
            {
                piece.ImageFileIds = imageFiles.Select(f => f.Id).ToList();
            }

            var audioFile = files.FirstOrDefault(f => f.MimeType.Contains("audio"));
            if (audioFile != null)
            {
                piece.AudioFileId = audioFile.Id;
            }

            return piece;
        }

        public Drawings GetDrawings(string fileId)
        {
            return _sqlRepository.GetDrawings(fileId);
        }

        public void SaveDrawings(string fileId, Drawings drawings)
        {
            _sqlRepository.SaveDrawings(fileId, drawings);
        }

        public async Task DeletePiece(string fileId)
        {
            await _fileRepository.DeleteFile(fileId);
        }
    }
}
