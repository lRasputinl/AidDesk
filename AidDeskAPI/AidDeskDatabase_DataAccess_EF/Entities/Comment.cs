namespace AidDeskDatabase_DataAccess_EF.Entities;

public partial class Comment
{
    public Guid Id { get; set; }
    public string Text { get; set; } = null!;
    public string Type { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
    public Guid AuthorId { get; set; }
    public Guid TicketId { get; set; }
    public virtual User Author { get; set; } = null!;
    public virtual Ticket Ticket { get; set; } = null!;
}
