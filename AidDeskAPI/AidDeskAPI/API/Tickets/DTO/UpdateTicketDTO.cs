using System.ComponentModel.DataAnnotations;

namespace AidDeskAPI.API.Tickets.DTO
{
    public class UpdateTicketDTO
    {
        [Required]
        [MinLength(1)]
        [MaxLength(150)]
        public string Title { get; set; } = null!;
        [Required]
        [MinLength(1)]
        [MaxLength(1000)]
        public string Description { get; set; } = null!;
        [MaxLength(20)]
        public string Priority { get; set; } = null!;
        [MaxLength(30)]
        public string Status { get; set; } = null!;
        [Required]
        public Guid? AssignedToId { get; set; }
    }
}
