using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using File = Google.Apis.Drive.v3.Data.File;

namespace ChoralAssistant.Storage.Infrastructure
{
    internal interface IFileRepository
    {
        public Task<string> UploadFile(string parentFolderId, string fileName, string fileType, Stream fileStream);

        public Task<List<File>> GetAllFolders();

        public Task<(byte[] fileContent, string mimeType, string fileName)> DownloadFile(string fileId);

        public Task<string> GetFolderId(string folderName);

        public Task<string> CreateFolder(string folderName);

        public Task DeleteFile(string fileId);

        public Task<string> GetThumbnailUrl(string fileId);

        public Task<List<File>> GetAllFiles(string folderId);

        public Task<string> GetFolderName(string folderId);
    }
}
