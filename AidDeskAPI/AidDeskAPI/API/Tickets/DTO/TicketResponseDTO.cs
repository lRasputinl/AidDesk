namespace AidDeskAPI.API.Tickets.DTO
{
    public class TicketResponseDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Priority { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public Guid CreatedById { get; set; }
        public Guid? AssignedToId { get; set; }
    }
}
