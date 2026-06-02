using AidDeskAPI.API.Auth.DTO;

namespace AidDeskAPI.API.Auth.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDTO> LoginUserAsync(LoginDTO loginDTO, CancellationToken cancellationToken);
        Task RegisterUserAsync(RegisterDTO registerDTO, CancellationToken cancellationToken);
    }
}