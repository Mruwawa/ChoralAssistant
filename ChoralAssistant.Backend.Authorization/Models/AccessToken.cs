using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Authorization.Models
{
    public class AccessToken
    {
        public string Token { get; set; }
        public DateTime Expires { get; set; }
    }
}
