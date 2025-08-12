using System.ComponentModel.DataAnnotations;

namespace TechAssessment.Models;

    public class Freelancer
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Username is required")]
        public string Username { get; set; }

        [Required]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        public string Email { get; set; }

        [Required]
        [RegularExpression(@"^\+?[0-9\s\-]{7,20}$", ErrorMessage = "Invalid phone number format.")]
        public string PhoneNum { get; set; }

        public bool IsArchived { get; set; }

        public List<Skillset> Skillsets { get; set; } = new List<Skillset>();

        public List<Hobby> Hobbies { get; set; } = new List<Hobby>();
}
