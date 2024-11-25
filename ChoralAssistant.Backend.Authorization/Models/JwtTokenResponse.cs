using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Authorization.Models
{
    internal class JwtTokenResponse
    {
        public string? Token { get; set; }
        public UserInfo? UserInfo { get; set; }
    }
}
