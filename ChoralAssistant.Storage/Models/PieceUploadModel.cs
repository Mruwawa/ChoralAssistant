using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Storage.Models
{
    public class PieceUploadModel
    {
        public string PieceName { get; set; }
        public string FileType { get; set; }
        public List<IFormFile> Files { get; set; }
        public IFormFile AudioFile { get; set; }
        public string AudioLink { get; set; }
    }
}
