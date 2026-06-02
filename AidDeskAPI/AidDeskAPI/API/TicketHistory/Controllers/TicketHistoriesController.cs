using AidDeskAPI.API.TicketHistory.DTO;
using AidDeskAPI.API.TicketHistory.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AidDeskAPI.API.TicketHistory.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketHistoriesController(ITicketHistoryService ticketHistoryService) : ControllerBase
    {
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<TicketHistoryDTO[]>> GetAllTicketHistory(Guid ticketId, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            var ticketHistory = await ticketHistoryService.GetAllTicketHistoryAsync(ticketId, userId, role, cancellationToken);

            if (ticketHistory.Length == 0)
            {
                return Ok(Array.Empty<TicketHistoryDTO>());
            }

            return Ok(ticketHistory);
        }
    }
}
