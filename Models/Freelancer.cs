namespace TechAssessment.Models;

    public class Freelancer
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PhoneNum { get; set; }
        public List<Skillset> Skillsets { get; set; }
        public List<Hobby> Hobbies { get; set; }
    }
