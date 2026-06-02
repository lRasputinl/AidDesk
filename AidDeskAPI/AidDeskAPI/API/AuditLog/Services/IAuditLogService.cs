using AidDeskAPI.API.AuditLog.DTO;

namespace AidDeskAPI.API.AuditLog.Services
{
    public interface IAuditLogService
    {
        Task LogAsync(string operation, string description, Guid authorOfChangesId, Guid? ticketId, CancellationToken cancellationToken);
        Task<AuditLogResponseDTO[]> GetAllAuditLogsAsync(CancellationToken cancellationToken);
    }
}