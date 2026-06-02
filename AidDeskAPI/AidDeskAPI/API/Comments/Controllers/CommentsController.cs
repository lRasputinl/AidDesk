using AidDeskAPI.API.Comments.DTO;
using AidDeskAPI.API.Comments.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AidDeskAPI.API.Comments.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController(ICommentService commentService) : ControllerBase
    {
        [Authorize]
        [Route("{ticketId}")]
        [HttpGet]
        public async Task<ActionResult<CommentResponseDTO[]>> GetCommentsByTicketId(Guid ticketId, CancellationToken cancellationToken)
        {
            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var comments = await commentService.GetCommentsByTicketIdAsync(ticketId, role, cancellationToken);
            return Ok(comments.Length == 0 ? Array.Empty<CommentResponseDTO>() : comments);
        }

        [Authorize(Roles = "Client")]
        [HttpPost("client")]
        public async Task<ActionResult> CreateCommentByClient(Guid ticketId, [FromBody] CreateCommentByClientDTO createCommentDTO, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var newComment = await commentService.CreateCommentByClientAsync(userId, ticketId, createCommentDTO, cancellationToken);
            return CreatedAtAction(nameof(GetCommentsByTicketId), new { ticketId = newComment.TicketId }, newComment);
        }

        [Authorize(Roles = "Support,Manager,Admin")]
        [HttpPost("support")]
        public async Task<ActionResult> CreateCommentByStaff(Guid ticketId, [FromBody] CreateCommentBySupportDTO createCommentDTO, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var newComment = await commentService.CreateCommentBySupportAsync(userId, ticketId, createCommentDTO, cancellationToken);
            return CreatedAtAction(nameof(GetCommentsByTicketId), new { ticketId = newComment.TicketId }, newComment);
        }
    }
}
