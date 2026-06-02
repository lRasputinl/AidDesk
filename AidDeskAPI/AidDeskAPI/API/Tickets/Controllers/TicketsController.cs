using AidDeskAPI.API.Tickets.DTO;
using AidDeskAPI.API.Tickets.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AidDeskAPI.API.Tickets.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController(ITicketService ticketService) : ControllerBase
    {
        [Authorize(Roles = "Manager,Admin")]
        [HttpGet]
        public async Task<ActionResult<TicketResponseDTO[]>> GetAllTickets(CancellationToken cancellationToken)
        {
            var tickets = await ticketService.GetAllTicketsAsync(cancellationToken);
            return Ok(tickets);
        }

        [Authorize(Roles = "Support")]
        [HttpGet("assigned")]
        public async Task<ActionResult<TicketResponseDTO[]>> GetAssignedTickets(CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var tickets = await ticketService.GetAssignedTicketsAsync(userId, cancellationToken);
            return Ok(tickets);
        }

        [Authorize]
        [HttpGet("{ticketId:guid}")]
        public async Task<ActionResult<TicketResponseDTO>> GetTicketById(Guid ticketId, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var ticket = await ticketService.GetTicketByIdAsync(ticketId, userId, role, cancellationToken);
            return Ok(ticket);
        }

        [Authorize]
        [HttpGet("my")]
        public async Task<ActionResult<TicketResponseDTO[]>> GetTicketByUserId(CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var tickets = await ticketService.GetTicketByUserIdAsync(userId, cancellationToken);
            return Ok(tickets);
        }

        [Authorize(Roles = "Client")]
        [HttpPost]
        public async Task<ActionResult> CreateTicketByClient(CreateTicketByClientDTO createTicketByClientDTO, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var newTicket = await ticketService.CreateTicketByClientAsync(userId, createTicketByClientDTO, cancellationToken);
            return CreatedAtAction(nameof(GetTicketById), new { ticketId = newTicket.Id }, newTicket);
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpPost("manager")]
        public async Task<ActionResult> CreateTicketByManager(CreateTicketBySupportDTO createTicketBySupportDTO, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var newTicket = await ticketService.CreateTicketBySupportAsync(userId, createTicketBySupportDTO, cancellationToken);
            return CreatedAtAction(nameof(GetTicketById), new { ticketId = newTicket.Id }, newTicket);
        }

        [Authorize(Roles = "Support")]
        [HttpPatch("{ticketId:guid}/status")]
        public async Task<ActionResult> UpdateTicketStatus(Guid ticketId, [FromBody] UpdateTicketStatusDTO dto, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await ticketService.UpdateTicketStatusAsync(ticketId, userId, dto, cancellationToken);
            return NoContent();
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpPatch("{ticketId:guid}/assign")]
        public async Task<ActionResult> AssignTicket(Guid ticketId, [FromBody] AssignTicketDTO dto, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await ticketService.AssignTicketAsync(ticketId, userId, dto, cancellationToken);
            return NoContent();
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpPut]
        public async Task<ActionResult> UpdateTicket(Guid ticketId, UpdateTicketDTO updateTicketDTO, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await ticketService.UpdateTicketByIdAsync(ticketId, userId, updateTicketDTO, cancellationToken);
            return NoContent();
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpDelete]
        public async Task<ActionResult> DeleteTicket(Guid ticketId, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await ticketService.DeleteTicketByIdAsync(ticketId, userId, cancellationToken);
            return NoContent();
        }
    }
}
