using Microsoft.Data.SqlClient;
using Dapper;
using TechAssessment.Models;

namespace TechAssessment.Data
{
    public class FreelancerRepository : IFreelancerRepository
    {
        private readonly IConfiguration _configuration;

        public FreelancerRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<IEnumerable<Freelancer>> GetAllFreelancersAsync()
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));

            var sql = @"
        SELECT f.*, s.Id, s.SkillName, h.Id, h.HobbyName
        FROM Freelancer f
        LEFT JOIN Skillset s ON s.FreelancerId = f.Id
        LEFT JOIN Hobby h ON h.FreelancerId = f.Id
        WHERE f.IsArchived = 0
        ORDER BY f.Id";

            var freelancerDict = new Dictionary<int, Freelancer>();

            var result = await connection.QueryAsync<Freelancer, Skillset, Hobby, Freelancer>(
                sql,
                (f, s, h) =>
                {
                    if (!freelancerDict.TryGetValue(f.Id, out var current))
                    {
                        current = f;
                        current.Skillsets = new List<Skillset>();
                        current.Hobbies = new List<Hobby>();
                        freelancerDict.Add(current.Id, current);
                    }

                    if (s != null && !current.Skillsets.Any(x => x.Id == s.Id))
                        current.Skillsets.Add(s);

                    if (h != null && !current.Hobbies.Any(x => x.Id == h.Id))
                        current.Hobbies.Add(h);

                    return current;
                },
                splitOn: "Id,Id"
            );

            return freelancerDict.Values;
        }

        public async Task<Freelancer> GetFreelancerDetailsAsync(int id)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));

            var sql = @"
        SELECT f.*, s.Id, s.SkillName, h.Id, h.HobbyName
        FROM Freelancer f
        LEFT JOIN Skillset s ON s.FreelancerId = f.Id
        LEFT JOIN Hobby h ON h.FreelancerId = f.Id
        WHERE f.Id = @Id AND f.IsArchived = 0";

            var freelancerDict = new Dictionary<int, Freelancer>();

            var freelancers = await connection.QueryAsync<Freelancer, Skillset, Hobby, Freelancer>(
                sql,
                (f, s, h) =>
                {
                    if (!freelancerDict.TryGetValue(f.Id, out var current))
                    {
                        current = f;
                        current.Skillsets = new List<Skillset>();
                        current.Hobbies = new List<Hobby>();
                        freelancerDict.Add(current.Id, current);
                    }

                    if (s != null && !current.Skillsets.Any(x => x.Id == s.Id))
                        current.Skillsets.Add(s);

                    if (h != null && !current.Hobbies.Any(x => x.Id == h.Id))
                        current.Hobbies.Add(h);

                    return current;
                },
                new { Id = id },
                splitOn: "Id,Id"
            );

            // Ensure lists are never null
            var result = freelancerDict.Values.FirstOrDefault();
            if (result != null)
            {
                result.Skillsets ??= new List<Skillset>();
                result.Hobbies ??= new List<Hobby>();
            }

            return result;
        }

        // Create freelancer
        public async Task<Freelancer> CreateFreelancerAsync(Freelancer freelancer, string Skillsets, string Hobbies)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();

            using var transaction = connection.BeginTransaction();

            try
            {
                var insertSql = @"
            INSERT INTO Freelancer (Username, Email, PhoneNum)
            VALUES (@Username, @Email, @PhoneNum);
            SELECT CAST(SCOPE_IDENTITY() AS INT);";

                // Insert freelancer and get generated Id
                var freelancerId = await connection.ExecuteScalarAsync<int>(insertSql, freelancer, transaction);

                // Insert Skillsets
                if (!string.IsNullOrWhiteSpace(Skillsets))
                {
                    var skillList = Skillsets.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim());
                    foreach (var skill in skillList)
                    {
                        var insertSkillSql = "INSERT INTO Skillset (FreelancerId, SkillName) VALUES (@FreelancerId, @Name);";
                        await connection.ExecuteAsync(insertSkillSql, new { FreelancerId = freelancerId, Name = skill }, transaction);
                    }
                }

                // Insert Hobbies
                if (!string.IsNullOrWhiteSpace(Hobbies))
                {
                    var hobbyList = Hobbies.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(h => h.Trim());
                    foreach (var hobby in hobbyList)
                    {
                        var insertHobbySql = "INSERT INTO Hobby (FreelancerId, HobbyName) VALUES (@FreelancerId, @Name);";
                        await connection.ExecuteAsync(insertHobbySql, new { FreelancerId = freelancerId, Name = hobby }, transaction);
                    }
                }

                transaction.Commit();

                // Set the Id of the freelancer object before returning
                freelancer.Id = freelancerId;
                return freelancer;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task UpdateFreelancerAsync(Freelancer freelancer)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                var updateSql = @"UPDATE Freelancer 
                          SET Username = @Username, Email = @Email, PhoneNum = @PhoneNum 
                          WHERE Id = @Id;";
                await connection.ExecuteAsync(updateSql, freelancer, transaction);

                await connection.ExecuteAsync("DELETE FROM Skillset WHERE FreelancerId = @Id", new { Id = freelancer.Id }, transaction);
                await connection.ExecuteAsync("DELETE FROM Hobby WHERE FreelancerId = @Id", new { Id = freelancer.Id }, transaction);

                foreach (var skill in freelancer.Skillsets)
                {
                    await connection.ExecuteAsync(
                        "INSERT INTO Skillset (FreelancerId, SkillName) VALUES (@FreelancerId, @SkillName);",
                        skill, transaction);
                }

                foreach (var hobby in freelancer.Hobbies)
                {
                    await connection.ExecuteAsync(
                        "INSERT INTO Hobby (FreelancerId, HobbyName) VALUES (@FreelancerId, @HobbyName);",
                        hobby, transaction);
                }

                transaction.Commit();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task ArchiveFreelancer(int id)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.ExecuteAsync("UPDATE Freelancer SET IsArchived = 1 WHERE Id = @Id", new { Id = id });
        }

        public async Task UnarchiveFreelancer(int id)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.ExecuteAsync("UPDATE Freelancer SET IsArchived = 0 WHERE Id = @Id", new { Id = id });
        }

        public async Task<IEnumerable<Freelancer>> GetArchivedFreelancers()
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            return await connection.QueryAsync<Freelancer>("SELECT * FROM Freelancer WHERE IsArchived = 1");
        }
    }
}
