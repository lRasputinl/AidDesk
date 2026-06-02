using AidDeskAPI.API.AuditLog.Services;
using AidDeskAPI.API.Auth.DTO;
using AidDeskAPI.API.TicketHistory.Services;
using AidDeskAPI.API.Tickets.DTO;
using AidDeskDatabase_DataAccess_EF;
using AidDeskDatabase_DataAccess_EF.Entities;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace AidDeskAPI.API.Tickets.Services
{
    public class TicketService : ITicketService
    {
        private readonly AidDeskDbContext _dbContext;
        private readonly ITicketHistoryService _ticketHistoryService;
        private readonly IAuditLogService _auditLogService;

        private readonly static string[] allowedStatuses = 
        [
            TicketStatuses.Waiting,
            TicketStatuses.InProgress,
            TicketStatuses.Done
        ];

        private readonly static string[] allowedPriorities =
        [
            TicketPriorities.Low,
            TicketPriorities.Medium,
            TicketPriorities.High,
        ];

        private bool IsValidStatus(string status)
        {
            return allowedStatuses.Contains(status);
        }

        private bool IsValidPriority(string priority)
        {
            return allowedPriorities.Contains(priority);
        }

        public TicketService(AidDeskDbContext dbContext, ITicketHistoryService ticketHistoryService, IAuditLogService auditLogService)
        {
            _dbContext = dbContext;
            _ticketHistoryService = ticketHistoryService;
            _auditLogService = auditLogService;
        }

        public async Task<TicketResponseDTO> CreateTicketBySupportAsync(Guid userId, CreateTicketBySupportDTO createTicketBySupportDTO, CancellationToken cancellationToken)
        {
            var userExists = await _dbContext.Users.AnyAsync(x => x.Id == userId, cancellationToken);

            if (!userExists)
            {
                throw new InvalidOperationException($"Пользователь с id {userId} не найден.");
            }

            if (string.IsNullOrWhiteSpace(createTicketBySupportDTO.Title) || string.IsNullOrWhiteSpace(createTicketBySupportDTO.Description))
            {
                throw new InvalidOperationException("Некорректное заполнение полей.");
            }

            if (string.IsNullOrWhiteSpace(createTicketBySupportDTO.Status) || !IsValidStatus(createTicketBySupportDTO.Status))
            {
                throw new InvalidOperationException("Введён некорректный статус.");
            }

            if (string.IsNullOrWhiteSpace(createTicketBySupportDTO.Priority) || !IsValidPriority(createTicketBySupportDTO.Priority))
            {
                throw new InvalidOperationException("Введён некорректный приоритет.");
            }

            if (createTicketBySupportDTO.AssignedToId.HasValue)
            {
                var assignedUser = await _dbContext.Users.SingleOrDefaultAsync(x => x.Id == createTicketBySupportDTO.AssignedToId, cancellationToken);

                if (assignedUser == null)
                {
                    throw new InvalidOperationException($"Пользователь с id {createTicketBySupportDTO.AssignedToId} не найден.");
                }

                if (assignedUser.Role != Roles.Support)
                {
                    throw new InvalidOperationException("Назначить заявку сотруднику можно только пользователю с ролью Support.");
                }
            }

            Guid createdForId = userId;
            if (createTicketBySupportDTO.CreatedForClientId.HasValue)
            {
                var clientUser = await _dbContext.Users.SingleOrDefaultAsync(x => x.Id == createTicketBySupportDTO.CreatedForClientId, cancellationToken);

                if (clientUser == null)
                {
                    throw new InvalidOperationException($"Клиент с id {createTicketBySupportDTO.CreatedForClientId} не найден.");
                }

                if (clientUser.Role != Roles.Client)
                {
                    throw new InvalidOperationException("Поле 'Клиент' должно содержать пользователя с ролью Client.");
                }

                createdForId = clientUser.Id;
            }

            var ticket = new Ticket
            {
                Title = createTicketBySupportDTO.Title,
                Description = createTicketBySupportDTO.Description,
                Priority = createTicketBySupportDTO.Priority,
                Status = createTicketBySupportDTO.Status,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                CreatedById = createdForId,
                AssignedToId = createTicketBySupportDTO.AssignedToId,
            };

            await _dbContext.Tickets.AddAsync(ticket, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            var response = new TicketResponseDTO
            {
                Id = ticket.Id,
                Title = ticket.Title,
                Description = ticket.Description,
                Priority = ticket.Priority,
                Status = ticket.Status,
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
                CreatedById = ticket.CreatedById,
                AssignedToId = ticket.AssignedToId,
            };

            await _auditLogService.LogAsync("Создание", $"Создание новой заявки {response.Title} сотрудником", response.CreatedById, response.Id, cancellationToken);

            return response;
        }

        public async Task<TicketClientResponseDTO> CreateTicketByClientAsync(Guid userId, CreateTicketByClientDTO createTicketByClientDTO, CancellationToken cancellationToken)
        {
            var userExists = await _dbContext.Users.AnyAsync(x => x.Id == userId, cancellationToken);

            if (!userExists)
            {
                throw new InvalidOperationException($"Пользователь с id {userId} не найден.");
            }

            if (string.IsNullOrWhiteSpace(createTicketByClientDTO.Title) || string.IsNullOrWhiteSpace(createTicketByClientDTO.Description))
            {
                throw new InvalidOperationException("Некорректное заполнение полей.");
            }

            var ticket = new Ticket
            {
                Title = createTicketByClientDTO.Title,
                Description = createTicketByClientDTO.Description,
                Priority = TicketPriorities.Low,
                Status = TicketStatuses.Waiting,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                CreatedById = userId,
            };

            await _dbContext.Tickets.AddAsync(ticket, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            var response = new TicketClientResponseDTO
            {
                Id = ticket.Id,
                Title = ticket.Title,
                Description = ticket.Description,
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
            };

            await _auditLogService.LogAsync("Создание", $"Создание новой заявки {response.Title} клиентом", userId, response.Id, cancellationToken);

            return response;
        }

        public async Task<TicketResponseDTO[]> GetAssignedTicketsAsync(Guid supportUserId, CancellationToken cancellationToken)
        {
            var tickets = await _dbContext.Tickets
                .AsNoTracking()
                .Where(x => x.AssignedToId == supportUserId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new TicketResponseDTO
                {
                    Id = x.Id,
                    Title = x.Title,
                    Description = x.Description,
                    Priority = x.Priority,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                    CreatedById = x.CreatedById,
                    AssignedToId = x.AssignedToId,
                }).ToArrayAsync(cancellationToken);

            return tickets;
        }

        public async Task<TicketResponseDTO> UpdateTicketStatusAsync(Guid ticketId, Guid userId, UpdateTicketStatusDTO dto, CancellationToken cancellationToken)
        {
            var ticket = await _dbContext.Tickets.SingleOrDefaultAsync(x => x.Id == ticketId, cancellationToken);

            if (ticket == null)
                throw new InvalidOperationException($"Заявка с id {ticketId} не найдена.");

            if (ticket.AssignedToId != userId)
                throw new InvalidOperationException("Вы можете изменять статус только назначенных вам заявок.");

            if (string.IsNullOrWhiteSpace(dto.Status) || !IsValidStatus(dto.Status))
                throw new InvalidOperationException("Введён некорректный статус.");

            var oldStatus = ticket.Status;
            ticket.Status = dto.Status;
            ticket.UpdatedAt = DateTimeOffset.UtcNow;

            await _dbContext.SaveChangesAsync(cancellationToken);

            if (oldStatus != ticket.Status)
                await _ticketHistoryService.CreateNewTicketHistoryAsync(ticketId, oldStatus, ticket.Status, userId, cancellationToken);

            var response = new TicketResponseDTO
            {
                Id = ticket.Id,
                Title = ticket.Title,
                Description = ticket.Description,
                Priority = ticket.Priority,
                Status = ticket.Status,
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
                CreatedById = ticket.CreatedById,
                AssignedToId = ticket.AssignedToId,
            };

            await _auditLogService.LogAsync("Изменение статуса", $"Статус заявки \"{ticket.Title}\" изменён на {ticket.Status}", userId, ticket.Id, cancellationToken);

            return response;
        }

        public async Task<TicketResponseDTO> AssignTicketAsync(Guid ticketId, Guid managerId, AssignTicketDTO dto, CancellationToken cancellationToken)
        {
            var ticket = await _dbContext.Tickets.SingleOrDefaultAsync(x => x.Id == ticketId, cancellationToken);

            if (ticket == null)
                throw new InvalidOperationException($"Заявка с id {ticketId} не найдена.");

            if (dto.AssignedToId.HasValue)
            {
                var assignee = await _dbContext.Users.SingleOrDefaultAsync(x => x.Id == dto.AssignedToId, cancellationToken);
                if (assignee == null)
                    throw new InvalidOperationException($"Пользователь с id {dto.AssignedToId} не найден.");
                if (assignee.Role != Roles.Support)
                    throw new InvalidOperationException("Назначить заявку можно только сотруднику с ролью Support.");
            }

            if (!string.IsNullOrWhiteSpace(dto.Priority) && !IsValidPriority(dto.Priority))
                throw new InvalidOperationException("Введён некорректный приоритет.");

            ticket.AssignedToId = dto.AssignedToId;
            if (!string.IsNullOrWhiteSpace(dto.Priority))
                ticket.Priority = dto.Priority;
            ticket.UpdatedAt = DateTimeOffset.UtcNow;

            await _dbContext.SaveChangesAsync(cancellationToken);

            var response = new TicketResponseDTO
            {
                Id = ticket.Id,
                Title = ticket.Title,
                Description = ticket.Description,
                Priority = ticket.Priority,
                Status = ticket.Status,
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
                CreatedById = ticket.CreatedById,
                AssignedToId = ticket.AssignedToId,
            };

            await _auditLogService.LogAsync("Назначение", $"Заявка \"{ticket.Title}\" назначена менеджером", managerId, ticket.Id, cancellationToken);

            return response;
        }

        public async Task<IReadOnlyCollection<TicketResponseDTO>> GetAllTicketsAsync(CancellationToken cancellationToken)
        {
            var tickets = await _dbContext.Tickets.AsNoTracking().OrderByDescending(x => x.CreatedAt).Select(x => new TicketResponseDTO
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
                Priority = x.Priority,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,
                CreatedById = x.CreatedById,
                AssignedToId = x.AssignedToId,
            }).ToArrayAsync(cancellationToken);

            return tickets;
        }

        public async Task<TicketResponseDTO> GetTicketByIdAsync(Guid ticketId, Guid userId, string role, CancellationToken cancellationToken)
        {
            var ticket = await _dbContext.Tickets.AsNoTracking().SingleOrDefaultAsync(x => x.Id == ticketId, cancellationToken);

            if (ticket == null)
            {
                throw new InvalidOperationException($"Заявка с id {ticketId} не найдена.");
            }

            if (userId != ticket.CreatedById && role != Roles.Support && role != Roles.Manager && role != Roles.Admin)
            {
                throw new UnauthorizedAccessException("У вас нет доступа к этой заявке.");
            }

            var ticketResponse = new TicketResponseDTO
            {
                Id = ticket.Id,
                Title = ticket.Title,
                Description = ticket.Description,
                Priority = ticket.Priority,
                Status = ticket.Status,
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
                CreatedById = ticket.CreatedById,
                AssignedToId = ticket.AssignedToId,
            };

            return ticketResponse;
        }

        public async Task<TicketResponseDTO[]> GetTicketByUserIdAsync(Guid userId, CancellationToken cancellationToken)
        {
            var user = await _dbContext.Users.AsNoTracking().SingleOrDefaultAsync(x => x.Id == userId, cancellationToken);

            if (user == null)
            {
                throw new InvalidOperationException($"Пользователь с id {userId} не найден.");
            }

            var tickets = await _dbContext.Tickets.AsNoTracking().Where(x => x.CreatedById == userId).Select(x => new TicketResponseDTO
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
                Priority = x.Priority,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,
                CreatedById = x.CreatedById,
                AssignedToId = x.AssignedToId,
            }).ToArrayAsync(cancellationToken);

            return tickets;
        }

        public async Task<TicketResponseDTO> UpdateTicketByIdAsync(Guid ticketId, Guid userId, UpdateTicketDTO updateTicketDTO, CancellationToken cancellationToken)
        {
            var ticket = await _dbContext.Tickets.SingleOrDefaultAsync(x => x.Id == ticketId, cancellationToken);

            if (ticket == null)
            {
                throw new InvalidOperationException($"Заявка с id {ticketId} не найдена.");
            }

            if (updateTicketDTO.AssignedToId.HasValue)
            {
                var assignedUser = await _dbContext.Users.SingleOrDefaultAsync(x => x.Id == updateTicketDTO.AssignedToId, cancellationToken);

                if (assignedUser == null)
                {
                    throw new InvalidOperationException($"Пользователь с id {updateTicketDTO.AssignedToId} не найден.");
                }

                if (assignedUser.Role != Roles.Support)
                {
                    throw new InvalidOperationException("Назначить заявку сотруднику можно только пользователю с ролью Support.");
                }
            }

            if (string.IsNullOrWhiteSpace(updateTicketDTO.Title) || string.IsNullOrWhiteSpace(updateTicketDTO.Description))
            {
                throw new InvalidOperationException("Некорректное заполнение полей.");
            }

            if (string.IsNullOrWhiteSpace(updateTicketDTO.Status) || !IsValidStatus(updateTicketDTO.Status))
            {
                throw new InvalidOperationException("Введён некорректный статус.");
            }

            if (string.IsNullOrWhiteSpace(updateTicketDTO.Priority) || !IsValidPriority(updateTicketDTO.Priority))
            {
                throw new InvalidOperationException("Введён некорректный приоритет.");
            }

            var oldStatus = ticket.Status;

            ticket.Title = updateTicketDTO.Title;
            ticket.Description = updateTicketDTO.Description;
            ticket.Status = updateTicketDTO.Status;
            ticket.Priority = updateTicketDTO.Priority;
            ticket.UpdatedAt = DateTimeOffset.UtcNow;
            ticket.AssignedToId = updateTicketDTO.AssignedToId;

            var newStatus = ticket.Status;

            await _dbContext.SaveChangesAsync(cancellationToken);

            if (oldStatus != newStatus)
            {
                await _ticketHistoryService.CreateNewTicketHistoryAsync(ticketId, oldStatus, newStatus, userId, cancellationToken);
            }

            var response =  new TicketResponseDTO
            {
                Id = ticketId,
                Title = ticket.Title,
                Description = ticket.Description,
                Priority = ticket.Priority,
                Status = ticket.Status,
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
                CreatedById = ticket.CreatedById,
                AssignedToId = ticket.AssignedToId,
            };

            await _auditLogService.LogAsync("Редактирование", $"Изменение заявки {response.Title} сотрудником", userId, response.Id, cancellationToken);

            return response;
        }

        public async Task DeleteTicketByIdAsync(Guid ticketId, Guid userId, CancellationToken cancellationToken)
        {
            var ticket = await _dbContext.Tickets
                .Include(t => t.AuditLogs)
                .Include(t => t.Comments)
                .Include(t => t.TicketHistories)
                .SingleOrDefaultAsync(x => x.Id == ticketId, cancellationToken);

            if (ticket == null)
            {
                throw new InvalidOperationException($"Заявка с id {ticketId} не найдена.");
            }

            var ticketTitle = ticket.Title;

            _dbContext.AuditLogs.RemoveRange(ticket.AuditLogs);
            _dbContext.Comments.RemoveRange(ticket.Comments);
            _dbContext.TicketHistories.RemoveRange(ticket.TicketHistories);

            _dbContext.Tickets.Remove(ticket);
            await _dbContext.SaveChangesAsync(cancellationToken);

            await _auditLogService.LogAsync("Удаление", $"Удаление заявки \"{ticketTitle}\" сотрудником", userId, null, cancellationToken);
        }
    }
}
