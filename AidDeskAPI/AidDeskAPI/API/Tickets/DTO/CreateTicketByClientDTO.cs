using System.ComponentModel.DataAnnotations;

namespace AidDeskAPI.API.Tickets.DTO
{
    public class CreateTicketByClientDTO
    {
        [Required]
        [MinLength(1)]
        [MaxLength(150)]
        public string Title { get; set; } = null!;
        [Required]
        [MinLength(1)]
        [MaxLength(1000)]
        public string Description { get; set; } = null!;
    }
}
