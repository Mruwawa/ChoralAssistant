using ChoralAssistant.Backend.Storage.Models;
using ChoralAssistant.Backend.Storage.Models.Dbo;
using ChoralAssistant.Storage.Models;

namespace ChoralAssistant.Storage.Infrastructure
{
    public interface ISqlRepository
    {
        public Task<int> SavePiece(PieceDto piece);
        public Task<List<PieceListing>> ListPiecesForUser(string userGuid);

        public Task<PieceDto> GetPiece(string userGuid, int pieceId);
        public Task DeletePiece(string userGuid, int pieceId);
        public Task UpdatePieceThumbnailUrl(string userGuid, int pieceId, string thumbnailUrl);
        public Task AddRecentPiece(string userGuid, int pieceId);
        public Task UpdateRecentPieces(string userGuid, int pieceId);
        public Task<List<RecentPieceListing>> ListRecentPieces(string userGuid);
        public Task DeleteRecentPieces(string userGuid, List<int> pieceIds);
    }
}
