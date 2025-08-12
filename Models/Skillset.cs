using System.Text.Json.Serialization;

namespace TechAssessment.Models
{
    public class Skillset
    {
        public int Id { get; set; }
        public int FreelancerId { get; set; }
        public string? SkillName { get; set; }

        [JsonIgnore]
        public Freelancer? Freelancer { get; set; }
    }
}
