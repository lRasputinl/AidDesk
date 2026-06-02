using System.ComponentModel.DataAnnotations;

namespace AidDeskAPI.API.Tickets.DTO
{
    public class UpdateTicketStatusDTO
    {
        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = null!;
    }
}
