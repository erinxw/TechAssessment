using System.ComponentModel.DataAnnotations;

namespace TechAssessment.Models;

public class LoginRequestModel
{
    [Required(ErrorMessage = "Username is required")]
    public required string Username { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        ErrorMessage = "Password must contain at least 8 characters, one uppercase, one lowercase, one digit and one special character"
    )]
    public required string Password { get; set; } // Hashed password
}
