using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Storage.Models.Dbo
{
    public record FileDbo
    {
        public required string FileId { get; init; }
        public required string StorageParentFolderId { get; init; }
        public required string StorageFileId { get; init; }
        public required int FileTypeId { get; init; }
        public required int PieceId { get; init; }
    }
}
