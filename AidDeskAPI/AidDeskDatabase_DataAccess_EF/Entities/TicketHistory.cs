namespace AidDeskDatabase_DataAccess_EF.Entities;

public partial class TicketHistory
{
    public Guid Id { get; set; }
    public string OldStatus { get; set; } = null!;
    public string NewStatus { get; set; } = null!;
    public DateTimeOffset ChangedAt { get; set; }
    public Guid ChangedById { get; set; }
    public Guid TicketId { get; set; }
    public virtual User ChangedBy { get; set; } = null!;
    public virtual Ticket Ticket { get; set; } = null!;
}
