using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Storage.Models
{
    internal record ThumbnailUrl
    {
        public required string Url { get; init; }
    }
}
