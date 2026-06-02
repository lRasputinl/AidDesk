using AidDeskAPI.API.AuditLog.DTO;
using AidDeskAPI.API.AuditLog.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AidDeskAPI.API.AuditLog.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditLogsController(IAuditLogService auditLogService) : ControllerBase
    {
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<AuditLogResponseDTO[]>> GetAllAuditLogs(CancellationToken cancellationToken)
        {
            var auditLogs = await auditLogService.GetAllAuditLogsAsync(cancellationToken);

            if (auditLogs.Length == 0)
            {
                return Ok(Array.Empty<AuditLogResponseDTO>());
            }

            return Ok(auditLogs);
        }
    }
}   