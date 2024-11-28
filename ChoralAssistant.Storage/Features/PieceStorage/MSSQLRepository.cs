using ChoralAssistant.Backend.Storage.Models.Dbo;
using ChoralAssistant.Storage.Infrastructure;
using ChoralAssistant.Storage.Models;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Globalization;

namespace ChoralAssistant.Storage.Features.PieceStorage
{
    internal class MSSQLRepository : ISqlRepository
    {
        private readonly string _connectionString;

        public MSSQLRepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection") ?? throw new Exception("Missing db connection string!");
            CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;
        }

        private SqlConnection GetConnection() => new SqlConnection(_connectionString);

        public async Task<int> SavePiece(PieceDto piece)
        {
            using var connection = GetConnection();
            var query = @"INSERT INTO 
                            Pieces (Title, Description, AudioUrl, ThumbnailUrl, OwnerUserGuid, StorageFolderGuid, PageCount, Type)
                            OUTPUT INSERTED.PieceId
                            VALUES (@Title, @Description, @AudioUrl, @ThumbnailUrl, @OwnerUserGuid, @StorageFolderGuid, @PageCount, @Type)";

            var pieceId = await connection.QuerySingleAsync<int>(query, piece, commandType: CommandType.Text);
            return pieceId;
        }

        public async Task<List<PieceListing>> ListPiecesForUser(string userGuid)
        {
            using var connection = GetConnection();
            var query = @"SELECT PieceId, Title, ThumbnailUrl 
                        FROM Pieces
                        WHERE OwnerUserGuid = @UserGuid";
            var result = await connection.QueryAsync<PieceListing>(query, new { UserGuid = userGuid }, commandType: CommandType.Text);
            return result.ToList();
        }

        public async Task<PieceDto> GetPiece(string userGuid, int pieceId)
        {
            using var connection = GetConnection();
            var query = @"SELECT PieceId, Title, ThumbnailUrl, Description, AudioUrl, OwnerUserGuid, StorageFolderGuid, PageCount, Type
                        FROM Pieces
                        WHERE OwnerUserGuid = @UserGuid
                        AND PieceId = @PieceId";
            var result = await connection.QuerySingleAsync<PieceDto>(query, new { UserGuid = userGuid, PieceId = pieceId }, commandType: CommandType.Text);
            return result;
        }

        public async Task DeletePiece(string userGuid, int pieceId)
        {
            using var connection = GetConnection();
            var query = @"DELETE
                        FROM Pieces
                        WHERE OwnerUserGuid = @UserGuid
                        AND PieceId = @PieceId";
            await connection.QuerySingleAsync<PieceDto>(query, new { UserGuid = userGuid, PieceId = pieceId }, commandType: CommandType.Text);
        }

        public async Task UpdatePieceThumbnailUrl(string userGuid, int pieceId, string thumbnailUrl)
        {
            using var connection = GetConnection();
            var query = @"UPDATE Pieces
                        SET ThumbnailUrl = @ThumbnailUrl
                        WHERE OwnerUserGuid = @UserGuid
                        AND PieceId = @PieceId";
            await connection.ExecuteAsync(query, new { UserGuid = userGuid, PieceId = pieceId, ThumbnailUrl = thumbnailUrl }, commandType: CommandType.Text);
        }
    }
}
