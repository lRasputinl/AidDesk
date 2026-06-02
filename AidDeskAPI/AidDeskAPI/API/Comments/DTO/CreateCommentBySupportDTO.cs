using System.ComponentModel.DataAnnotations;

namespace AidDeskAPI.API.Comments.DTO
{
    public class CreateCommentBySupportDTO
    {
        [Required]
        [MinLength(1)]
        [MaxLength(1000)]
        public string Text { get; set; } = null!;
        [Required]
        public string Type { get; set; } = null!;
    }
}
