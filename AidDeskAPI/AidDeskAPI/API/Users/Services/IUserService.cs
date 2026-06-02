using AidDeskAPI.API.Users.DTO;

namespace AidDeskAPI.API.Users.Services
{
    public interface IUserService
    {
        Task DeleteUserByIdAsync(Guid userId, Guid actorId, CancellationToken cancellationToken);
        Task<IReadOnlyCollection<UserResponseDTO>> GetAllUsersAsync(CancellationToken cancellationToken);
        Task<UserResponseDTO> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken);
        Task<UserResponseDTO> UpdateUserByIdAsync(Guid userId, UpdateUserDTO updateUserDTO, CancellationToken cancellationToken);
        Task ChangePasswordAsync(Guid userId, ChangePasswordDTO changePasswordDTO, CancellationToken cancellationToken);
        Task ChangeUserRoleAsync(Guid userId, ChangeUserRoleDTO dto, CancellationToken cancellationToken);
    }
}
