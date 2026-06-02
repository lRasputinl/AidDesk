namespace AidDeskDatabase_DataAccess_EF.Entities;

public partial class User
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Role { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<Ticket> TicketAssignedTos { get; set; } = new List<Ticket>();
    public virtual ICollection<Ticket> TicketCreatedBies { get; set; } = new List<Ticket>();
    public virtual ICollection<TicketHistory> TicketHistories { get; set; } = new List<TicketHistory>();
}
