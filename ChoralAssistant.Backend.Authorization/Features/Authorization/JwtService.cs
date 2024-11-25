using ChoralAssistant.Backend.Authorization.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ChoralAssistant.Backend.Authorization.Features.Authorization
{
    internal interface IJwtService
    {
        string GenerateJwtToken(UserInfo userInfo);
    }
    internal class JwtService(IConfiguration _configuration) : IJwtService
    {
        public string GenerateJwtToken(UserInfo userInfo)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = _configuration["Jwt:Key"] ?? throw new ArgumentNullException("Jwt:Key");
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                new Claim("UserId", userInfo.UserId),
                new Claim("UserName", userInfo.UserName),
                new Claim("PhotoUrl", userInfo.PhotoUrl),
                new Claim("AccessToken_Value", userInfo.AccessToken.Token),
                new Claim("AccessToken_ExpiresTime", userInfo.AccessToken.Expires.ToString()),
                new Claim("RefreshToken", userInfo.RefreshToken)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
