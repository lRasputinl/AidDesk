using AidDeskAPI.API.TicketHistory.DTO;

namespace AidDeskAPI.API.TicketHistory.Services
{
    public interface ITicketHistoryService
    {
        Task<TicketHistoryDTO> CreateNewTicketHistoryAsync(Guid ticketId, string oldStatus, string newStatus, Guid changedById, CancellationToken cancellationToken);
        Task<TicketHistoryDTO[]> GetAllTicketHistoryAsync(Guid ticketId, Guid userId, string role, CancellationToken cancellationToken);
    }
}