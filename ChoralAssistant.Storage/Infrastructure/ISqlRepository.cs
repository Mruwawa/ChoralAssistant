using ChoralAssistant.Backend.Storage.Models.Dbo;
using ChoralAssistant.Storage.Models;

namespace ChoralAssistant.Storage.Infrastructure
{
    internal interface ISqlRepository
    {
        public Task<int> SavePiece(PieceDto piece);
        public Task<List<PieceListing>> ListPiecesForUser(string userGuid);

        public Task<PieceDto> GetPiece(string userGuid, int pieceId);
        public Task DeletePiece(string userGuid, int pieceId);
    }
}
