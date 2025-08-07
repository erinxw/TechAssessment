using Microsoft.Data.SqlClient;
using Dapper;
using TechAssessment.Models;

namespace TechAssessment.Data
{
    public class FreelancerRepository
    {
        private readonly IConfiguration _configuration;

        public FreelancerRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<Freelancer> GetFreelancerWithDetailsAsync(int id)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));

            var sql = @"
                SELECT f.*, 
                       s.SkillName,
                        h.HobbyName
                FROM 
                    Freelancer f
                LEFT JOIN 
                    Skillset s ON f.Id = s.FreelancerId
                LEFT JOIN 
                    Hobby h ON f.Id = h.FreelancerId
                WHERE f.Id = @Id";

            var freelancerDict = new Dictionary<int, Freelancer>();

            var result = await connection.QueryAsync<Freelancer, Skillset, Hobby, Freelancer>(
                sql,
                (freelancer, skill, hobby) =>
                {
                    if (!freelancerDict.TryGetValue(freelancer.Id, out var current))
                    {
                        current = freelancer;
                        current.Skillsets = new List<Skillset>();
                        current.Hobbies = new List<Hobby>();
                        freelancerDict[freelancer.Id] = current;
                    }

                    // Only map skill if SkillsetId is not null
                    if (skill != null && skill.Id != 0)
                    {
                        skill.FreelancerId = freelancer.Id;
                        skill.Name = skill.Name ?? string.Empty;
                        current.Skillsets.Add(skill);
                    }

                    // Only map hobby if HobbyId is not null
                    if (hobby != null && hobby.Id != 0)
                    {
                        hobby.FreelancerId = freelancer.Id;
                        hobby.Name = hobby.Name ?? string.Empty;
                        current.Hobbies.Add(hobby);
                    }

                    return current;
                },
                new { Id = id },
                splitOn: "SkillName,HobbyName"
            );

            return freelancerDict.Values.FirstOrDefault();
        }
    }
}
