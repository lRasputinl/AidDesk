namespace AidDeskAPI.API.TicketHistory.DTO
{
    public class TicketHistoryDTO
    {
        public Guid Id { get; set; }
        public string OldStatus { get; set; } = null!;
        public string NewStatus { get; set; } = null!;
        public DateTimeOffset ChangedAt { get; set; }
        public Guid ChangedById { get; set; }
        public Guid TicketId { get; set; }
    }
}