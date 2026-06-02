using AidDeskAPI.API.Users.DTO;
using AidDeskAPI.API.Users.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AidDeskAPI.API.Users.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController(IUserService userService) : ControllerBase
    {
        [Authorize(Roles = "Support,Manager,Admin")]
        [HttpGet]
        public async Task<ActionResult<UserResponseDTO[]>> GetAllUsers(CancellationToken cancellationToken)
        {
            var users = await userService.GetAllUsersAsync(cancellationToken);
            return Ok(users);
        }

        [Authorize(Roles = "Support,Manager,Admin")]
        [HttpGet("{userId:guid}")]
        public async Task<ActionResult<UserResponseDTO>> GetUserById(Guid userId, CancellationToken cancellationToken)
        {
            var user = await userService.GetUserByIdAsync(userId, cancellationToken);
            return Ok(user);
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserResponseDTO>> GetMe(CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await userService.GetUserByIdAsync(userId, cancellationToken);
            return Ok(user);
        }

        [Authorize]
        [HttpPut("me")]
        public async Task<ActionResult> UpdateUserById(UpdateUserDTO updateUserDTO, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await userService.UpdateUserByIdAsync(userId, updateUserDTO, cancellationToken);
            return Ok(user);
        }

        [Authorize]
        [HttpPut("me/password")]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDTO changePasswordDTO, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await userService.ChangePasswordAsync(userId, changePasswordDTO, cancellationToken);
            return NoContent();
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpPut("{userId:guid}/role")]
        public async Task<ActionResult> ChangeUserRole(Guid userId, [FromBody] ChangeUserRoleDTO dto, CancellationToken cancellationToken)
        {
            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var currentRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)!.Value;

            if (currentUserId == userId)
                throw new InvalidOperationException("Нельзя изменить собственную роль.");

            if (currentRole == "Manager" && (dto.Role == "Manager" || dto.Role == "Admin"))
                throw new InvalidOperationException("Менеджер не может назначать роли Менеджера или Администратора.");

            await userService.ChangeUserRoleAsync(userId, dto, cancellationToken);
            return NoContent();
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpDelete("{userId:guid}")]
        public async Task<ActionResult> DeleteUserById(Guid userId, CancellationToken cancellationToken)
        {
            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var currentRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)!.Value;

            if (currentUserId == userId)
                throw new InvalidOperationException("Нельзя удалить самого себя.");

            var targetUser = await userService.GetUserByIdAsync(userId, cancellationToken);
            if (currentRole == "Manager" && (targetUser.Role == "Manager" || targetUser.Role == "Admin"))
                throw new InvalidOperationException("Менеджер не может удалять других менеджеров или администраторов.");

            await userService.DeleteUserByIdAsync(userId, currentUserId, cancellationToken);
            return NoContent();
        }
    }
}
