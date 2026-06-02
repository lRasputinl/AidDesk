using AidDeskAPI.API.Auth.DTO;
using AidDeskAPI.API.Auth.Services;
using Microsoft.AspNetCore.Mvc;

namespace AidDeskAPI.API.Auth.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] RegisterDTO registerDTO, CancellationToken cancellationToken)
        {
            await authService.RegisterUserAsync(registerDTO, cancellationToken);

            return Ok();
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDTO>> Login([FromBody] LoginDTO loginDTO, CancellationToken cancellationToken)
        {
            var token = await authService.LoginUserAsync(loginDTO, cancellationToken);

            return Ok(token);
        }
    }
}
