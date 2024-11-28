using ChoralAssistant.Backend.Authorization.Features.Authorization;
using ChoralAssistant.Backend.Storage.Models;
using ChoralAssistant.Storage.Infrastructure;
using ChoralAssistant.Storage.Models;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Drive.v3;
using Google.Apis.Requests;
using Google.Apis.Services;
using File = Google.Apis.Drive.v3.Data.File;

namespace ChoralAssistant.Storage.Features.PieceStorage
{
    internal class GoogleStorageRepository(IAccessTokenProvider _accessTokenProvider) : IFileRepository
    {
        public async Task<FileModel> DownloadFile(string fileId)
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

            try
            {
                var fileMetadata = request.Execute();

                using var memoryStream = new MemoryStream();
                request.Download(memoryStream);

                return new FileModel()
                {
                    Content = memoryStream.ToArray(),
                    MimeType = fileMetadata.MimeType,
                    Name = fileMetadata.Name
                };
            }
            catch (Exception e)
            {
                return null;
            }
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
        public async Task<File> UploadFile(string parentFolderId, FileUpload fileUpload)
        {
            try
            {
                var accessToken = await _accessTokenProvider.GetAccessToken();

                var credential = GoogleCredential.FromAccessToken(accessToken);

                var service = new DriveService(new BaseClientService.Initializer
                {
                    HttpClientInitializer = credential,
                    ApplicationName = "ChoralAssistant"
                });

                var fileMetadata = new File()
                {
                    Name = fileUpload.FileName
                    ,
                    Parents = new List<string>
                {
                    parentFolderId
                },
                    AppProperties = fileUpload.MetaData
                };

                FilesResource.CreateMediaUpload request;

                request = service.Files.Create(
                    fileMetadata, fileUpload.FileStream, fileUpload.FileType);
                request.Fields = "id,thumbnailLink";
                var result = request.Upload();

                var file = request.ResponseBody;

                return file;
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

            var request = driveService.Files.Get(fileId);
            request.Fields = "thumbnailLink";

            var file = await request.ExecuteAsync();

            return file.ThumbnailLink ?? "";
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

        public async Task<string> FindFileId(string folderId, Dictionary<string, string> queryMetadata)
        {
            var accessToken = await _accessTokenProvider.GetAccessToken();

            var credential = GoogleCredential.FromAccessToken(accessToken);
            var driveService = new DriveService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "ChoralAssistant"
            });

            var request = driveService.Files.List();
            request.Fields = "files(id, thumbnailLink)";

            var metadataQueries = queryMetadata.Select(kv => $"appProperties has {{ key='{kv.Key}' and value='{kv.Value}' }}");
            var metadataQuery = string.Join(" and ", metadataQueries);

            if (!string.IsNullOrEmpty(metadataQuery))
            {
                request.Q = $"'{folderId}' in parents and {metadataQuery}";
            }
            else
            {
                request.Q = $"'{folderId}' in parents";
            }
            try
            {
                var foundFiles = await request.ExecuteAsync();

                if (foundFiles == null || foundFiles.Files == null || foundFiles.Files.Count == 0)
                {
                    return "";
                }
                var fileId = foundFiles.Files.FirstOrDefault()!.Id;
                return fileId;

            }
            catch (Exception e)
            {
                return "";
            }
        }

        public async Task UpdateFile(string fileId, FileUpload fileUpload)
        {
            try
            {
                var accessToken = await _accessTokenProvider.GetAccessToken();

                var credential = GoogleCredential.FromAccessToken(accessToken);

                var service = new DriveService(new BaseClientService.Initializer
                {
                    HttpClientInitializer = credential,
                    ApplicationName = "ChoralAssistant"
                });

                var request = service.Files.Update(new File(), fileId, fileUpload.FileStream, fileUpload.FileType);
                request.Fields = "id,thumbnailLink";
                var result = request.Upload();

                var file = request.ResponseBody;
            }
            catch (Exception e)
            {
            }
        }
    }
}
