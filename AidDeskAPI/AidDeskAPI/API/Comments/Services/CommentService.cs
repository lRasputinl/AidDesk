using AidDeskAPI.API.AuditLog.Services;
using AidDeskAPI.API.Auth.DTO;
using AidDeskAPI.API.Comments.DTO;
using AidDeskDatabase_DataAccess_EF;
using AidDeskDatabase_DataAccess_EF.Entities;
using Microsoft.EntityFrameworkCore;

namespace AidDeskAPI.API.Comments.Services
{
    public class CommentService : ICommentService
    {
        private readonly AidDeskDbContext _dbContext;
        private readonly IAuditLogService _auditLogService;

        public CommentService(AidDeskDbContext dbContext, IAuditLogService auditLogService)
        {
            _dbContext = dbContext;
            _auditLogService = auditLogService;
        }

        public async Task<CommentResponseDTO[]> GetCommentsByTicketIdAsync(Guid ticketId, string role, CancellationToken cancellationToken)
        {
            var ticketExists = await _dbContext.Tickets.AnyAsync(x => x.Id == ticketId, cancellationToken);

            if (!ticketExists)
            {
                throw new InvalidOperationException($"Заявка с id {ticketId} не найдена.");
            }

            var query = _dbContext.Comments.AsNoTracking().Where(x => x.TicketId == ticketId);

            if (role == Roles.Client)
            {
                query = query.Where(x => x.Type == "public" || x.Type == "Публичный");
            }

            var comments = await query.OrderBy(x => x.CreatedAt).Select(x => new CommentResponseDTO
            {
                Id = x.Id,
                Text = x.Text,
                Type = x.Type,
                CreatedAt = x.CreatedAt,
                AuthorId = x.AuthorId,
                TicketId = x.TicketId,
            }).ToArrayAsync(cancellationToken);

            return comments;
        }

        public async Task<CommentResponseDTO> CreateCommentByClientAsync(Guid userId, Guid ticketId, CreateCommentByClientDTO createCommentByClientDTO, CancellationToken cancellationToken)
        {
            var ticketExists = await _dbContext.Tickets.AnyAsync(x => x.Id == ticketId, cancellationToken);

            if (!ticketExists)
            {
                throw new InvalidOperationException($"Заявка с id {ticketId} не найдена.");
            }

            if (string.IsNullOrWhiteSpace(createCommentByClientDTO.Text))
            {
                throw new InvalidOperationException("Текст заявки не может быть пустым.");
            }

            var comment = new Comment
            {
                Text = createCommentByClientDTO.Text,
                Type = "public",
                CreatedAt = DateTimeOffset.UtcNow,
                AuthorId = userId,
                TicketId = ticketId,
            };

            await _dbContext.Comments.AddAsync(comment, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            var response = new CommentResponseDTO
            {
                Id = comment.Id,
                Text = comment.Text,
                Type = comment.Type,
                CreatedAt = comment.CreatedAt,
                AuthorId = comment.AuthorId,
                TicketId = comment.TicketId,
            };

            await _auditLogService.LogAsync("Создание комментария клиентом", response.Text, response.AuthorId, response.TicketId, cancellationToken);

            return response;
        }

        public async Task<CommentResponseDTO> CreateCommentBySupportAsync(Guid userId, Guid ticketId, CreateCommentBySupportDTO createCommentBySupportDTO, CancellationToken cancellationToken)
        {
            var ticketExists = await _dbContext.Tickets.AnyAsync(x => x.Id == ticketId, cancellationToken);

            if (!ticketExists)
            {
                throw new InvalidOperationException($"Заявка с id {ticketId} не найдена.");
            }

            if (string.IsNullOrWhiteSpace(createCommentBySupportDTO.Text))
            {
                throw new InvalidOperationException("Текст заявки не может быть пустым.");
            }

            if (createCommentBySupportDTO.Type != "Внутренний" && createCommentBySupportDTO.Type != "Публичный")
            {
                throw new InvalidOperationException("Неверно задан тип комментария.");
            }

            var comment = new Comment
            {
                Text = createCommentBySupportDTO.Text,
                Type = createCommentBySupportDTO.Type,
                CreatedAt = DateTimeOffset.UtcNow,
                AuthorId = userId,
                TicketId = ticketId,
            };

            await _dbContext.Comments.AddAsync(comment, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            var response = new CommentResponseDTO
            {
                Id = comment.Id,
                Text = comment.Text,
                Type = comment.Type,
                CreatedAt = comment.CreatedAt,
                AuthorId = comment.AuthorId,
                TicketId = comment.TicketId,
            };

            await _auditLogService.LogAsync("Создание комментария сотрудником", response.Text, response.AuthorId, response.TicketId, cancellationToken);

            return response;
        }
    }
}
