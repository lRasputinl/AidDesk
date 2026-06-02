using System.ComponentModel.DataAnnotations;

namespace AidDeskAPI.API.Auth.DTO
{
    public class LoginDTO
    {
        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = null!;
        [Required]
        [MinLength(6)]
        [MaxLength(100)]
        public string Password { get; set; } = null!;
    }
}
