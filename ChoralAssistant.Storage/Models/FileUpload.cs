using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Storage.Models
{
    public record FileUpload
    {
        public required string FileName { get; init; }
        public required string FileType { get; init; }
        public required Stream FileStream { get; init; }
        public required Dictionary<string, string> MetaData { get; init; }
    }
}
