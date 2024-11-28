using ChoralAssistant.Backend.Storage.Models;
using ChoralAssistant.Storage.Models;
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
        public Task<string> GetFolderId(string folderName);
        public Task<string> CreateFolder(string folderName);
        public Task<File> UploadFile(string parentFolderId, FileUpload fileUpload);

        public Task UpdateFile(string fileId, FileUpload fileUpload);
        public Task<List<File>> GetAllFolders();

        public Task<FileModel> DownloadFile(string fileId);

        public Task<string> FindFileId(string folderId, Dictionary<string, string> queryMetadata);



        public Task DeleteFile(string fileId);

        public Task<string> GetThumbnailUrl(string fileId);

        public Task<List<File>> GetAllFiles(string folderId);

        public Task<string> GetFolderName(string folderId);
    }
}
