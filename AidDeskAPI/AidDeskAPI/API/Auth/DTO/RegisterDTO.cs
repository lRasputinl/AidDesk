using System.ComponentModel.DataAnnotations;

namespace AidDeskAPI.API.Auth.DTO
{
    public class RegisterDTO
    {
        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = null!;
        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = null!;
        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = null!;
        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = null!;
        [Required]
        public string Password { get; set; } = null!;
    }
}
