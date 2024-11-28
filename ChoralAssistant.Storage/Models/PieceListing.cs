namespace ChoralAssistant.Storage.Models
{
    public record PieceListing
    {
        public required int PieceId { get; init; }
        public required string Title { get; init; }
        public required string ThumbnailUrl { get; init; }
    }
}
