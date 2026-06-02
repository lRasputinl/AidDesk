using System.ComponentModel.DataAnnotations;

namespace AidDeskAPI.API.Users.DTO
{
    public class ChangePasswordDTO
    {
        [Required]
        public string CurrentPassword { get; set; } = null!;

        [Required]
        [MinLength(6)]
        [MaxLength(100)]
        public string NewPassword { get; set; } = null!;
    }
}
