using AidDeskAPI.API.Auth.DTO;
using AidDeskDatabase_DataAccess_EF;
using AidDeskDatabase_DataAccess_EF.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AidDeskAPI.API.Auth.Services
{
    public class AuthService : IAuthService
    {
        private readonly AidDeskDbContext _dbContext;
        public AuthService(AidDeskDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task RegisterUserAsync(RegisterDTO registerDTO, CancellationToken cancellationToken)
        {
            var normalizedEmail = registerDTO.Email.Trim().ToLower();

            if (await _dbContext.Users.AnyAsync(x => x.Email == normalizedEmail, cancellationToken))
            {
                throw new InvalidOperationException($"Пользователь с email {normalizedEmail} уже существует.");
            }

            var newUser = new User
            {
                FirstName = registerDTO.FirstName,
                LastName = registerDTO.LastName,
                Email = normalizedEmail,
                PhoneNumber = registerDTO.PhoneNumber,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDTO.Password),
                Role = Roles.Client,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _dbContext.Users.AddAsync(newUser, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task<AuthResponseDTO> LoginUserAsync(LoginDTO loginDTO, CancellationToken cancellationToken)
        {
            var normalizedEmail = loginDTO.Email.Trim().ToLower();

            var user = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Email == normalizedEmail, cancellationToken);

            if (user is null)
            {
                throw new InvalidOperationException($"Пользователь с email {normalizedEmail} не найден.");
            }

            bool valid = BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.PasswordHash);

            if (!valid)
            {
                throw new InvalidOperationException("Неверный пароль.");
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("Jwt__Key")));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: Environment.GetEnvironmentVariable("Jwt__Issuer"),
                audience: Environment.GetEnvironmentVariable("Jwt__Audience"),
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return new AuthResponseDTO
            {
                Token = tokenString,
            };
        }
    }
}
