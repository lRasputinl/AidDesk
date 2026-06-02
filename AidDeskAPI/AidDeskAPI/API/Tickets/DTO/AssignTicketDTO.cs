using System.ComponentModel.DataAnnotations;

namespace AidDeskAPI.API.Tickets.DTO
{
    public class AssignTicketDTO
    {
        public Guid? AssignedToId { get; set; }

        [MaxLength(20)]
        public string? Priority { get; set; }
    }
}
