namespace TechAssessment.Models;

public class LoginRequestModel
{

    public required string Username { get; set; }

    // [Required]
    // public string Password { get; set; }  // Hashed password
    public string? Password { get; set; }  // Hashed password
}