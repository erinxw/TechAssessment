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
    private readonly ILogger<AccountController> _logger;

    public AccountController(JwtService jwtService, IFreelancerRepository repository, ILogger<AccountController> logger)
    {
        _jwtService = jwtService;
        _repository = repository;
        _logger = logger;
    }

    [AllowAnonymous]
    [HttpPost("login")]     // POST /api/account/login
    public async Task<ActionResult<LoginResponseModel>> Login(LoginRequestModel request)
    {
        try
        {
            _logger.LogInformation("Login attempt for username: {Username}", request.Username);

            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Username and password are required." });
            }

            var result = await _jwtService.Authenticate(request);

            if (string.IsNullOrEmpty(result.AccessToken))
            {
                _logger.LogWarning("Failed login attempt for username: {Username}", request.Username);
                return Unauthorized(new { message = "Invalid username or password." });
            }

            _logger.LogInformation("Successful login for username: {Username}", request.Username);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for username: {Username}", request.Username);
            return StatusCode(500, new { message = "An error occurred during login." });
        }
    }

    [AllowAnonymous]
    [HttpPost("signup")]     // POST /api/account/signup
    public async Task<IActionResult> Signup([FromBody] SignupRequestModel request)
    {
        try
        {
            _logger.LogInformation("=== SIGNUP ATTEMPT ===");
            _logger.LogInformation("Username: {Username}", request.Username);
            _logger.LogInformation("Email: {Email}", request.Email);
            _logger.LogInformation("Phone: {Phone}", request.PhoneNum);
            _logger.LogInformation("Skillsets Count: {SkillsetsCount}", request.Skillsets?.Count ?? 0);
            _logger.LogInformation("Hobbies Count: {HobbiesCount}", request.Hobbies?.Count ?? 0);

            // Basic validation
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState is invalid");
                return BadRequest(ModelState);
            }

            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Username and password are required." });
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { message = "Email is required." });
            }

            if (string.IsNullOrWhiteSpace(request.PhoneNum))
            {
                return BadRequest(new { message = "Phone number is required." });
            }

            // Password validation
            if (request.Password.Length < 8)
            {
                return BadRequest(new { message = "Password must be at least 8 characters long." });
            }

            // Email format validation
            var emailRegex = new System.Text.RegularExpressions.Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            if (!emailRegex.IsMatch(request.Email))
                return BadRequest(new { message = "Please enter a valid email address." });

            // Phone format validation
            var phoneRegex = new System.Text.RegularExpressions.Regex(@"^\+?[0-9\s\-]{7,20}$");
            if (!phoneRegex.IsMatch(request.PhoneNum))
                return BadRequest(new { message = "Invalid phone number format." });

            // Check for duplicate username
            var existingUsername = await _repository.GetByUsernameAsync(request.Username);
            if (existingUsername != null)
            {
                _logger.LogWarning("Username already exists: {Username}", request.Username);
                return BadRequest(new { message = "Username already exists. Please choose another." });
            }

            // Check for duplicate email
            var existingEmail = await _repository.GetByEmailAsync(request.Email);
            if (existingEmail != null)
            {
                _logger.LogWarning("Email already exists: {Email}", request.Email);
                return BadRequest(new { message = "Email is already registered. Please sign in." });
            }

            // Hash the password
            var hashedPassword = PasswordHashHandler.HashPassword(request.Password);
            _logger.LogInformation("Password hashed successfully");

            // Create new freelancer with ALL the data from signup
            var freelancer = new Freelancer
            {
                Username = request.Username.Trim(),
                Email = request.Email.Trim(),
                PhoneNum = request.PhoneNum.Trim(),
                Password = hashedPassword,
                Skillsets = request.Skillsets?.Where(s => !string.IsNullOrWhiteSpace(s?.SkillName))
                    .Select(s => new Skillset { SkillName = s.SkillName.Trim() }).ToList() ?? new List<Skillset>(),
                Hobbies = request.Hobbies?.Where(h => !string.IsNullOrWhiteSpace(h?.HobbyName))
                    .Select(h => new Hobby { HobbyName = h.HobbyName.Trim() }).ToList() ?? new List<Hobby>(),
                IsArchived = false
            };

            // Save to database
            _logger.LogInformation("Attempting to save freelancer to database");
            var newId = await _repository.CreateAsync(freelancer);

            if (newId <= 0)
            {
                _logger.LogError("Failed to create user - repository returned ID: {NewId}", newId);
                return StatusCode(500, new { message = "Failed to create user." });
            }

            _logger.LogInformation("Successfully created user with ID: {NewId}", newId);

            // Verify the user was saved
            var savedUser = await _repository.GetByUsernameAsync(request.Username);
            if (savedUser == null)
            {
                _logger.LogError("User was not saved properly - not found after creation");
                return StatusCode(500, new { message = "User was not saved properly." });
            }

            _logger.LogInformation("User verification successful - ID: {UserId}", savedUser.Id);

            // Generate JWT token for the new user
            var loginModel = new LoginRequestModel
            {
                Username = request.Username,
                Password = request.Password
            };

            _logger.LogInformation("Generating JWT token for new user");
            var loginResult = await _jwtService.Authenticate(loginModel);

            if (string.IsNullOrEmpty(loginResult.AccessToken))
            {
                _logger.LogError("Failed to generate JWT token after signup");
                return StatusCode(500, new { message = "Account created but login failed. Please try logging in manually." });
            }

            _logger.LogInformation("=== SIGNUP SUCCESSFUL ===");

            // Return the same format as login
            return Ok(new SignupResponseModel
            {
                Id = newId,
                Username = freelancer.Username,
                AccessToken = loginResult.AccessToken,
                ExpiresIn = loginResult.ExpiresIn
            });

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during signup: {Message}", ex.Message);
            return StatusCode(500, new { message = "An error occurred during signup." });
        }
    }
}