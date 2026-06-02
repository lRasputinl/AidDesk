namespace AidDeskDatabase_DataAccess_EF.Entities;

public partial class AuditLog
{
    public Guid Id { get; set; }
    public string Operation { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
    public Guid AuthorOfChangesId { get; set; }
    public Guid? TicketId { get; set; }
    public virtual User AuthorOfChanges { get; set; } = null!;
    public virtual Ticket? Ticket { get; set; }
}
