namespace AidDeskAPI.API.Comments.DTO
{
    public class CommentResponseDTO
    {
        public Guid Id { get; set; }
        public string Text { get; set; } = null!;
        public string Type { get; set; } = null!;
        public DateTimeOffset CreatedAt { get; set; }
        public Guid AuthorId { get; set; }
        public Guid TicketId { get; set; }
    }
}
