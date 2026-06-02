using AidDeskAPI.API.AuditLog.Services;
using AidDeskAPI.API.Users.DTO;
using AidDeskDatabase_DataAccess_EF;
using Microsoft.EntityFrameworkCore;
namespace AidDeskAPI.API.Users.Services
{
    public class UserService : IUserService
    {
        private readonly AidDeskDbContext _dbContext;
        private readonly IAuditLogService _auditLogService;
        public UserService(AidDeskDbContext dbContext, IAuditLogService auditLogService)
        {
            _dbContext = dbContext;
            _auditLogService = auditLogService;
        }

        public async Task<IReadOnlyCollection<UserResponseDTO>> GetAllUsersAsync(CancellationToken cancellationToken)
        {
            var users = await _dbContext.Users.AsNoTracking().OrderBy(x => x.CreatedAt).Select(x => new UserResponseDTO
            {
                Id = x.Id,
                FirstName = x.FirstName,
                LastName = x.LastName,
                Email = x.Email,
                PhoneNumber = x.PhoneNumber,
                Role = x.Role,
                CreatedAt = x.CreatedAt,
            }).ToArrayAsync(cancellationToken);

            return users;
        }

        public async Task<UserResponseDTO> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken)
        {
            var user = await _dbContext.Users.AsNoTracking().Select(x => new UserResponseDTO
            { 
                Id = x.Id,
                FirstName = x.FirstName,
                LastName = x.LastName,
                Email = x.Email,
                PhoneNumber = x.PhoneNumber,
                Role = x.Role,
                CreatedAt = x.CreatedAt,
            }).SingleOrDefaultAsync(x => x.Id == userId, cancellationToken);

            if (user == null)
            {
                throw new InvalidOperationException($"Пользователь с id {userId} не найден.");
            }

            return user;
        }

        public async Task<UserResponseDTO> UpdateUserByIdAsync(Guid userId, UpdateUserDTO updateUserDTO, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(updateUserDTO.FirstName) ||
                string.IsNullOrWhiteSpace(updateUserDTO.LastName) ||
                string.IsNullOrWhiteSpace(updateUserDTO.Email) ||
                string.IsNullOrWhiteSpace(updateUserDTO.PhoneNumber))
            {
                throw new InvalidOperationException("Некорректное заполнение полей.");
            }

            var normalizedEmail = updateUserDTO.Email.Trim().ToLowerInvariant();

            var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

            if (user == null)
            {
                throw new InvalidOperationException($"Пользователь с id {userId} не найден.");
            }

            var emailExists = await _dbContext.Users.AnyAsync(x => x.Email == normalizedEmail && x.Id != userId, cancellationToken);

            if (emailExists)
            {
                throw new InvalidOperationException("Email уже используется.");
            }

            var phoneNumberExists = await _dbContext.Users.AnyAsync(x => x.PhoneNumber == updateUserDTO.PhoneNumber && x.Id != userId, cancellationToken);

            if (phoneNumberExists)
            {
                throw new InvalidOperationException("Номер телефона уже используется.");
            }

            user.FirstName = updateUserDTO.FirstName.Trim();
            user.LastName = updateUserDTO.LastName.Trim();
            user.Email = normalizedEmail;
            user.PhoneNumber = updateUserDTO.PhoneNumber.Trim();

            await _dbContext.SaveChangesAsync(cancellationToken);

            var response = new UserResponseDTO
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
            };

            await _auditLogService.LogAsync("Редактирование", $"Изменение данных пользователя {response.FirstName} {response.LastName}", response.Id, null, cancellationToken);

            return response;
        }

        public async Task ChangeUserRoleAsync(Guid userId, ChangeUserRoleDTO dto, CancellationToken cancellationToken)
        {
            var allowedRoles = new[] { "Client", "Support", "Manager", "Admin" };
            if (!allowedRoles.Contains(dto.Role))
                throw new InvalidOperationException($"Недопустимая роль: {dto.Role}.");

            var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);
            if (user == null)
                throw new InvalidOperationException($"Пользователь с id {userId} не найден.");

            var oldRole = user.Role;
            user.Role = dto.Role;
            await _dbContext.SaveChangesAsync(cancellationToken);

            await _auditLogService.LogAsync("Изменение роли", $"Роль пользователя {user.FirstName} {user.LastName} изменена с {oldRole} на {dto.Role}", userId, null, cancellationToken);
        }

        public async Task ChangePasswordAsync(Guid userId, ChangePasswordDTO changePasswordDTO, CancellationToken cancellationToken)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

            if (user == null)
            {
                throw new InvalidOperationException($"Пользователь с id {userId} не найден.");
            }

            bool currentValid = BCrypt.Net.BCrypt.Verify(changePasswordDTO.CurrentPassword, user.PasswordHash);

            if (!currentValid)
            {
                throw new InvalidOperationException("Текущий пароль введён неверно.");
            }

            if (string.IsNullOrWhiteSpace(changePasswordDTO.NewPassword) || changePasswordDTO.NewPassword.Length < 6)
            {
                throw new InvalidOperationException("Новый пароль должен содержать не менее 6 символов.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDTO.NewPassword);

            await _dbContext.SaveChangesAsync(cancellationToken);

            await _auditLogService.LogAsync("Смена пароля", $"Пользователь {user.FirstName} {user.LastName} сменил пароль", userId, null, cancellationToken);
        }
        public async Task DeleteUserByIdAsync(Guid userId, Guid actorId, CancellationToken cancellationToken)
        {
            var user = await _dbContext.Users
                .Include(u => u.AuditLogs)
                .Include(u => u.Comments)
                .Include(u => u.TicketHistories)
                .Include(u => u.TicketCreatedBies)
                    .ThenInclude(t => t.AuditLogs)
                .Include(u => u.TicketCreatedBies)
                    .ThenInclude(t => t.Comments)
                .Include(u => u.TicketCreatedBies)
                    .ThenInclude(t => t.TicketHistories)
                .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

            if (user == null)
            {
                throw new InvalidOperationException($"Пользователь с id {userId} не найден.");
            }

            var fullName = $"{user.FirstName} {user.LastName}";

            foreach (var ticket in user.TicketCreatedBies)
            {
                _dbContext.AuditLogs.RemoveRange(ticket.AuditLogs);
                _dbContext.Comments.RemoveRange(ticket.Comments);
                _dbContext.TicketHistories.RemoveRange(ticket.TicketHistories);
            }
            _dbContext.Tickets.RemoveRange(user.TicketCreatedBies);

            _dbContext.AuditLogs.RemoveRange(user.AuditLogs);
            _dbContext.Comments.RemoveRange(user.Comments);
            _dbContext.TicketHistories.RemoveRange(user.TicketHistories);

            _dbContext.Users.Remove(user);
            await _dbContext.SaveChangesAsync(cancellationToken);

            await _auditLogService.LogAsync("Удаление", $"Удаление пользователя {fullName}", actorId, null, cancellationToken);
        }
    }
}
