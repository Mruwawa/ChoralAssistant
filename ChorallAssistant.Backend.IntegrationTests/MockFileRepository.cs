using ChoralAssistant.Backend.Storage.Models;
using ChoralAssistant.Storage.Infrastructure;
using ChoralAssistant.Storage.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChorallAssistant.Backend.IntegrationTests
{
    public class MockFileRepository : IFileRepository
    {
        public Task<string> CreateFolder(string folderName)
        {
            throw new NotImplementedException();
        }

        public Task DeleteFile(string fileId)
        {
            throw new NotImplementedException();
        }

        public Task<FileModel> DownloadFile(string fileId)
        {
            throw new NotImplementedException();
        }

        public Task<string> FindFileId(string folderId, Dictionary<string, string> queryMetadata)
        {
            throw new NotImplementedException();
        }

        public Task<List<Google.Apis.Drive.v3.Data.File>> GetAllFiles(string folderId)
        {
            throw new NotImplementedException();
        }

        public Task<List<Google.Apis.Drive.v3.Data.File>> GetAllFolders()
        {
            throw new NotImplementedException();
        }

        public Task<string> GetFolderId(string folderName)
        {
            throw new NotImplementedException();
        }

        public Task<string> GetFolderName(string folderId)
        {
            throw new NotImplementedException();
        }

        public Task<string> GetThumbnailUrl(string fileId)
        {
            throw new NotImplementedException();
        }

        public Task UpdateFile(string fileId, FileUpload fileUpload)
        {
            throw new NotImplementedException();
        }

        public Task<Google.Apis.Drive.v3.Data.File> UploadFile(string parentFolderId, FileUpload fileUpload)
        {
            throw new NotImplementedException();
        }
    }
}
