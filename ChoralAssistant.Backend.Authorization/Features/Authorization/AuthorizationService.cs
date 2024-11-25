using ChoralAssistant.Backend.Authorization.Models;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Authorization.Features.Authorization
{
    internal interface IAuthorizationService
    {
        Task<JwtTokenResponse> CreateToken(string token, AccessToken accessToken, string refreshToken);
        UserInfo GetUserInfo();
        Task<bool> IsTokenValid(string accessToken);

        Task<GoogleTokenResponse> GetAccessToken(string code);
    }

    internal class AuthorizationService(IJwtService _jwtService, IUserAccessor _userAccessor, HttpClient _httpClient, IConfiguration _configuration) : IAuthorizationService
    {
        public async Task<JwtTokenResponse> CreateToken(string idToken, AccessToken accessToken, string refreshToken)
        {
            try
            {
                if (string.IsNullOrEmpty(idToken))
                {
                    return new JwtTokenResponse();
                }

                var validatedToken = await GoogleJsonWebSignature.ValidateAsync(idToken);

                var jwtToken = _jwtService.GenerateJwtToken(
                    new UserInfo()
                    {
                        UserId = validatedToken.Subject,
                        PhotoUrl = validatedToken.Picture,
                        UserName = validatedToken.Name,
                        AccessToken = accessToken,
                        RefreshToken = refreshToken
                    });
                return new JwtTokenResponse
                {
                    Token = jwtToken,
                    UserInfo = new UserInfo()
                    {
                        UserId = validatedToken.Subject,
                        PhotoUrl = validatedToken.Picture,
                        UserName = validatedToken.Name,
                        AccessToken = accessToken,
                        RefreshToken = refreshToken
                    }
                };
            }
            catch
            {
                return new JwtTokenResponse();
            }
        }

        public async Task<GoogleTokenResponse> GetAccessToken(string code)
        {
            var tokenRequestPayload = new
            {
                code,
                client_id = _configuration["GoogleOAuth:ClientId"] ?? throw new Exception("Google OAuth Cliend Id is missing!"),
                client_secret = _configuration["GoogleOAuth:ClientSecret"] ?? throw new Exception("Google OAuth Client Secret is missing!"),
                redirect_uri = "postmessage",
                grant_type = "authorization_code"
            };

            // Serialize the payload to JSON
            var jsonPayload = JsonSerializer.Serialize(tokenRequestPayload);

            // Create the content as application/json
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var tokenResponse = await _httpClient.PostAsync("https://oauth2.googleapis.com/token", content);

            var googleTokenModel = await tokenResponse.Content.ReadFromJsonAsync<GoogleTokenResponse>();

            if (googleTokenModel == null)
            {
                return null;
            }
            return googleTokenModel;
        }

        public UserInfo GetUserInfo()
        {
            return new UserInfo()
            {
                UserId = _userAccessor.UserId ?? "",
                UserName = _userAccessor.UserName ?? "",
                PhotoUrl = _userAccessor.PhotoUrl ?? "",
                AccessToken = _userAccessor.AccessToken ?? null,
                RefreshToken = _userAccessor.RefreshToken ?? ""
            };
        }

        public async Task<bool> IsTokenValid(string accessToken)
        {
            var tokenResponse = await _httpClient.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={accessToken}");

            var tokenCheckResponse = await tokenResponse.Content.ReadFromJsonAsync<TokenCheckResponse>();

            if (tokenCheckResponse == null)
            {
                return false;
            }

            if (tokenCheckResponse.ExpiresIn < 0)
            {
                return false;
            }

            return true;
        }
    }
}
