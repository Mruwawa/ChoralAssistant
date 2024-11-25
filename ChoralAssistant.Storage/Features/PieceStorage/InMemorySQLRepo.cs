using ChoralAssistant.Storage.Infrastructure;
using ChoralAssistant.Storage.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Storage.Features.PieceStorage
{
    internal class InMemorySQLRepo : ISqlRepository
    {
        private readonly Dictionary<string, Drawings> _drawings = [];
        private readonly Dictionary<string, string> _imageUrls = [];
        public Drawings GetDrawings(string fileId)
        {
            return _drawings[fileId];
        }

        public void SaveDrawings(string fileId, Drawings drawings) 
        {
            _drawings[fileId] = drawings;
        }

        public void SaveImageUrl(string fileId, string imageUrl)
        {
            _imageUrls[fileId] = imageUrl;
        }
    }
}
