using PdfSharp.Pdf.IO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Storage.Features.PieceStorage
{
    public interface IPdfInfoReader 
    {
        public int GetPageCount(Stream fileStream);
    }
    internal class PdfInfoReader : IPdfInfoReader
    {
        public int GetPageCount(Stream fileStream)
        {
            using var pdfDocument = PdfReader.Open(fileStream, PdfDocumentOpenMode.Import);
            var pageCount = pdfDocument.PageCount;
            return pageCount;
        }
    }
}
