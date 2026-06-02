using System.ComponentModel.DataAnnotations;

namespace AidDeskAPI.API.Users.DTO
{
    public class UpdateUserDTO
    {
        [Required]
        [MinLength(1)]
        [MaxLength(50)]
        public string FirstName { get; set; } = null!;
        [Required]
        [MinLength(1)]
        [MaxLength(50)]
        public string LastName { get; set; } = null!;
        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = null!;
        [Required]
        [Phone]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = null!;
    }
}
