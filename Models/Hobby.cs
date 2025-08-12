using System.ComponentModel.DataAnnotations;

namespace TechAssessment.Models
{
    public class Hobby
    {
        public int Id { get; set; }
        public int FreelancerId { get; set; }
        public string HobbyName { get; set; }

        public Freelancer Freelancer { get; set; }
    }
}
