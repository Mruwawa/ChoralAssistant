namespace ChoralAssistant.Storage.Models
{
    public record FileModel
    {
        public required string Name { get; set; }
        public required byte[] Content { get; set; }
        public required string MimeType { get; set; }
    }
}
