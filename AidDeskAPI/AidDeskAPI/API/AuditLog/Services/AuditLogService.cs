using AidDeskAPI.API.AuditLog.DTO;
using AidDeskDatabase_DataAccess_EF;
using Microsoft.EntityFrameworkCore;

namespace AidDeskAPI.API.AuditLog.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly AidDeskDbContext _dbContext;
        public AuditLogService(AidDeskDbContext aidDeskDbContext)
        {
            _dbContext = aidDeskDbContext;
        }

        public async Task LogAsync(string operation, string description, Guid authorOfChangesId, Guid? ticketId, CancellationToken cancellationToken)
        {
            var userExists = await _dbContext.Users.AnyAsync(x => x.Id == authorOfChangesId, cancellationToken);

            if (!userExists)
            {
                throw new InvalidOperationException($"Пользователь с id {authorOfChangesId} не найден.");
            }

            var newLog = new AidDeskDatabase_DataAccess_EF.Entities.AuditLog
            {
                Operation = operation,
                Description = description,
                CreatedAt = DateTimeOffset.UtcNow,
                AuthorOfChangesId = authorOfChangesId,
                TicketId = ticketId
            };

            await _dbContext.AuditLogs.AddAsync(newLog, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task<AuditLogResponseDTO[]> GetAllAuditLogsAsync(CancellationToken cancellationToken)
        {
            var logs = await _dbContext.AuditLogs.OrderByDescending(x => x.CreatedAt).Select(x => new AuditLogResponseDTO
            {
                Id = x.Id,
                Operation = x.Operation,
                Description = x.Description,
                CreatedAt = x.CreatedAt,
                AuthorOfChangesId = x.AuthorOfChangesId,
                TicketId = x.TicketId,
            }).ToArrayAsync(cancellationToken);

            return logs;
        }
    }
}
