using ChoralAssistant.Backend.Authorization.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Authorization.Features.Authorization
{
    public interface IAccessTokenProvider 
    {
        Task<string> GetAccessToken();
    }
    internal class AccessTokenProvider
        (IUserAccessor _userAccessor, 
        HttpClient httpClient, 
        IHttpContextAccessor _httpContextAccessor,
        IJwtService _jwtService,
        IConfiguration _configuration
        ) : IAccessTokenProvider
    {
        public async Task<string> GetAccessToken()
        {
            var accessToken = _userAccessor.AccessToken;

            if(accessToken == null || accessToken.Expires < DateTime.UtcNow.AddMinutes(5))
            {
                var newToken = await RefreshAccessToken();

                return newToken.Token;
            }

            return accessToken.Token;
        }

        public async Task<AccessToken> RefreshAccessToken() 
        {
            var refreshToken = _userAccessor.RefreshToken;

            if(refreshToken == null)
            {
                return null;
            }

            var refreshTokenRequest = new
            {
                client_id = _configuration["GoogleOAuth:ClientId"] ?? throw new Exception("Google OAuth Cliend Id is missing!"),
                client_secret = _configuration["GoogleOAuth:ClientSecret"] ?? throw new Exception("Google OAuth Client Secret is missing!"),
                refresh_token = refreshToken,
                grant_type = "refresh_token"
            };

            var jsonPayload = JsonSerializer.Serialize(refreshTokenRequest);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync("https://oauth2.googleapis.com/token", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Error: {response.StatusCode}");
                Console.WriteLine($"Response: {errorContent}");
                return null;
            }

            var tokenResponse = await response.Content.ReadFromJsonAsync<RefreshTokenResponse>();

            if(tokenResponse == null)
            {
                return null;
            }

            var accessToken = new AccessToken()
            {
                Expires = DateTime.UtcNow.AddSeconds(100),
                Token = tokenResponse.AccessToken
            };

            var jwtToken = _jwtService.GenerateJwtToken(new UserInfo()
            {
                UserId = _userAccessor.UserId!,
                UserName = _userAccessor.UserName!,
                PhotoUrl = _userAccessor.PhotoUrl!,
                AccessToken = accessToken,
                RefreshToken = refreshToken
            });

            if (jwtToken == null)
            {
                return null;
            }

            _httpContextAccessor.HttpContext?.Response.Cookies.Append("AuthToken", jwtToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict
            });


            return accessToken;

        }
    }
}
