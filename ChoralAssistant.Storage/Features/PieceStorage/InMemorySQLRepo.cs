using ChoralAssistant.Backend.Storage.Models.Dbo;
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

        public Task DeletePiece(string userGuid, int pieceId)
        {
            throw new NotImplementedException();
        }

        public Drawings GetDrawings(string fileId)
        {
            return _drawings[fileId];
        }

        public Task<PieceDto> GetPiece(string userGuid, int pieceId)
        {
            throw new NotImplementedException();
        }

        public Task<List<PieceListing>> ListPiecesForUser()
        {
            throw new NotImplementedException();
        }

        public Task<List<PieceListing>> ListPiecesForUser(string userGuid)
        {
            throw new NotImplementedException();
        }

        public void SaveDrawings(string fileId, Drawings drawings)
        {
            _drawings[fileId] = drawings;
        }

        public void SaveImageUrl(string fileId, string imageUrl)
        {
            _imageUrls[fileId] = imageUrl;
        }

        public Task<int> SavePiece(PieceDto piece)
        {
            throw new NotImplementedException();
        }
    }
}
