using AidDeskAPI.API.Auth.DTO;
using AidDeskAPI.API.TicketHistory.DTO;
using AidDeskAPI.API.Tickets.DTO;
using AidDeskDatabase_DataAccess_EF;
using Microsoft.EntityFrameworkCore;

namespace AidDeskAPI.API.TicketHistory.Services
{
    public class TicketHistoryService : ITicketHistoryService
    {
        private readonly AidDeskDbContext _dbcontext;

        public TicketHistoryService(AidDeskDbContext dbContext)
        {
            _dbcontext = dbContext;
        }

        public async Task<TicketHistoryDTO> CreateNewTicketHistoryAsync(Guid ticketId, string oldStatus, string newStatus, Guid changedById, CancellationToken cancellationToken)
        {
            var ticketExists = await _dbcontext.Tickets.AnyAsync(x => x.Id == ticketId, cancellationToken);

            if (!ticketExists)
            {
                throw new InvalidOperationException($"Заявка с id {ticketId} не найдена.");
            }

            var allowedStatuses = new[]
            {
                TicketStatuses.Waiting,
                TicketStatuses.InProgress,
                TicketStatuses.Done
            };

            if (string.IsNullOrWhiteSpace(oldStatus) || string.IsNullOrWhiteSpace(newStatus))
            {
                throw new InvalidOperationException("Введён некорректный статус.");
            }

            if (!allowedStatuses.Contains(oldStatus) || !allowedStatuses.Contains(newStatus))
            {
                throw new InvalidOperationException("Введён некорректный статус.");
            }

            if (oldStatus == newStatus)
            {
                throw new InvalidOperationException("Статус заявки не изменился.");
            }

            var record = new AidDeskDatabase_DataAccess_EF.Entities.TicketHistory
            {
                TicketId = ticketId,
                OldStatus = oldStatus,
                NewStatus = newStatus,
                ChangedById = changedById,
                ChangedAt = DateTimeOffset.UtcNow
            };

            await _dbcontext.TicketHistories.AddAsync(record, cancellationToken);
            await _dbcontext.SaveChangesAsync(cancellationToken);

            var response = new TicketHistoryDTO
            {
                Id = record.Id,
                TicketId = record.TicketId,
                OldStatus = record.OldStatus,
                NewStatus = record.NewStatus,
                ChangedById = record.ChangedById,
                ChangedAt = record.ChangedAt,
            };

            return response;
        }

        public async Task<TicketHistoryDTO[]> GetAllTicketHistoryAsync(Guid ticketId, Guid userId, string role, CancellationToken cancellationToken)
        {
            var ticket = await _dbcontext.Tickets.AsNoTracking().FirstOrDefaultAsync(x => x.Id == ticketId, cancellationToken);

            if (ticket is null)
            {
                throw new InvalidOperationException($"Заявка с id {ticketId} не найдена.");
            }

            if (role == Roles.Client && ticket.CreatedById != userId)
            {
                throw new UnauthorizedAccessException("У вас нет доступа к этой заявке.");
            }

            var ticketHistory = await _dbcontext.TicketHistories.AsNoTracking().Where(x => x.TicketId == ticketId).OrderByDescending(x => x.ChangedAt).Select(x => new TicketHistoryDTO
            {
                Id = x.Id,
                OldStatus = x.OldStatus,
                NewStatus = x.NewStatus,
                ChangedById = x.ChangedById,
                ChangedAt = x.ChangedAt,
                TicketId = x.TicketId
            }).ToArrayAsync(cancellationToken);

            return ticketHistory;
        }
    }
}
