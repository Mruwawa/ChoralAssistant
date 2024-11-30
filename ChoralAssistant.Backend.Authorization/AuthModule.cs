using ChoralAssistant.Backend.Authorization.Features.Authorization;
using ChoralAssistant.Backend.Authorization.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Net.Http.Json;
using System.Text;

namespace ChoralAssistant.Backend.Authorization
{
    public static class AuthModule
    {
        public static void AddAuthModule(this IServiceCollection services, IConfiguration configuration)
        {
            var encryptionKey = configuration["Jwt:Key"] ?? throw new ArgumentNullException("Jwt:Key");

            services.AddTransient<IAuthorizationService, AuthorizationService>();
            services.AddTransient<IJwtService, JwtService>();
            services.AddTransient<IUserAccessor, JwtUserAccessor>();
            services.AddTransient<IAccessTokenProvider, AccessTokenProvider>();
            services.AddHttpContextAccessor();
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(x =>
                {
                    x.RequireHttpsMetadata = false;
                    x.SaveToken = true;
                    x.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(encryptionKey)),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                    };

                    x.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            context.Token = context.Request.Cookies["AuthToken"];
                            return Task.CompletedTask;
                        }
                    };
                });
        }

        public static void RegisterAuthEndpoints(this IEndpointRouteBuilder routes)
        {
            routes.MapPost(
                "/api/user/google-sign-in",
                async (HttpContext context, IAuthorizationService authService) =>
                {
                    var request = await context.Request.ReadFromJsonAsync<CodeRequest>();

                    var googleToken = await authService.GetAccessToken(request.Code);

                    var jwtToken = await authService.CreateToken(googleToken.IdToken, new AccessToken()
                    {
                        Token = googleToken.AccessToken,
                        Expires = DateTime.UtcNow.AddSeconds(100)
                    }, googleToken.RefreshToken);

                    if (!string.IsNullOrEmpty(jwtToken.Token))
                    {
                        context.Response.Cookies.Append("AuthToken", jwtToken.Token, new CookieOptions
                        {
                            HttpOnly = true,
                            Secure = true,
                            SameSite = SameSiteMode.Strict
                        });

                        context.Response.StatusCode = StatusCodes.Status200OK;

                        await context.Response.WriteAsJsonAsync(new
                        {
                            userId = jwtToken.UserInfo.UserId,
                            userName = jwtToken.UserInfo.UserName,
                            userPhotoUrl = jwtToken.UserInfo.PhotoUrl
                        });
                    }
                    else
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    }
                });

            routes.MapPost(
                "/api/user/logout",
                (HttpContext context) => { context.Response.Cookies.Delete("AuthToken"); }).RequireAuthorization();

            routes.MapGet(
                "/api/user/user-info",
                async (HttpContext context, IAuthorizationService service) =>
                {
                    var userInfo = service.GetUserInfo();

                    if(string.IsNullOrEmpty(userInfo.UserId))
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return;
                    }

                    await context.Response.WriteAsJsonAsync(new
                    {
                        isAuthorized = !string.IsNullOrEmpty(userInfo.UserId),
                        userId = userInfo.UserId,
                        userName = userInfo.UserName,
                        userPhotoUrl = userInfo.PhotoUrl
                    });
                }).RequireAuthorization();
        }
    }
}
