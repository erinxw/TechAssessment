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
    public async Task<IActionResult> Signup([FromBody] SignupRequestModel request)
    {
        Console.WriteLine("=== SIGNUP DEBUG START ===");
        Console.WriteLine($"Username: {request.Username}");
        Console.WriteLine($"Password: {request.Password}");

        if (!ModelState.IsValid)
        {
            Console.WriteLine("ModelState is invalid");
            return BadRequest(ModelState);
        }

        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            Console.WriteLine("Username or password is empty");
            return BadRequest(new { message = "Username and password are required." });
        }

        // Check if username already exists
        var existing = await _repository.GetByUsernameAsync(request.Username);
        if (existing != null)
        {
            Console.WriteLine("Username already exists");
            return BadRequest(new { message = "Username already exists." });
        }

        // Hash the password before storing
        var hashedPassword = PasswordHashHandler.HashPassword(request.Password);
        Console.WriteLine($"Hashed password: {hashedPassword}");

        // Create new freelancer (admin by default as you wanted)
        var freelancer = new Freelancer
        {
            Username = request.Username,
            Password = hashedPassword,  
            IsAdmin = true
        };

        // Save to database
        var newId = await _repository.CreateAsync(freelancer);
        Console.WriteLine($"Created user with ID: {newId}");
        if (newId <= 0)
            return StatusCode(500, new { message = "Failed to create user." });

        // Verify the user was actually saved correctly
        var savedUser = await _repository.GetByUsernameAsync(request.Username);
        if (savedUser != null)
        {
            Console.WriteLine($"Saved user found - ID: {savedUser.Id}, Username: {savedUser.Username}");
            Console.WriteLine($"Saved user password hash: {savedUser.Password}");
            bool savedUserPasswordTest = PasswordHashHandler.VerifyPassword(request.Password, savedUser.Password);
            Console.WriteLine($"Saved user password verification: {savedUserPasswordTest}");
        }
        else
        {
            Console.WriteLine("ERROR: Saved user not found in database!");
            return StatusCode(500, new { message = "User was not saved properly." });
        }

        // Now authenticate the newly created user to get a token
        var loginModel = new LoginRequestModel 
        { 
            Username = request.Username, 
            Password = request.Password  
        };
        
        Console.WriteLine($"Calling JwtService.Authenticate with username: {loginModel.Username}");
        var loginResult = await _jwtService.Authenticate(loginModel);
        
        Console.WriteLine($"JWT Result - AccessToken: {(loginResult.AccessToken?.Length > 0 ? "Generated" : "NULL/EMPTY")}");
        Console.WriteLine($"JWT Result - Username: {loginResult.Username}");
        Console.WriteLine($"JWT Result - ExpiresIn: {loginResult.ExpiresIn}");
        
        if (string.IsNullOrEmpty(loginResult.AccessToken))
        {
            Console.WriteLine("ERROR: AccessToken is null or empty");
            return StatusCode(500, new { message = "Failed to generate token after signup." });
        }

        Console.WriteLine("=== SIGNUP DEBUG END ===");
        return Ok(new SignupResponseModel
        {
            Id = newId,
            Username = freelancer.Username,
            AccessToken = loginResult.AccessToken,
            ExpiresIn = loginResult.ExpiresIn
        });
    }
}