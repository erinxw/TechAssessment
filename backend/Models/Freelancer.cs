using System.ComponentModel.DataAnnotations;

namespace TechAssessment.Models;

public class Freelancer
{
    public int Id { get; set; }

    public required string Username { get; set; }

    //[EmailAddress(ErrorMessage = "Invalid email address")]
    public required string Email { get; set; }

    public required string PhoneNum { get; set; }

    // [Required]
    // public string Password { get; set; }  // Hashed password
    public string? Password { get; set; }  // Hashed password

    public bool IsArchived { get; set; }

    public bool IsAdmin { get; set; }

    public List<Skillset> Skillsets { get; set; } = new List<Skillset>();

    public List<Hobby> Hobbies { get; set; } = new List<Hobby>();
}
