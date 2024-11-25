using ChoralAssistant.Storage.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Storage.Infrastructure
{
    internal interface ISqlRepository
    {
        public Drawings GetDrawings(string fileId);
        public void SaveDrawings(string fileId, Drawings drawings);
        public void SaveImageUrl(string fileId, string imageUrl);
    }
}
