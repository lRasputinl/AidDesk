namespace AidDeskAPI.API.AuditLog.DTO
{
    public class AuditLogResponseDTO
    {
        public Guid Id { get; set; }
        public string Operation { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTimeOffset CreatedAt { get; set; }
        public Guid AuthorOfChangesId { get; set; }
        public Guid? TicketId { get; set; }
    }
}
