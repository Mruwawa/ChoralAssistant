using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Storage.Models
{
    public record PieceUploadModel
    {
        public required string PieceName { get; init; }
        public string? Description { get; init; }
        public required List<IFormFile> NoteFiles { get; init; }
        public required string FileType { get; init;  }
        public IFormFile? AudioFile { get; init; }
        public string? AudioUrl { get; init; }
    }
}
