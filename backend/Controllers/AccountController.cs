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
    public async Task<ActionResult<LoginResponseModel>> Login(Freelancer request)
    {
        var result = await _jwtService.Authenticate(request);
        if (result is null)
            return Unauthorized();
        return result;
    }
}
