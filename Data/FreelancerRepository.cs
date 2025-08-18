using Dapper;
using Microsoft.Data.SqlClient;
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

        private SqlConnection GetConnection() =>
            new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));

        public async Task<IEnumerable<Freelancer>> GetFreelancersAsync(
            int currentPageNumber = 1, int pageSize = 10,
            bool? isArchived = null,
            string? searchPhrase = null)
        {
            int maxPageSize = 50;
            pageSize = pageSize < maxPageSize ? pageSize : maxPageSize;

            int skip = (currentPageNumber - 1) * pageSize;
            int take = pageSize;
            using var connection = GetConnection();

            var sql = @"SELECT * FROM Freelancer f
                       WHERE (@IsArchived IS NULL OR f.IsArchived = @IsArchived)
                       AND (@SearchPhrase IS NULL OR @SearchPhrase = '' OR 
                           (f.Username LIKE '%' + @SearchPhrase + '%' OR 
                            f.Email LIKE '%' + @SearchPhrase + '%' OR 
                            f.PhoneNum LIKE '%' + @SearchPhrase + '%'))
                        ORDER BY f.Id
                        OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY";

            var parameters = new
            {
                IsArchived = isArchived.HasValue ? (isArchived.Value ? 1 : (int?)0) : null,
                SearchPhrase = searchPhrase,
                Skip = skip,
                Take = take
            };

            var freelancers = (await connection.QueryAsync<Freelancer>(sql, parameters)).ToList();
            await LoadRelatedData(connection, freelancers);
            return freelancers;
        }

        public async Task<Freelancer?> GetByIdAsync(int id)
        {
            using var connection = GetConnection();
            var freelancer = await connection.QuerySingleOrDefaultAsync<Freelancer>(
                "SELECT * FROM Freelancer WHERE Id = @Id", new { Id = id });
            if (freelancer != null)
            {
                freelancer.Skillsets = (await connection.QueryAsync<Skillset>(
                    "SELECT * FROM Skillset WHERE FreelancerId = @Id", new { Id = id })).ToList();
                freelancer.Hobbies = (await connection.QueryAsync<Hobby>(
                    "SELECT * FROM Hobby WHERE FreelancerId = @Id", new { Id = id })).ToList();
            }
            return freelancer;
        }

        public async Task<int> CreateAsync(Freelancer freelancer)
        {
            using var connection = GetConnection();
            var sql = @"INSERT INTO Freelancer (Username, Email, PhoneNum, IsArchived)
                        VALUES (@Username, @Email, @PhoneNum, 0);
                        SELECT CAST(SCOPE_IDENTITY() as int)";
            var newId = await connection.ExecuteScalarAsync<int>(sql, freelancer);

            if (freelancer.Skillsets != null)
            {
                foreach (var skill in freelancer.Skillsets)
                {
                    skill.FreelancerId = newId;
                    await connection.ExecuteAsync(
                        "INSERT INTO Skillset (FreelancerId, SkillName) VALUES (@FreelancerId, @SkillName)",
                        skill);
                }
            }

            if (freelancer.Hobbies != null)
            {
                foreach (var hobby in freelancer.Hobbies)
                {
                    hobby.FreelancerId = newId;
                    await connection.ExecuteAsync(
                        "INSERT INTO Hobby (FreelancerId, HobbyName) VALUES (@FreelancerId, @HobbyName)",
                        hobby);
                }
            }

            return newId;
        }

        public async Task<bool> UpdateAsync(Freelancer freelancer)
        {
            using var connection = GetConnection();
            var sql = @"UPDATE Freelancer
                        SET Username = @Username, Email = @Email, PhoneNum = @PhoneNum, IsArchived = @IsArchived
                        WHERE Id = @Id";
            var affected = await connection.ExecuteAsync(sql, freelancer);
            if (affected == 0) return false;

            await connection.ExecuteAsync("DELETE FROM Skillset WHERE FreelancerId = @Id", new { freelancer.Id });
            if (freelancer.Skillsets != null)
            {
                foreach (var skill in freelancer.Skillsets)
                {
                    skill.FreelancerId = freelancer.Id;
                    await connection.ExecuteAsync(
                        "INSERT INTO Skillset (FreelancerId, SkillName) VALUES (@FreelancerId, @SkillName)",
                        skill);
                }
            }

            await connection.ExecuteAsync("DELETE FROM Hobby WHERE FreelancerId = @Id", new { freelancer.Id });
            if (freelancer.Hobbies != null)
            {
                foreach (var hobby in freelancer.Hobbies)
                {
                    hobby.FreelancerId = freelancer.Id;
                    await connection.ExecuteAsync(
                        "INSERT INTO Hobby (FreelancerId, HobbyName) VALUES (@FreelancerId, @HobbyName)",
                        hobby);
                }
            }

            return true;
        }

        public async Task<bool> ArchiveAsync(int id)
        {
            using var connection = GetConnection();
            return await connection.ExecuteAsync("UPDATE Freelancer SET IsArchived = 1 WHERE Id = @Id", new { Id = id }) > 0;
        }

        public async Task<bool> UnarchiveAsync(int id)
        {
            using var connection = GetConnection();
            return await connection.ExecuteAsync("UPDATE Freelancer SET IsArchived = 0 WHERE Id = @Id", new { Id = id }) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = GetConnection();
            await connection.ExecuteAsync("DELETE FROM Skillset WHERE FreelancerId = @Id", new { Id = id });
            await connection.ExecuteAsync("DELETE FROM Hobby WHERE FreelancerId = @Id", new { Id = id });
            return await connection.ExecuteAsync("DELETE FROM Freelancer WHERE Id = @Id", new { Id = id }) > 0;
        }

        private async Task LoadRelatedData(SqlConnection connection, List<Freelancer> freelancers)
        {
            if (!freelancers.Any()) return;

            var ids = freelancers.Select(f => f.Id).ToList();
            var skillsets = await connection.QueryAsync<Skillset>(
                "SELECT * FROM Skillset WHERE FreelancerId IN @Ids", new { Ids = ids });
            var hobbies = await connection.QueryAsync<Hobby>(
                "SELECT * FROM Hobby WHERE FreelancerId IN @Ids", new { Ids = ids });

            foreach (var f in freelancers)
            {
                f.Skillsets = skillsets.Where(s => s.FreelancerId == f.Id).ToList();
                f.Hobbies = hobbies.Where(h => h.FreelancerId == f.Id).ToList();
            }
        }

        //public async Task<IEnumerable<Freelancer>> GetAllAsync()
        //{
        //    using var connection = GetConnection();
        //    var freelancers = (await connection.QueryAsync<Freelancer>("SELECT * FROM Freelancer")).ToList();
        //    await LoadRelatedData(connection, freelancers);
        //    return freelancers;
        //}

        //public async Task<IEnumerable<Freelancer>> GetArchivedAsync()
        //{
        //    using var connection = GetConnection();
        //    var freelancers = (await connection.QueryAsync<Freelancer>("SELECT * FROM Freelancer WHERE IsArchived = 1")).ToList();
        //    await LoadRelatedData(connection, freelancers);
        //    return freelancers;
        //}

        //public async Task<IEnumerable<Freelancer>> GetUnarchivedAsync()
        //{
        //    using var connection = GetConnection();
        //    var freelancers = (await connection.QueryAsync<Freelancer>("SELECT * FROM Freelancer WHERE IsArchived = 0")).ToList();
        //    await LoadRelatedData(connection, freelancers);
        //    return freelancers;
        //}

        //public async Task<IEnumerable<Freelancer>> SearchAsync(string searchPhrase, bool archived = false)
        //{
        //    using var connection = GetConnection();
        //    var sql = @"SELECT * FROM Freelancer
        //                WHERE (Username LIKE @SearchPhrase OR Email LIKE @SearchPhrase OR PhoneNum LIKE @SearchPhrase)
        //                AND IsArchived = @Archived";
        //    var freelancers = (await connection.QueryAsync<Freelancer>(
        //        sql, new { SearchPhrase = $"%{searchPhrase}%", Archived = archived ? 1 : 0 })).ToList();
        //    await LoadRelatedData(connection, freelancers);
        //    return freelancers;
        //}
    }
}