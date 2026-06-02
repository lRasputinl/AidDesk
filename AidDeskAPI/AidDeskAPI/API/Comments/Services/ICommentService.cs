using AidDeskAPI.API.Comments.DTO;

namespace AidDeskAPI.API.Comments.Services
{
    public interface ICommentService
    {
        Task<CommentResponseDTO> CreateCommentByClientAsync(Guid userId, Guid ticketId, CreateCommentByClientDTO createCommentDTO, CancellationToken cancellationToken);
        Task<CommentResponseDTO> CreateCommentBySupportAsync(Guid userId, Guid ticketId, CreateCommentBySupportDTO createCommentDTO, CancellationToken cancellationToken);
        Task<CommentResponseDTO[]> GetCommentsByTicketIdAsync(Guid ticketId, string role, CancellationToken cancellationToken);
    }
}