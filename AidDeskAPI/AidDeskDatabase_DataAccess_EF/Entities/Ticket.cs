namespace AidDeskDatabase_DataAccess_EF.Entities;

public partial class Ticket
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? Priority { get; set; }
    public string? Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public Guid CreatedById { get; set; }
    public Guid? AssignedToId { get; set; }
    public virtual User? AssignedTo { get; set; }
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual User CreatedBy { get; set; } = null!;
    public virtual ICollection<TicketHistory> TicketHistories { get; set; } = new List<TicketHistory>();
}
