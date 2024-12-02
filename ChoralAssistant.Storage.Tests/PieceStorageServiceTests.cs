using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection.PortableExecutable;
using System.Threading.Tasks;
using ChoralAssistant.Backend.Authorization.Features.Authorization;
using ChoralAssistant.Backend.Storage.Features.PieceStorage;
using ChoralAssistant.Storage.Infrastructure;
using ChoralAssistant.Backend.Storage.Models;
using ChoralAssistant.Storage.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using NUnit.Framework;
using PdfSharp.Pdf.IO;
using ChoralAssistant.Backend.Storage.Models.Dbo;
using PdfSharp.Pdf;
using Google.Apis.Drive.v3.Data;

namespace ChoralAssistant.Storage.Tests.Features.PieceStorage
{
    [TestFixture]
    public class PieceStorageServiceTests
    {
        private IPieceStorageService _pieceStorageService;
        private IUserAccessor _userAccessor;
        private IFileRepository _fileRepository;
        private ISqlRepository _sqlRepository;
        private IPdfInfoReader _pdfInfoReader;

        [SetUp]
        public void Setup()
        {
            _userAccessor = Substitute.For<IUserAccessor>();
            _fileRepository = Substitute.For<IFileRepository>();
            _sqlRepository = Substitute.For<ISqlRepository>();
            _pdfInfoReader = Substitute.For<IPdfInfoReader>();
            _pieceStorageService = new PieceStorageService(_userAccessor, _fileRepository, _sqlRepository, _pdfInfoReader);
        }

        [Test]
        public async Task CreatePiece_WhenFileTypeIsPdf_UploadsPdfFileAndReturnsPieceListing()
        {
            // Arrange
            var pieceUploadModel = new PieceUploadModel
            {
                PieceName = "Test Piece",
                FileType = "pdf",
                NoteFiles = new List<IFormFile>
                {
                    Substitute.For<IFormFile>()
                }
            };

            var folderId = Guid.NewGuid().ToString();
            var fileId = Guid.NewGuid().ToString();
            var thumbnailUrl = "https://example.com/thumbnail";
            var pageCount = 5;
            var pieceId = 4;

            _fileRepository.CreateFolder(pieceUploadModel.PieceName).Returns(folderId);

            _pdfInfoReader.GetPageCount(Arg.Any<Stream>()).Returns(pageCount);

            _sqlRepository.SavePiece(Arg.Any<PieceDto>()).Returns(pieceId);

            var fileStream = new MemoryStream();
            pieceUploadModel.NoteFiles[0].OpenReadStream().Returns(fileStream);

            _fileRepository.UploadFile(folderId, Arg.Any<FileUpload>()).Returns(new Google.Apis.Drive.v3.Data.File
            {
                ThumbnailLink = thumbnailUrl
            });

            // Act
            var result = await _pieceStorageService.CreatePiece(pieceUploadModel);

            // Assert
            result.Should().NotBeNull();
            result.PieceId.Should().Be(pieceId);
            result.Title.Should().Be(pieceUploadModel.PieceName);
            result.ThumbnailUrl.Should().Be(thumbnailUrl);

            await _fileRepository.Received(1).CreateFolder(pieceUploadModel.PieceName);
            await _fileRepository.Received(1).UploadFile(folderId, Arg.Is<FileUpload>(f =>
                f.FileName == pieceUploadModel.NoteFiles[0].FileName &&
                f.FileType == "application/pdf" &&
                f.FileStream == fileStream &&
                f.MetaData.ContainsKey("FileType") &&
                f.MetaData["FileType"] == "NotePdf"
            ));
            await _sqlRepository.Received(1).SavePiece(Arg.Is<PieceDto>(p =>
                p.Title == pieceUploadModel.PieceName &&
                p.Description == null &&
                p.AudioUrl == null &&
                p.OwnerUserGuid == _userAccessor.UserId &&
                p.ThumbnailUrl == thumbnailUrl &&
                p.StorageFolderGuid == folderId &&
                p.PageCount == pageCount &&
                p.Type == pieceUploadModel.FileType
            ));
        }

        [Test]
        public async Task CreatePiece_WhenFileTypeIsImage_UploadsImageFilesAndReturnsPieceListing()
        {
            // Arrange
            var pieceUploadModel = new PieceUploadModel
            {
                PieceName = "Test Piece",
                FileType = "image",
                NoteFiles = new List<IFormFile>
                {
                    Substitute.For<IFormFile>(),
                    Substitute.For<IFormFile>()
                }
            };

            var folderId = Guid.NewGuid().ToString();
            var fileId1 = Guid.NewGuid().ToString();
            var fileId2 = Guid.NewGuid().ToString();
            var thumbnailUrl = "https://example.com/thumbnail";
            var pageCount = 2;
            var pieceId = 5;

            _fileRepository.CreateFolder(pieceUploadModel.PieceName).Returns(folderId);

            var fileStream1 = new MemoryStream();
            var fileStream2 = new MemoryStream();
            pieceUploadModel.NoteFiles[0].OpenReadStream().Returns(fileStream1);
            pieceUploadModel.NoteFiles[1].OpenReadStream().Returns(fileStream2);

            _fileRepository.UploadFile(folderId, Arg.Any<FileUpload>()).Returns(new Google.Apis.Drive.v3.Data.File
            {
                ThumbnailLink = thumbnailUrl
            });

            _sqlRepository.SavePiece(Arg.Any<PieceDto>()).Returns(pieceId);

            // Act
            var result = await _pieceStorageService.CreatePiece(pieceUploadModel);

            // Assert
            result.Should().NotBeNull();
            result.PieceId.Should().Be(pieceId);
            result.Title.Should().Be(pieceUploadModel.PieceName);
            result.ThumbnailUrl.Should().Be(thumbnailUrl);

            await _fileRepository.Received(1).CreateFolder(pieceUploadModel.PieceName);
            await _fileRepository.Received(2).UploadFile(folderId, Arg.Is<FileUpload>(f =>
                (f.FileName == pieceUploadModel.NoteFiles[0].FileName || f.FileName == pieceUploadModel.NoteFiles[1].FileName) &&
                f.FileType == "image/jpeg" &&
                (f.FileStream == fileStream1 || f.FileStream == fileStream2) &&
                f.MetaData.ContainsKey("FileType") &&
                f.MetaData["FileType"] == "NoteImage"
            ));
            await _sqlRepository.Received(1).SavePiece(Arg.Is<PieceDto>(p =>
                p.Title == pieceUploadModel.PieceName &&
                p.Description == null &&
                p.AudioUrl == null &&
                p.OwnerUserGuid == _userAccessor.UserId &&
                p.ThumbnailUrl == thumbnailUrl &&
                p.StorageFolderGuid == folderId &&
                p.PageCount == pageCount &&
                p.Type == pieceUploadModel.FileType
            ));
        }

        [Test]
        public async Task CreatePiece_WhenAudioFileIsNotNull_UploadsAudioFile()
        {
            // Arrange
            var pieceUploadModel = new PieceUploadModel
            {
                PieceName = "Test Piece",
                FileType = "pdf",
                NoteFiles = new List<IFormFile>
                {
                    Substitute.For<IFormFile>()
                },
                AudioFile = Substitute.For<IFormFile>()
            };

            var folderId = Guid.NewGuid().ToString();
            var pieceId = 6;

            _fileRepository.CreateFolder(pieceUploadModel.PieceName).Returns(folderId);
            _sqlRepository.SavePiece(Arg.Any<PieceDto>()).Returns(pieceId);

            // Act
            await _pieceStorageService.CreatePiece(pieceUploadModel);

            // Assert
            await _fileRepository.Received(1).UploadFile(folderId, Arg.Is<FileUpload>(f =>
                f.FileName == pieceUploadModel.AudioFile.FileName &&
                f.FileType == "audio/mpeg" &&
                f.FileStream == pieceUploadModel.AudioFile.OpenReadStream() &&
                f.MetaData.ContainsKey("FileType") &&
                f.MetaData["FileType"] == "Audio"
            ));
        }

        [Test]
        public async Task GetPiece_ReturnsPieceDto()
        {
            // Arrange
            var pieceId = 3;

            _userAccessor.UserId.Returns(Guid.NewGuid().ToString());

            var pieceDto = new PieceDto
            {
                Title = "Test Piece",
                Description = null,
                AudioUrl = null,
                ThumbnailUrl = "https://example.com/thumbnail",
                OwnerUserGuid = "ownerUserGuid",
                StorageFolderGuid = "storageFolderGuid",
                PageCount = 5,
                Type = "pdf"
            };

            _sqlRepository.GetPiece(_userAccessor.UserId, pieceId).Returns(pieceDto);

            // Act
            var result = await _pieceStorageService.GetPiece(pieceId);

            // Assert
            result.Should().Be(pieceDto);
        }

        [Test]
        public async Task DeletePiece_DeletesPieceAndFiles()
        {
            // Arrange
            var pieceId = 7;

            _userAccessor.UserId.Returns(Guid.NewGuid().ToString());

            var pieceDto = new PieceDto
            {
                Title = "Test Piece",
                Description = null,
                AudioUrl = null,
                ThumbnailUrl = "https://example.com/thumbnail",
                OwnerUserGuid = "ownerUserGuid",
                StorageFolderGuid = "storageFolderGuid",
                PageCount = 5,
                Type = "pdf"
            };

            _sqlRepository.GetPiece(_userAccessor.UserId, pieceId).Returns(pieceDto);

            // Act
            await _pieceStorageService.DeletePiece(pieceId);

            // Assert
            await _fileRepository.Received(1).DeleteFile(pieceDto.StorageFolderGuid);
            await _sqlRepository.Received(1).DeletePiece(_userAccessor.UserId, pieceId);
        }

        [Test]
        public async Task GetPieceList_ShouldReturnListOfPieceListings()
        {
            // Arrange
            var userGuid = Guid.NewGuid().ToString();
            _userAccessor.UserId.Returns(userGuid);
            var expectedPieceList = new List<PieceListing>()
                {
                    new PieceListing() { PieceId = 1, Title = "Piece 1", ThumbnailUrl = "thumbnail1.jpg" },
                    new PieceListing() { PieceId = 2, Title = "Piece 2", ThumbnailUrl = "thumbnail2.jpg" }
                };
            _sqlRepository.ListPiecesForUser(userGuid).Returns(expectedPieceList);

            // Act
            var result = await _pieceStorageService.GetPieceList();

            // Assert
            result.Should().BeEquivalentTo(expectedPieceList);
        }

        [Test]
        public async Task GetNotesFile_ShouldReturnFileModel()
        {
            // Arrange
            var pieceId = 1;
            var userGuid = Guid.NewGuid().ToString();
            _userAccessor.UserId.Returns(userGuid);
            var piece = new PieceDto
            {
                Title = "Test Piece",
                Description = null,
                AudioUrl = null,
                ThumbnailUrl = "https://example.com/thumbnail",
                OwnerUserGuid = "ownerUserGuid",
                StorageFolderGuid = "storageFolderGuid",
                PageCount = 5,
                Type = "pdf"
            };
            _sqlRepository.GetPiece(userGuid, pieceId).Returns(piece);
            var metaDataQuery = new Dictionary<string, string>()
                {
                    { "FileType", "NotePdf" }
                };
            var fileId = Guid.NewGuid().ToString();
            _fileRepository.FindFileId(Arg.Any<string>(), Arg.Any<Dictionary<string, string>>()).Returns(fileId);
            var expectedFile = new FileModel() { Name = "notes.pdf", MimeType = "application/pdf", Content = null };
            _fileRepository.DownloadFile(fileId).Returns(expectedFile);

            // Act
            var result = await _pieceStorageService.GetNotesFile(pieceId);

            // Assert
            result.Should().BeEquivalentTo(expectedFile);
        }

        [Test]
        public async Task GetNotesPageImageFile_ShouldReturnFileModel()
        {
            // Arrange
            var pieceId = 1;
            var page = 2;
            var userGuid = Guid.NewGuid().ToString();
            _userAccessor.UserId.Returns(userGuid);
            var piece = new PieceDto
            {
                Title = "Test Piece",
                Description = null,
                AudioUrl = null,
                ThumbnailUrl = "https://example.com/thumbnail",
                OwnerUserGuid = "ownerUserGuid",
                StorageFolderGuid = "storageFolderGuid",
                PageCount = 5,
                Type = "pdf"
            };
            _sqlRepository.GetPiece(userGuid, pieceId).Returns(piece);
            var fileId = Guid.NewGuid().ToString();

            _fileRepository.FindFileId(Arg.Any<string>(), Arg.Any<Dictionary<string, string>>()).Returns(fileId);
            var expectedFile = new FileModel() { Name = "notes_page_1.jpeg", MimeType = "image/jpeg", Content = null };
            _fileRepository.DownloadFile(fileId).Returns(expectedFile);

            // Act
            var result = await _pieceStorageService.GetNotesPageImageFile(pieceId, page);

            // Assert
            result.Should().BeEquivalentTo(expectedFile);
        }

        [Test]
        public async Task GetAudioFile_ShouldReturnFileModel()
        {
            // Arrange
            var pieceId = 1;
            var userGuid = Guid.NewGuid().ToString();
            _userAccessor.UserId.Returns(userGuid);
            var piece = new PieceDto
            {
                Title = "Test Piece",
                Description = null,
                AudioUrl = null,
                ThumbnailUrl = "https://example.com/thumbnail",
                OwnerUserGuid = "ownerUserGuid",
                StorageFolderGuid = "storageFolderGuid",
                PageCount = 5,
                Type = "pdf"
            };
            _sqlRepository.GetPiece(userGuid, pieceId).Returns(piece);
            var metaDataQuery = new Dictionary<string, string>()
                {
                    { "FileType", "Audio" }
                };
            var fileId = Guid.NewGuid().ToString();
            _fileRepository.FindFileId(Arg.Any<string>(), Arg.Any<Dictionary<string, string>>()).Returns(fileId);
            var expectedFile = new FileModel() { Name = "audio.mp3", MimeType = "audio/mpeg", Content = null };
            _fileRepository.DownloadFile(fileId).Returns(expectedFile);

            // Act
            var result = await _pieceStorageService.GetAudioFile(pieceId);

            // Assert
            result.Should().BeEquivalentTo(expectedFile);
        }

        [Test]
        public async Task GetDrawingsFile_WhenFileIdIsNull_ShouldReturnNull()
        {
            // Arrange
            var pieceId = 1;
            var page = 2;
            var userGuid = Guid.NewGuid().ToString();
            _userAccessor.UserId.Returns(userGuid);
            var piece = new PieceDto
            {
                Title = "Test Piece",
                Description = null,
                AudioUrl = null,
                ThumbnailUrl = "https://example.com/thumbnail",
                OwnerUserGuid = "ownerUserGuid",
                StorageFolderGuid = "storageFolderGuid",
                PageCount = 5,
                Type = "pdf"
            };
            _sqlRepository.GetPiece(userGuid, pieceId).Returns(piece);
            var metaDataQuery = new Dictionary<string, string>()
                {
                    { "FileType", "DrawingImage" },
                    { "PageNumber", page.ToString() }
                };
            string fileId = "begrouybhdfvdfn";
            _fileRepository.FindFileId(piece.StorageFolderGuid, metaDataQuery).Returns(fileId);

            // Act
            var result = await _pieceStorageService.GetDrawingsFile(pieceId, page);

            // Assert
            result.Should().BeNull();
        }

        [Test]
        public async Task GetDrawingsFile_WhenFileIdIsNotNull_ShouldReturnFileModel()
        {
            // Arrange
            var pieceId = 1;
            var page = 2;
            var userGuid = Guid.NewGuid().ToString();
            _userAccessor.UserId.Returns(userGuid);
            var piece = new PieceDto
            {
                Title = "Test Piece",
                Description = null,
                AudioUrl = null,
                ThumbnailUrl = "https://example.com/thumbnail",
                OwnerUserGuid = "ownerUserGuid",
                StorageFolderGuid = "storageFolderGuid",
                PageCount = 5,
                Type = "pdf"
            };
            _sqlRepository.GetPiece(userGuid, pieceId).Returns(piece);
            var metaDataQuery = new Dictionary<string, string>()
                {
                    { "FileType", "DrawingImage" },
                    { "PageNumber", page.ToString() }
                };
            var fileId = Guid.NewGuid().ToString();
            _fileRepository.FindFileId(Arg.Any<string>(), Arg.Any<Dictionary<string, string>>()).Returns(fileId);
            var expectedFile = new FileModel() { Name = "audio.mp3", MimeType = "audio/mpeg", Content = null };
            _fileRepository.DownloadFile(fileId).Returns(expectedFile);

            // Act
            var result = await _pieceStorageService.GetDrawingsFile(pieceId, page);

            // Assert
            result.Should().BeEquivalentTo(expectedFile);
        }

        [Test]
        public async Task UploadDrawingsFile_ShouldUploadFile_WhenFileIdIsNull()
        {
            // Arrange
            var file = Substitute.For<IFormFile>();
            var pieceId = 1;
            var page = 1;
            var piece = new PieceDto
            {
                Title = "Test Piece",
                Description = null,
                AudioUrl = null,
                ThumbnailUrl = "https://example.com/thumbnail",
                OwnerUserGuid = "ownerUserGuid",
                StorageFolderGuid = "storageFolderGuid",
                PageCount = 5,
                Type = "pdf"
            };

            _sqlRepository.GetPiece(Arg.Any<string>(), pieceId).Returns(piece);
            _fileRepository.FindFileId(Arg.Any<string>(), Arg.Any<Dictionary<string, string>>()).Returns((string)null);

            // Act
            await _pieceStorageService.UploadDrawingsFile(file, pieceId, page);

            // Assert
            await _fileRepository.Received(1).UploadFile(Arg.Any<string>(), Arg.Any<FileUpload>());
        }

        [Test]
        public async Task UploadDrawingsFile_ShouldUpdateFile_WhenFileIdIsNotNull()
        {
            // Arrange
            var file = Substitute.For<IFormFile>();
            var pieceId = 1;
            var page = 1;
            var piece = new PieceDto
            {
                Title = "Test Piece",
                Description = null,
                AudioUrl = null,
                ThumbnailUrl = "https://example.com/thumbnail",
                OwnerUserGuid = "ownerUserGuid",
                StorageFolderGuid = "storageFolderGuid",
                PageCount = 5,
                Type = "pdf"
            };

            _sqlRepository.GetPiece(Arg.Any<string>(), pieceId).Returns(piece);
            _fileRepository.FindFileId(Arg.Any<string>(), Arg.Any<Dictionary<string, string>>()).Returns("fileId");

            // Act
            await _pieceStorageService.UploadDrawingsFile(file, pieceId, page);

            // Assert
            await _fileRepository.Received(1).UpdateFile(Arg.Any<string>(), Arg.Any<FileUpload>());
        }

        [Test]
        public async Task GetSaveThumbnailUrl_ShouldReturnThumbnailUrl_WhenFileTypeIsNotePdf()
        {
            // Arrange
            var pieceId = 1;
            var piece = new PieceDto
            {
                Title = "Test Piece",
                Description = null,
                AudioUrl = null,
                ThumbnailUrl = "https://example.com/thumbnail",
                OwnerUserGuid = "ownerUserGuid",
                StorageFolderGuid = "storageFolderGuid",
                PageCount = 5,
                Type = "pdf"
            };

            _sqlRepository.GetPiece(Arg.Any<string>(), pieceId).Returns(piece);
            _fileRepository.FindFileId(Arg.Any<string>(), Arg.Any<Dictionary<string, string>>()).Returns("fileId");
            _fileRepository.GetThumbnailUrl(Arg.Any<string>()).Returns("thumbnailUrl");

            // Act
            var result = await _pieceStorageService.GetSaveThumbnailUrl(pieceId);

            // Assert
            result.Should().Be("thumbnailUrl");
            await _sqlRepository.Received(1).UpdatePieceThumbnailUrl(Arg.Any<string>(), pieceId, "thumbnailUrl");
        }

        //[Test]
        //public async Task GetSaveThumbnailUrl_ShouldReturnEmptyString_WhenFileTypeIsNotNotePdf()
        //{
        //    // Arrange
        //    var pieceId = 1;
        //    var piece = new PieceDto
        //    {
        //        Title = "Test Piece",
        //        Description = null,
        //        AudioUrl = null,
        //        ThumbnailUrl = "https://example.com/thumbnail",
        //        OwnerUserGuid = "ownerUserGuid",
        //        StorageFolderGuid = "storageFolderGuid",
        //        PageCount = 5,
        //        Type = "pdf"
        //    };

        //    _sqlRepository.GetPiece(Arg.Any<string>(), pieceId).Returns(piece);
        //    _fileRepository.FindFileId(Arg.Any<string>(), Arg.Any<Dictionary<string, string>>()).Returns("fileId");
        //    _fileRepository.GetThumbnailUrl(Arg.Any<string>()).Returns("thumbnailUrl");

        //    // Act
        //    var result = await _pieceStorageService.GetSaveThumbnailUrl(pieceId);

        //    // Assert
        //    //result.Should().BeEmpty();
        //    await _sqlRepository.DidNotReceive().UpdatePieceThumbnailUrl(Arg.Any<string>(), pieceId, Arg.Any<string>());
        //}

        [Test]
        public async Task AddRecentPiece_ShouldUpdateRecentPiece_WhenPieceExists()
        {
            // Arrange
            var pieceId = 1;
            var userGuid = Guid.NewGuid().ToString();
            var currentRecentPieces = new List<RecentPieceListing>()
                {
                    new RecentPieceListing() 
                    { 
                        PieceId = pieceId,
                        LastAccessed = DateTime.Now.AddDays(-5),
                        ThumbnailUrl = "thumbnailUrl",
                        Title = "Piece 1",
                    }
                };

            _userAccessor.UserId.Returns(userGuid);
            _sqlRepository.ListRecentPieces(Arg.Any<string>()).Returns(currentRecentPieces);

            // Act
            await _pieceStorageService.AddRecentPiece(pieceId);

            // Assert
            await _sqlRepository.Received(1).UpdateRecentPieces(userGuid, pieceId);
            await _sqlRepository.DidNotReceive().AddRecentPiece(Arg.Any<string>(), Arg.Any<int>());
        }

        [Test]
        public async Task AddRecentPiece_ShouldAddRecentPiece_WhenPieceDoesNotExist()
        {
            // Arrange
            var pieceId = 1;
            var userGuid = Guid.NewGuid().ToString();
            var currentRecentPieces = new List<RecentPieceListing>()
                {
                    new RecentPieceListing()
                    {
                        PieceId = 12,
                        LastAccessed = DateTime.Now.AddDays(-5),
                        ThumbnailUrl = "thumbnailUrl",
                        Title = "Piece 1",
                    }
                };

            _userAccessor.UserId.Returns(userGuid);
            _sqlRepository.ListRecentPieces(Arg.Any<string>()).Returns(currentRecentPieces);

            // Act
            await _pieceStorageService.AddRecentPiece(pieceId);

            // Assert
            await _sqlRepository.Received(1).AddRecentPiece(userGuid, pieceId);
            await _sqlRepository.DidNotReceive().UpdateRecentPieces(Arg.Any<string>(), Arg.Any<int>());
        }

        [Test]
        public async Task GetUpdateRecentPieceList_ShouldReturnNewRecentPieces_But_Not_OldRecentPieces()
        {
            // Arrange
            var userGuid = Guid.NewGuid().ToString();
            var currentRecentPieces = new List<RecentPieceListing>()
                {
                    new RecentPieceListing()
                    {
                        PieceId = 1,
                        LastAccessed = DateTime.Now.AddDays(-30),
                        ThumbnailUrl = "thumbnailUrl",
                        Title = "Piece 1",
                    },
                    new RecentPieceListing()
                    {
                        PieceId = 2,
                        LastAccessed = DateTime.Now.AddDays(-3),
                        ThumbnailUrl = "thumbnailUrl",
                        Title = "Piece 1",
                    },
                    new RecentPieceListing()
                    {
                        PieceId = 3,
                        LastAccessed = DateTime.Now.AddDays(-1),
                        ThumbnailUrl = "thumbnailUrl",
                        Title = "Piece 1",
                    }
                };

            _userAccessor.UserId.Returns(userGuid);
            _sqlRepository.ListRecentPieces(Arg.Any<string>()).Returns(currentRecentPieces);

            // Act
            var result = await _pieceStorageService.GetUpdateRecentPieceList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().Contain(p => p.PieceId == 2);
            result.Should().Contain(p => p.PieceId == 3);
        }
    }
}
