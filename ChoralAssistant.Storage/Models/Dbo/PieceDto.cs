using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Storage.Models.Dbo
{
    public record PieceDto
    {
        public required string Title { get; init; }
        public string? Description { get; init; }
        public string? AudioUrl { get; init; }
        public required string ThumbnailUrl { get; init; }
        public required string OwnerUserGuid { get; init; }
        public required string StorageFolderGuid { get; init; }
        public required int PageCount { get; init; }
        public required string Type { get; init; }
    }
}
