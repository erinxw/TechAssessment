using System.Data;
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
        private readonly IFreelancerRepository _freelancerRepository;

        public FreelancersController(IConfiguration configuration, IFreelancerRepository freelancerRepository)
        {
            _configuration = configuration;
            _freelancerRepository = freelancerRepository;
        }

        // GET: Freelancers
        public async Task<IActionResult> Index()
        {
            var freelancers = await _freelancerRepository.GetAllFreelancersAsync();
            return View(freelancers);
        }

        // GET: Freelancers/ShowSearchForm
        public IActionResult ShowSearchForm() => View();

        // POST: Freelancers/ShowSearchResultsUnarchived
        public async Task<IActionResult> ShowSearchResultsUnarchived(string SearchPhrase)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = "SELECT * FROM Freelancer WHERE Username LIKE @SearchPhrase OR Email LIKE @SearchPhrase AND IsArchived = 0";
            var freelancers = await connection.QueryAsync<Freelancer>(sql, new { SearchPhrase = $"%{SearchPhrase}%" });
            return View("Index", freelancers);
        }

        // POST: Freelancers/ShowSearchResultsUnarchived
        public async Task<IActionResult> ShowSearchResultsArchived(string SearchPhrase)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = "SELECT * FROM Freelancer WHERE Username LIKE @SearchPhrase OR Email LIKE @SearchPhrase AND IsArchived = 1";
            var freelancers = await connection.QueryAsync<Freelancer>(sql, new { SearchPhrase = $"%{SearchPhrase}%" });
            return View("Archive", freelancers);
        }

        // GET: Freelancers/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            var freelancer = await _freelancerRepository.GetFreelancerDetailsAsync(id);

            var freelancer = await _freelancerRepository.GetFreelancerDetailsAsync(id.Value);
            return freelancer is null ? NotFound() : View(freelancer);
        }

        // GET: Freelancers/Create
        public IActionResult Create() => View();

        // Add these parameters to the Create action method signature
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Freelancer freelancer, string Skillsets, string Hobbies)
        {
            if (!ModelState.IsValid) return View(freelancer);

            await _freelancerRepository.CreateFreelancerAsync(freelancer, Skillsets, Hobbies);

            return RedirectToAction(nameof(Index));
        }

        // GET: Freelancers/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id is null) return NotFound();

            var freelancer = await _freelancerRepository.GetFreelancerDetailsAsync(id.Value);
            return freelancer is null ? NotFound() : View(freelancer);
        }

        // POST: Freelancers/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Freelancer freelancer, string SkillsetsInput, string HobbiesInput)
        {
            if (id != freelancer.Id) return NotFound();
            if (!ModelState.IsValid) return View(freelancer);

            // Parse inputs to lists if needed
            var skillList = SkillsetsInput?.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList() ?? new List<string>();
            var hobbyList = HobbiesInput?.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(h => h.Trim()).ToList() ?? new List<string>();

            await _freelancerRepository.UpdateFreelancerAsync(freelancer);

            return RedirectToAction(nameof(Index));
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

        [HttpPost]
        public async Task<IActionResult> Archive(int id)
        {
            await _freelancerRepository.ArchiveFreelancer(id);
            return RedirectToAction("Index");
        }

        [HttpPost]
        public async Task<IActionResult> Unarchive(int id)
        {
            await _freelancerRepository.UnarchiveFreelancer(id);
            return RedirectToAction("Index");
        }
        public async Task<IActionResult> ViewArchive()
        {
            var archivedFreelancers = await _freelancerRepository.GetArchivedFreelancers();
            return View("Archive", archivedFreelancers); 
        }
    }
}
