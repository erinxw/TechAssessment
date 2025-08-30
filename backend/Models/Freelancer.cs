using System.ComponentModel.DataAnnotations;

namespace TechAssessment.Models;

public class Freelancer
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Username is required")]
    public required string Username { get; set; }

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email address")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Phone number is required")]
    [Phone(ErrorMessage = "Invalid phone number")]
    public required string PhoneNum { get; set; }

    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        ErrorMessage = "Password must contain at least 8 characters, one uppercase, one lowercase, one digit and one special character"
    )]
    public string? Password { get; set; } // Hashed password

    public bool IsArchived { get; set; }

    public bool IsAdmin { get; set; }

    public List<Skillset> Skillsets { get; set; } = new List<Skillset>();

    public List<Hobby> Hobbies { get; set; } = new List<Hobby>();
}
