using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechAssessment.Data;
using TechAssessment.Models;

namespace TechAssessment.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FreelancersController : ControllerBase
    {
        private readonly IFreelancerRepository _repository;

        public FreelancersController(IFreelancerRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("filter")]             //http://localhost:5095/api/freelancers/filter?isArchived={true/false}&searchPhrase={searchPhrase}
        public async Task<IActionResult> GetFiltered(int currentPageNumber = 1, int pageSize = 10, [FromQuery] bool? isArchived = null, [FromQuery] string? searchPhrase = null, [FromQuery] string sortOrder = "asc")
        {
            if (!string.IsNullOrWhiteSpace(searchPhrase) && searchPhrase.Length < 2)
                return BadRequest("Search phrase must be at least 2 characters long.");     //400

            return Ok(await _repository.GetFreelancersAsync(currentPageNumber, pageSize, isArchived, searchPhrase, sortOrder));
        }

        [HttpGet("{id}")]               //http://localhost:5095/api/freelancers/{id}
        public async Task<IActionResult> GetById(int id)
        {
            var freelancer = await _repository.GetByIdAsync(id);
            return freelancer is null ? NotFound() : Ok(freelancer);
        }

        [HttpPost]                      //http://localhost:5095/api/freelancers
        public async Task<IActionResult> Create([FromBody] Freelancer freelancer)
        {
            try
            {
                Console.WriteLine("===== CREATE FREELANCER =====");
                Console.WriteLine("[Create] Incoming Freelancer payload:");
                Console.WriteLine($"Username: {freelancer.Username}");
                Console.WriteLine($"Email: {freelancer.Email}");
                Console.WriteLine($"PhoneNum: {freelancer.PhoneNum}");
                Console.WriteLine($"Skillsets: {System.Text.Json.JsonSerializer.Serialize(freelancer.Skillsets)}");
                Console.WriteLine($"Hobbies: {System.Text.Json.JsonSerializer.Serialize(freelancer.Hobbies)}");

                if (string.IsNullOrEmpty(freelancer.Username))
                {
                    Console.WriteLine("[Create] Username is required.");
                    return BadRequest(new { message = "Username is required" });
                }

                if (freelancer.Email == null || freelancer.Email == "")
                {
                    Console.WriteLine("[Create] Email is required.");
                    return BadRequest(new { message = "Email is required" });
                }

                if (freelancer.PhoneNum == null || freelancer.PhoneNum == "")
                {
                    Console.WriteLine("[Create] Phone number is required.");
                    return BadRequest(new { message = "Phone number is required" });
                }

                // Email format validation
                var emailRegex = new System.Text.RegularExpressions.Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
                if (!emailRegex.IsMatch(freelancer.Email))
                {
                    Console.WriteLine("[Create] Invalid email format.");
                    return BadRequest(new { message = "Please enter a valid email address." });
                }

                // Phone format validation
                var phoneRegex = new System.Text.RegularExpressions.Regex(@"^\+?[0-9\s\-]{7,20}$");
                if (!phoneRegex.IsMatch(freelancer.PhoneNum))
                {
                    Console.WriteLine("[Create] Invalid phone number format.");
                    return BadRequest(new { message = "Invalid phone number format." });
                }

                // Check for duplicate username
                var existing = await _repository.GetByUsernameAsync(freelancer.Username);
                if (existing != null)
                {
                    Console.WriteLine("[Create] Username already exists.");
                    return BadRequest(new { message = "Username already exists. Please choose another." });
                }

                // Check for duplicate email
                var existingEmail = await _repository.GetByEmailAsync(freelancer.Email);
                if (existingEmail != null)
                {
                    Console.WriteLine("[Create] Email already registered.");
                    return BadRequest(new { message = "Email is already registered. Please sign in." });
                }

                var newId = await _repository.CreateAsync(freelancer);
                Console.WriteLine($"[Create] Freelancer created with Id: {newId}");
                return CreatedAtAction(nameof(GetById), new { id = newId }, freelancer);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Create] Exception: {ex.Message}");
                Console.WriteLine($"[Create] StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        [HttpPut("{id}")] //http://localhost:5095/api/freelancers/{id}
        public async Task<IActionResult> Update(int id, [FromBody] Freelancer freelancer)
        {
            Console.WriteLine($"[Update] Incoming model: Id={freelancer.Id}, Username={freelancer.Username}, Email={freelancer.Email}, PhoneNum={freelancer.PhoneNum}");

            if (id != freelancer.Id)
            {
                Console.WriteLine("[Update] Freelancer ID mismatch.");
                return BadRequest("Freelancer ID mismatch.");
            }

            if (string.IsNullOrEmpty(freelancer.Username))
            {
                Console.WriteLine("[Update] Username is required.");
                return BadRequest(new { message = "Username is required" });
            }

            if (string.IsNullOrEmpty(freelancer.Email))
            {
                Console.WriteLine("[Update] Email is required.");
                return BadRequest(new { message = "Email is required" });
            }

            if (string.IsNullOrEmpty(freelancer.PhoneNum))
            {
                Console.WriteLine("[Update] Phone number is required.");
                return BadRequest(new { message = "Phone number is required" });
            }

            var updateResult = await _repository.UpdateAsync(freelancer);
            Console.WriteLine($"[Update] UpdateAsync result: {updateResult}");
            return updateResult ? NoContent() : NotFound(); // 201
        }

        [HttpPatch("{id}/archive")] //http://localhost:5095/api/freelancers/{id}/archive
        public async Task<IActionResult> Archive(int id) =>
            await _repository.ArchiveAsync(id) ? NoContent() : NotFound();

        [HttpPatch("{id}/unarchive")] //http://localhost:5095/api/freelancers/{id}/unarchive
        public async Task<IActionResult> Unarchive(int id) =>
            await _repository.UnarchiveAsync(id) ? NoContent() : NotFound();

        [HttpDelete("{id}")]            //http://localhost:5095/api/freelancers/{id}
        public async Task<IActionResult> Delete(int id) =>
            await _repository.DeleteAsync(id) ? NoContent() : NotFound();

        //[HttpGet]                       //http://localhost:5095/api/freelancersapi
        //public async Task<IActionResult> GetAll() =>
        //    Ok(await _repository.GetAllAsync());

        //[HttpGet("archived")]           //http://localhost:5095/api/freelancersapi/archived
        //public async Task<IActionResult> GetArchived() =>
        //    Ok(await _repository.GetArchivedAsync());

        //[HttpGet("unarchived")]         //http://localhost:5095/api/freelancersapi/unarchived
        //public async Task<IActionResult> GetUnarchived() =>
        //    Ok(await _repository.GetUnarchivedAsync());

        //[HttpGet("search")]             //http://localhost:5095/api/freelancersapi/search?searchPhrase={searchPhrase}
        //public async Task<IActionResult> Search([FromQuery] string searchPhrase, [FromQuery] bool archived = false)
        //{
        //    if (string.IsNullOrWhiteSpace(searchPhrase))
        //        return BadRequest("Search phrase cannot be empty.");

        //    return Ok(await _repository.SearchAsync(searchPhrase, archived));
        //}
    }
}