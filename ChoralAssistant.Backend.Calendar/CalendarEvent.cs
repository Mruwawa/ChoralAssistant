using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChoralAssistant.Backend.Calendar
{
    public class CalendarEvent
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Location { get; set; }
        public List<Piece> Pieces { get; set; }
        public string Id { get; set; }
    }


    public class Piece 
    {
        public string Id { get; set; }
        public string Title { get; set; }
    }

    public static class PiecesExtensions
    {
        public static string ToString(this Piece piece)
        {
            return $"{piece.Id}|{piece.Title}";
        }
    }
}
