using System.ComponentModel.DataAnnotations;

namespace AidDeskAPI.API.Users.DTO
{
    public class ChangeUserRoleDTO
    {
        [Required]
        public string Role { get; set; } = null!;
    }
}
