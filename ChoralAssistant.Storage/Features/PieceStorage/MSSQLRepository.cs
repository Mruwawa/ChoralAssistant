using ChoralAssistant.Storage.Infrastructure;
using ChoralAssistant.Storage.Models;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace ChoralAssistant.Storage.Features.PieceStorage
{
    internal class MSSQLRepository(IConfiguration _config) : ISqlRepository
    {
        private readonly string _connectionString = _config.GetConnectionString("DefaultConnection") ?? throw new Exception("Missing db connection string!");

        private IDbConnection Connection => new SqlConnection(_connectionString);
        public Drawings GetDrawings(string fileId)
        {
            using var conn = Connection;
            var res = conn.Query("");
            throw new NotImplementedException();
        }

        public void SaveDrawings(string fileId, Drawings drawings)
        {
            throw new NotImplementedException();
        }

        public void SaveImageUrl(string fileId, string imageUrl)
        {
            throw new NotImplementedException();
        }
    }
}
