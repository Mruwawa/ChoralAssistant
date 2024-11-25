namespace ChoralAssistant.Storage.Models
{
    internal class File
    {
        public required string Name { get; set; }
        public required Stream ContentStream { get; set; }
    }
}
