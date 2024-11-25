using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Storage.Models
{
    public class Piece
    {
        public string FolderId { get; set; }
        public string Title { get; set; }
        public string PDFFileId { get; set; }
        public List<string> ImageFileIds { get; set; }
        public string AudioFileId { get; set; }
        public string AudioUrl { get; set; }
    }
}
