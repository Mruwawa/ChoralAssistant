using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Storage.Models
{
    public record RecentPieceListing
    {
        public required int PieceId { get; init; }
        public required string Title { get; init; }
        public required string ThumbnailUrl { get; init; }
        public required DateTime LastAccessed { get; init; }
    }
}
