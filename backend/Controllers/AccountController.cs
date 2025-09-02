using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechAssessment.Models;
using TechAssessment.Data; 

[Route("api/[controller]")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly JwtService _jwtService;
    public readonly IFreelancerRepository _repository;

    public AccountController(JwtService jwtService, IFreelancerRepository repository)
    {
        _jwtService = jwtService;
        _repository = repository;
    }

    [AllowAnonymous]
    [HttpPost("login")]     // POST /api/account/login
    public async Task<ActionResult<LoginResponseModel>> Login(LoginRequestModel request)
    {
        var result = await _jwtService.Authenticate(request);
        if (string.IsNullOrEmpty(result.AccessToken))
            return Unauthorized(new { message = "Invalid username or password." });
        return Ok(result);
    }

    [AllowAnonymous]
    [HttpPost("signup")]     // POST /api/account/signup
    public async Task<ActionResult<SignupResponseModel>> Signup([FromBody] SignupRequestModel request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Username and password are required." });

        // Only allow signup for admin role
        var freelancer = new Freelancer
        {
            Username = request.Username,
            Password = request.Password,
            IsAdmin = true
        };

        // Check if username already exists
        var existing = await _repository.GetByUsernameAsync(request.Username);
        if (existing != null)
            return BadRequest(new { message = "Username already exists." });

        var newId = await _repository.CreateAsync(freelancer);
        if (newId <= 0)
            return StatusCode(500, new { message = "Failed to create user." });

        // Authenticate and return JWT token
        var loginModel = new LoginRequestModel { Username = freelancer.Username, Password = request.Password };
        var loginResult = await _jwtService.Authenticate(loginModel);
        if (string.IsNullOrEmpty(loginResult.AccessToken))
            return StatusCode(500, new { message = "Failed to generate token after signup." });

        return Ok(new
        {
            Id = newId,
            Username = freelancer.Username,
            AccessToken = loginResult.AccessToken,
            ExpiresIn = loginResult.ExpiresIn
        });
    }
}
