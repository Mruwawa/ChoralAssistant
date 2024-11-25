using ChoralAssistant.Backend.Authorization.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Authorization.Features.Authorization
{
    public interface IUserAccessor
    {
        string? UserId { get; }
        string? UserName { get; }
        string? PhotoUrl { get; }
        AccessToken? AccessToken { get; }
        public string RefreshToken { get; }
    }
    internal class JwtUserAccessor(IHttpContextAccessor _httpContextAccessor) : IUserAccessor
    {
        public string? UserId
        {
            get
            {
                var claims = _httpContextAccessor.HttpContext?.User.Claims;
                var claim = claims?.FirstOrDefault(x => x.Type == "UserId");

                return claim?.Value;
            }
        }

        public string? UserName
        {
            get
            {
                var claims = _httpContextAccessor.HttpContext?.User.Claims;
                var claim = claims?.FirstOrDefault(x => x.Type == "UserName");

                return claim?.Value;
            }
        }

        public string? PhotoUrl
        {
            get
            {
                var claims = _httpContextAccessor.HttpContext?.User.Claims;
                var claim = claims?.FirstOrDefault(x => x.Type == "PhotoUrl");

                return claim?.Value;
            }
        }

        public AccessToken? AccessToken
        {
            get
            {
                var claims = _httpContextAccessor.HttpContext?.User.Claims;
                var accessToken = claims?.FirstOrDefault(x => x.Type == "AccessToken_Value")?.Value ?? "";
                var expiresIn = claims?.FirstOrDefault(x => x.Type == "AccessToken_ExpiresTime")?.Value ?? "";

                if (string.IsNullOrEmpty(accessToken) || !DateTime.TryParse(expiresIn, out var expires)) {
                    return null;
                }

                return new AccessToken() 
                {
                    Token = accessToken,
                    Expires = expires
                };
            }
        }

        public string RefreshToken
        {
            get
            {
                var claims = _httpContextAccessor.HttpContext?.User.Claims;
                var claim = claims?.FirstOrDefault(x => x.Type == "RefreshToken");

                return claim?.Value;
            }
        }

        //Subject = new ClaimsIdentity(new Claim[]
        //        {
        //        new Claim("UserId", userInfo.UserId),
        //        new Claim("UserName", userInfo.UserName),
        //        new Claim("PhotoUrl", userInfo.PhotoUrl),
        //        new Claim("AccessToken_Value", userInfo.AccessToken.Token),
        //        new Claim("AccessToken_ExpiresTime", userInfo.AccessToken.Expires.ToString()),
        //        new Claim("RefreshToken", userInfo.RefreshToken)
        //        }),
    }
}
