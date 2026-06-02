using AidDeskAPI.API.Tickets.DTO;

namespace AidDeskAPI.API.Tickets.Services
{
    public interface ITicketService
    {
        Task<TicketClientResponseDTO> CreateTicketByClientAsync(Guid userId, CreateTicketByClientDTO createTicketByClientDTO, CancellationToken cancellationToken);
        Task<TicketResponseDTO> CreateTicketBySupportAsync(Guid userId, CreateTicketBySupportDTO createTicketBySupportDTO, CancellationToken cancellationToken);
        Task DeleteTicketByIdAsync(Guid ticketId, Guid userId, CancellationToken cancellationToken);
        Task<IReadOnlyCollection<TicketResponseDTO>> GetAllTicketsAsync(CancellationToken cancellationToken);
        Task<TicketResponseDTO[]> GetAssignedTicketsAsync(Guid supportUserId, CancellationToken cancellationToken);
        Task<TicketResponseDTO> GetTicketByIdAsync(Guid ticketId, Guid userId, string role, CancellationToken cancellationToken);
        Task<TicketResponseDTO[]> GetTicketByUserIdAsync(Guid userId, CancellationToken cancellationToken);
        Task<TicketResponseDTO> UpdateTicketByIdAsync(Guid ticketId, Guid userId, UpdateTicketDTO updateTicketDTO, CancellationToken cancellationToken);
        Task<TicketResponseDTO> UpdateTicketStatusAsync(Guid ticketId, Guid userId, UpdateTicketStatusDTO dto, CancellationToken cancellationToken);
        Task<TicketResponseDTO> AssignTicketAsync(Guid ticketId, Guid managerId, AssignTicketDTO dto, CancellationToken cancellationToken);
    }
}
