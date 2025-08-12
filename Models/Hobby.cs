using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TechAssessment.Models
{
    public class Hobby
    {
        public int Id { get; set; }
        public int FreelancerId { get; set; }
        public string? HobbyName { get; set; }

        [JsonIgnore]
        public Freelancer? Freelancer { get; set; }
    }
}
