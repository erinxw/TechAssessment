using Microsoft.Data.SqlClient;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using TechAssessment.Data;
using TechAssessment.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TechAssessment.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class FreelancersAPIController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public FreelancersAPIController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private SqlConnection GetConnection()
        {
            return new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        }

        // GET: api/FreelancersAPI
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            using var connection = GetConnection();

            var freelancers = (await connection.QueryAsync<Freelancer>("SELECT * FROM Freelancer WHERE IsArchived = 0")).ToList();

            var freelancerIds = freelancers.Select(f => f.Id).ToList();

            var skillsets = await connection.QueryAsync<Skillset>(
                "SELECT * FROM Skillset WHERE FreelancerId IN @Ids",
                new { Ids = freelancerIds });

            var hobbies = await connection.QueryAsync<Hobby>(
                "SELECT * FROM Hobby WHERE FreelancerId IN @Ids",
                new { Ids = freelancerIds });

            foreach (var freelancer in freelancers)
            {
                freelancer.Skillsets = skillsets.Where(s => s.FreelancerId == freelancer.Id).ToList();
                freelancer.Hobbies = hobbies.Where(h => h.FreelancerId == freelancer.Id).ToList();
            }

            return Ok(freelancers);
        }

        // GET: api/FreelancersAPI/archived
        [HttpGet("archived")]
        public async Task<IActionResult> GetArchived()
        {
            using var connection = GetConnection();

            var freelancers = (await connection.QueryAsync<Freelancer>("SELECT * FROM Freelancer WHERE IsArchived = 1")).ToList();

            var freelancerIds = freelancers.Select(f => f.Id).ToList();

            var skillsets = await connection.QueryAsync<Skillset>(
                "SELECT * FROM Skillset WHERE FreelancerId IN @Ids",
                new { Ids = freelancerIds });

            var hobbies = await connection.QueryAsync<Hobby>(
                "SELECT * FROM Hobby WHERE FreelancerId IN @Ids",
                new { Ids = freelancerIds });

            foreach (var freelancer in freelancers)
            {
                freelancer.Skillsets = skillsets.Where(s => s.FreelancerId == freelancer.Id).ToList();
                freelancer.Hobbies = hobbies.Where(h => h.FreelancerId == freelancer.Id).ToList();
            }

            return Ok(freelancers);
        }

        // GET: api/FreelancersAPI/unarchived
        [HttpGet("unarchived")]
        public async Task<IActionResult> GetUnarchived()
        {
            using var connection = GetConnection();
            var sql = "SELECT * FROM Freelancer WHERE IsArchived = 0";
            var freelancers = await connection.QueryAsync<Freelancer>(sql);
            return Ok(freelancers);
        }

        // GET: api/FreelancersAPI/search?searchPhrase={searchPhrase}
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string searchPhrase, [FromQuery] bool archived = false)
        {
            if (string.IsNullOrWhiteSpace(searchPhrase))
            {
                return BadRequest("Search phrase cannot be empty.");
            }
            using var connection = GetConnection();
            var sql = @"SELECT * FROM Freelancer
                        WHERE Username LIKE @SearchPhrase OR Email LIKE @SearchPhrase OR PhoneNum LIKE @SearchPhrase";
            var freelancers = await connection.QueryAsync<Freelancer>(sql, new { SearchPhrase = $"%{searchPhrase}%", Archived = archived ? 1 : 0 });
            return Ok(freelancers);
        }

        // GET: api/FreelancersAPI/id
        [HttpGet("{id}")]
        public async Task<IActionResult> Details(int id)
        {
            using var connection = GetConnection();
            var sql = "SELECT * FROM Freelancer WHERE Id = @Id";
            var freelancer = await connection.QuerySingleOrDefaultAsync<Freelancer>(sql, new { Id = id });
            if (freelancer is null)
            {
                return NotFound();
            }

            freelancer.Skillsets = (await connection.QueryAsync<Skillset>(
                "SELECT * FROM Skillset WHERE FreelancerId = @Id", new { Id = id })).ToList();
            freelancer.Hobbies = (await connection.QueryAsync<Hobby>(
                "SELECT * FROM Hobby WHERE FreelancerId = @Id", new { Id = id })).ToList();

            return Ok(freelancer);
        }

        // POST: api/FreelancersAPI
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Freelancer freelancer)
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

            freelancer.Id = newId; // Set the Id of the created freelancer
            return CreatedAtAction(nameof(Details), new { id = newId }, freelancer);
        }

        // PUT: api/FreelancersAPI/id
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Freelancer freelancer)
        {
            if (id != freelancer.Id)
            {
                return BadRequest("Freelancer ID mismatch.");
            }
            using var connection = GetConnection();
            var sql = @"UPDATE Freelancer
                        SET Username = @Username, Email = @Email, PhoneNum = @PhoneNum, IsArchived = @IsArchived
                        WHERE Id = @Id";
            var rowsAffected = await connection.ExecuteAsync(sql, freelancer);
            if (rowsAffected == 0)
            {
                return NotFound();
            }

            await connection.ExecuteAsync("DELETE FROM Skillset WHERE FreelancerId = @Id", new { Id = id });
            if (freelancer.Skillsets != null)
            {
                foreach (var skill in freelancer.Skillsets)
                {
                    skill.FreelancerId = id;
                    await connection.ExecuteAsync(
                        "INSERT INTO Skillset (FreelancerId, SkillName) VALUES (@FreelancerId, @SkillName)",
                        skill);
                }
            }

            await connection.ExecuteAsync("DELETE FROM Hobby WHERE FreelancerId = @Id", new { Id = id });
            if (freelancer.Hobbies != null)
            {
                foreach (var hobby in freelancer.Hobbies)
                {
                    hobby.FreelancerId = id;
                    await connection.ExecuteAsync(
                        "INSERT INTO Hobby (FreelancerId, HobbyName) VALUES (@FreelancerId, @HobbyName)",
                        hobby);
                }
            }

            return NoContent();
        }

        // PATCH: api/FreelancersAPI/id/archive
        [HttpPatch("{id}/archive")]
        public async Task<IActionResult> Archive(int id)
        {
            using var connection = GetConnection();
            var sql = "UPDATE Freelancer SET IsArchived = 1 WHERE Id = @Id";
            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
            if (rowsAffected == 0)
            {
                return NotFound();
            }
            return NoContent();
        }

        // PATCH: api/FreelancersAPI/id/unarchive
        [HttpPatch("{id}/unarchive")]
        public async Task<IActionResult> Unarchive(int id)
        {
            using var connection = GetConnection();
            var sql = "UPDATE Freelancer SET IsArchived = 0 WHERE Id = @Id";
            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
            if (rowsAffected == 0)
            {
                return NotFound();
            }
            return NoContent();
        }

        // DELETE: api/FreelancersAPI/id
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            using var connection = GetConnection();
            
            await connection.ExecuteAsync("DELETE FROM Skillset WHERE FreelancerId = @Id", new { Id = id });
            await connection.ExecuteAsync("DELETE FROM Hobby WHERE FreelancerId = @Id", new { Id = id });

            var rowsAffected = await connection.ExecuteAsync("DELETE FROM Freelancer WHERE Id = @Id", new { Id = id });
            if (rowsAffected == 0)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}
