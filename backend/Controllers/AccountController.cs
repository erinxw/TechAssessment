using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechAssessment.Models;

[Route("api/[controller]")]
[ApiController]
public class AccountController : ControllerBase
{
	private readonly JwtService _jwtService;

    public AccountController(JwtService jwtService) => _jwtService = jwtService;

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseModel>> Login(LoginRequestModel request)
    {
        var result = await _jwtService.Authenticate(request);
        if (string.IsNullOrEmpty(result.AccessToken))
            return Unauthorized(new { message = "Invalid username or password." });
        return Ok(result);
    }
}
