using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TechAssessment.Data;
using TechAssessment.Models;

namespace TechAssessment.Controllers
{
    public class FreelancersController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly FreelancerRepository _freelancerRepository;

        public FreelancersController(IConfiguration configuration)
        {
            _configuration = configuration;
            _freelancerRepository = new FreelancerRepository(configuration);
        }

        // GET: Freelancers
        public async Task<IActionResult> Index()
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var freelancers = await connection.QueryAsync<Freelancer>("SELECT * FROM Freelancer");
            return View(freelancers);
        }

        // GET: Freelancers/ShowSearchForm
        public IActionResult ShowSearchForm() => View();

        // POST: Freelancers/ShowSearchResults
        public async Task<IActionResult> ShowSearchResults(string SearchPhrase)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = "SELECT * FROM Freelancer WHERE Username LIKE @SearchPhrase";
            var freelancers = await connection.QueryAsync<Freelancer>(sql, new { SearchPhrase = $"%{SearchPhrase}%" });
            return View("Index", freelancers);
        }

        // GET: Freelancers/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id is null) return NotFound();

            var freelancer = await _freelancerRepository.GetFreelancerWithDetails(id.Value);
            return freelancer is null ? NotFound() : View(freelancer);
        }

        // GET: Freelancers/Create
        public IActionResult Create() => View();

        // POST: Freelancers/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Freelancer freelancer)
        {
            if (!ModelState.IsValid) return View(freelancer);

            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                var sql = @"
                    INSERT INTO Freelancer (Username, Email, PhoneNum)
                    VALUES (@Username, @Email, @PhoneNum);
                    SELECT CAST(SCOPE_IDENTITY() AS INT);";

                var freelancerId = await connection.ExecuteScalarAsync<int>(sql, freelancer, transaction);

                if (freelancer.Skillsets?.Any() == true)
                {
                    foreach (var skill in freelancer.Skillsets)
                    {
                        skill.FreelancerId = freelancerId;
                        await connection.ExecuteAsync(
                            "INSERT INTO Skillset (FreelancerId, Name) VALUES (@FreelancerId, @Name);",
                            skill, transaction
                        );
                    }
                }

                if (freelancer.Hobbies?.Any() == true)
                {
                    foreach (var hobby in freelancer.Hobbies)
                    {
                        hobby.FreelancerId = freelancerId;
                        await connection.ExecuteAsync(
                            "INSERT INTO Hobby (FreelancerId, Name) VALUES (@FreelancerId, @Name);",
                            hobby, transaction
                        );
                    }
                }

                transaction.Commit();
                return RedirectToAction(nameof(Index));
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        // GET: Freelancers/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id is null) return NotFound();

            var freelancer = await _freelancerRepository.GetFreelancerWithDetails(id.Value);
            return freelancer is null ? NotFound() : View(freelancer);
        }

        // POST: Freelancers/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Freelancer freelancer)
        {
            if (id != freelancer.Id) return NotFound();
            if (!ModelState.IsValid) return View(freelancer);

            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                var updateSql = @"
                    UPDATE Freelancer 
                    SET Username = @Username, Email = @Email, PhoneNum = @PhoneNum 
                    WHERE Id = @Id;";
                await connection.ExecuteAsync(updateSql, freelancer, transaction);

                // Delete old and re-insert new Skillsets
                await connection.ExecuteAsync("DELETE FROM Skillset WHERE FreelancerId = @Id", new { Id = id }, transaction);
                if (freelancer.Skillsets?.Any() == true)
                {
                    foreach (var skill in freelancer.Skillsets)
                    {
                        skill.FreelancerId = id;
                        await connection.ExecuteAsync(
                            "INSERT INTO Skillset (FreelancerId, Name) VALUES (@FreelancerId, @Name);",
                            skill, transaction
                        );
                    }
                }

                // Delete old and re-insert new Hobbies
                await connection.ExecuteAsync("DELETE FROM Hobby WHERE FreelancerId = @Id", new { Id = id }, transaction);
                if (freelancer.Hobbies?.Any() == true)
                {
                    foreach (var hobby in freelancer.Hobbies)
                    {
                        hobby.FreelancerId = id;
                        await connection.ExecuteAsync(
                            "INSERT INTO Hobby (FreelancerId, Name) VALUES (@FreelancerId, @Name);",
                            hobby, transaction
                        );
                    }
                }

                transaction.Commit();
                return RedirectToAction(nameof(Index));
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        // GET: Freelancers/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id is null) return NotFound();

            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var freelancer = await connection.QueryFirstOrDefaultAsync<Freelancer>("SELECT * FROM Freelancer WHERE Id = @Id", new { Id = id });

            return freelancer is null ? NotFound() : View(freelancer);
        }

        // POST: Freelancers/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.ExecuteAsync("DELETE FROM Skillset WHERE FreelancerId = @Id", new { Id = id });
            await connection.ExecuteAsync("DELETE FROM Hobby WHERE FreelancerId = @Id", new { Id = id });
            await connection.ExecuteAsync("DELETE FROM Freelancer WHERE Id = @Id", new { Id = id });

            return RedirectToAction(nameof(Index));
        }

        private async Task<bool> FreelancerExists(int id)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var exists = await connection.ExecuteScalarAsync<int>(
                "SELECT IIF(EXISTS(SELECT 1 FROM Freelancer WHERE Id = @Id), 1, 0)",
                new { Id = id });
            return exists == 1;
        }
    }
}
