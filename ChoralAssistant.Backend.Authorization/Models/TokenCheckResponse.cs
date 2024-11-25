using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Authorization.Models
{
    public class TokenCheckResponse
    {
        public int Expires { get; set; }
        public int ExpiresIn { get; set; }
    }
}
