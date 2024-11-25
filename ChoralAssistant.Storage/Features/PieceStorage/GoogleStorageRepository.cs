using ChoralAssistant.Backend.Authorization.Features.Authorization;
using ChoralAssistant.Storage.Infrastructure;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using File = Google.Apis.Drive.v3.Data.File;

namespace ChoralAssistant.Storage.Features.PieceStorage
{
    internal class GoogleStorageRepository(IAccessTokenProvider _accessTokenProvider) : IFileRepository
    {
        public async Task<(byte[] fileContent, string mimeType, string fileName)> DownloadFile(string fileId)
        {
            var accessToken = await _accessTokenProvider.GetAccessToken();

            var credential = GoogleCredential.FromAccessToken(accessToken);
            var driveService = new DriveService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "ChoralAssistant"
            });

            var request = driveService.Files.Get(fileId);
            request.Fields = "id, name, mimeType";

            var fileMetadata = request.Execute();

            using var memoryStream = new MemoryStream();
            request.Download(memoryStream);
            return (memoryStream.ToArray(), fileMetadata.MimeType, fileMetadata.Name);
        }
        public async Task<List<File>> GetAllFolders()
        {
            var authToken = await _accessTokenProvider.GetAccessToken();

            var credential = GoogleCredential.FromAccessToken(authToken);

            var mainFolderId = await GetFolderId("ChoralAssistantData");
            if (string.IsNullOrEmpty(mainFolderId))
            {
                return [];
            }

            var driveService = new DriveService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "ChoralAssistant"
            });

            var request = driveService.Files.List();
            request.Q = $"'{mainFolderId}' in parents and (mimeType = 'application/vnd.google-apps.folder')";
            request.Fields = "files(id, name)";

            var result = request.Execute();

            return [.. result.Files];
        }
        public async Task<string> UploadFile(string parentFolderId, string fileName, string fileType, Stream fileStream)
        {
            try
            {
                var authToken = await _accessTokenProvider.GetAccessToken();

                var folderId = await GetFolderId("ChoralAssistantData");

                // Create the folder if it doesn't exist
                if (string.IsNullOrEmpty(folderId))
                {
                    folderId = await CreateFolder("ChoralAssistantData");
                }


                var credential = GoogleCredential.FromAccessToken(authToken);
                //.CreateScoped(DriveService.Scope.DriveAppdata);

                var service = new DriveService(new BaseClientService.Initializer
                {
                    HttpClientInitializer = credential,
                    ApplicationName = "ChoralAssistant"
                });

                var fileMetadata = new Google.Apis.Drive.v3.Data.File()
                {
                    Name = fileName
                    ,
                    Parents = new List<string>
                {
                    parentFolderId
                }
                };

                FilesResource.CreateMediaUpload request;

                request = service.Files.Create(
                    fileMetadata, fileStream, fileType);
                request.Fields = "id";
                var result = request.Upload();

                var file = request.ResponseBody;

                return file.Id;
            }
            catch (Exception e)
            {
                return null;
            }
        }

        public async Task<string> GetFolderId(string folderName)
        {
            var authToken = await _accessTokenProvider.GetAccessToken();

            var credential = GoogleCredential.FromAccessToken(authToken);

            var driveService = new DriveService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "ChoralAssistant"
            });

            var request = driveService.Files.List();
            if (folderName == "ChoralAssistantData")
            {
                request.Q = $"mimeType = 'application/vnd.google-apps.folder' and name = '{folderName}'";
            }
            else
            {
                request.Q = $"mimeType = 'application/vnd.google-apps.folder' and name = '{folderName}' and 'ChoralAssistantData' in parents";
            }
            request.Fields = "files(id, name)";

            try
            {
                var result = request.Execute();

                // Return the folder ID if found
                if (result.Files != null && result.Files.Count > 0)
                {
                    return result.Files[0].Id; // Return the first matching folder ID
                }
            }
            catch (Exception ex)
            {
                return null;
            }

            return null; // Folder doesn't exist
        }

        public async Task<string> CreateFolder(string folderName)
        {
            var mainFolderId = await GetOrCreateMainFolder();
            var authToken = await _accessTokenProvider.GetAccessToken();

            var credential = GoogleCredential.FromAccessToken(authToken);

            var driveService = new DriveService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "ChoralAssistant"
            });

            var folderMetadata = new Google.Apis.Drive.v3.Data.File
            {
                Name = folderName,
                Parents = new List<string> { mainFolderId },
                MimeType = "application/vnd.google-apps.folder"
            };

            var request = driveService.Files.Create(folderMetadata);
            request.Fields = "id";

            var folder = request.Execute();
            Console.WriteLine($"Folder '{folderName}' created successfully. Folder ID: {folder.Id}");
            return folder.Id; // Return the newly created folder ID
        }

        private async Task<string> GetOrCreateMainFolder()
        {
            var folderId = await GetFolderId("ChoralAssistantData");
            if (string.IsNullOrEmpty(folderId))
            {
                folderId = await CreateFolder("ChoralAssistantData");
            }

            return folderId;
        }

        public async Task DeleteFile(string fileId)
        {
            var authToken = await _accessTokenProvider.GetAccessToken();

            var credential = GoogleCredential.FromAccessToken(authToken);

            var driveService = new DriveService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "ChoralAssistant"
            });

            var request = driveService.Files.Delete(fileId);
            request.Execute();
        }

        public async Task<string> GetThumbnailUrl(string fileId)
        {
            var authToken = await _accessTokenProvider.GetAccessToken();

            var credential = GoogleCredential.FromAccessToken(authToken);

            var driveService = new DriveService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "ChoralAssistant"
            });

            var request = driveService.Files.List();
            request.Fields = "files(id, name, thumbnailLink)";

            request.Q = $"'{fileId}' in parents and (name = 'notesPDFFile' or name = 'notesImageFile_0')";

            var files = await request.ExecuteAsync();

            return files.Files.FirstOrDefault()?.ThumbnailLink ?? "";
        }

        public async Task<List<File>> GetAllFiles(string folderId)
        {
            var authToken = await _accessTokenProvider.GetAccessToken();

            var credential = GoogleCredential.FromAccessToken(authToken);

            var driveService = new DriveService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "ChoralAssistant"
            });

            var request = driveService.Files.List();
            request.Fields = "files(id, name, mimeType)";

            request.Q = $"'{folderId}' in parents";

            var files = await request.ExecuteAsync();

            return [.. files.Files];
        }

        public async Task<string> GetFolderName(string folderId)
        {
            var authToken = await _accessTokenProvider.GetAccessToken();

            var credential = GoogleCredential.FromAccessToken(authToken);

            var driveService = new DriveService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "ChoralAssistant"
            });

            var request = driveService.Files.List();

            request.Q = $"mimeType = 'application/vnd.google-apps.folder'";

            request.Fields = "files(id, name)";

            var result = request.Execute();

            return result.Files.FirstOrDefault()?.Name ?? "";
        }
    }
}
