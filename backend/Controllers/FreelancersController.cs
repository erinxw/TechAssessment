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

        [HttpGet("filter")] //http://localhost:5095/api/freelancers/filter?isArchived={true/false}&searchPhrase={searchPhrase}
        public async Task<IActionResult> GetFiltered(
            int currentPageNumber = 1,
            int pageSize = 10,
            [FromQuery] bool? isArchived = null,
            [FromQuery] string? searchPhrase = null,
            [FromQuery] string sortOrder = "asc"
        )
        {
            if (!string.IsNullOrWhiteSpace(searchPhrase) && searchPhrase.Length < 2)
                return BadRequest("Search phrase must be at least 2 characters long."); //400

            return Ok(
                await _repository.GetFreelancersAsync(
                    currentPageNumber,
                    pageSize,
                    isArchived,
                    searchPhrase,
                    sortOrder
                )
            );
        }

        [HttpGet("{id}")] //http://localhost:5095/api/freelancers/{id}
        public async Task<IActionResult> GetById(int id)
        {
            var freelancer = await _repository.GetByIdAsync(id);
            return freelancer is null ? NotFound() : Ok(freelancer);
        }

        [AllowAnonymous]
        [HttpPost] //http://localhost:5095/api/freelancers
        public async Task<IActionResult> Create([FromBody] Freelancer freelancer)
        {
            try
            {
                if (string.IsNullOrEmpty(freelancer.Username))
                {
                    return BadRequest(new { message = "Username is required" });
                }

                if (string.IsNullOrEmpty(freelancer.Email))
                {
                    return BadRequest(new { message = "Email is required" });
                }

                if (string.IsNullOrEmpty(freelancer.PhoneNum))
                {
                    return BadRequest(new { message = "Phone number is required" });
                }

                // // Email format validation
                // var emailRegex = new System.Text.RegularExpressions.Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
                // if (!emailRegex.IsMatch(freelancer.Email))
                //     return BadRequest(new { message = "Please enter a valid email address." });

                // // Phone format validation
                // var phoneRegex = new System.Text.RegularExpressions.Regex(@"^\+?[0-9\s\-]{7,20}$");
                // if (!phoneRegex.IsMatch(freelancer.PhoneNum))
                //     return BadRequest(new { message = "Invalid phone number format." });

                // // Password validation
                // if (!string.IsNullOrEmpty(freelancer.Password) && freelancer.Password.Length < 8)
                //     return BadRequest(new { message = "Password must be at least 8 characters long." });

                // // Check for duplicate username
                // var existing = await _repository.GetByUsernameAsync(freelancer.Username);
                // if (existing != null)
                // {
                //     return BadRequest(new { message = "Username already exists. Please choose another." });
                // }

                // // Check for duplicate email
                // var existingEmail = await _repository.GetByEmailAsync(freelancer.Email);
                // if (existingEmail != null)
                // {
                //     return BadRequest(new { message = "Email is already registered. Please sign in." });
                // }

                var newId = await _repository.CreateAsync(freelancer);
                return CreatedAtAction(nameof(GetById), new { id = newId }, freelancer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        [HttpPut("{id}")] //http://localhost:5095/api/freelancers/{id}
        public async Task<IActionResult> Update(int id, [FromBody] Freelancer freelancer)
        {
            if (id != freelancer.Id)
                return BadRequest("Freelancer ID mismatch.");

            if (string.IsNullOrEmpty(freelancer.Username))
            {
                return BadRequest(new { message = "Username is required" });
            }

            if (string.IsNullOrEmpty(freelancer.Email))
            {
                return BadRequest(new { message = "Email is required" });
            }

            if (string.IsNullOrEmpty(freelancer.PhoneNum))
            {
                return BadRequest(new { message = "Phone number is required" });
            }

            return await _repository.UpdateAsync(freelancer) ? NoContent() : NotFound(); // 201
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/archive")] //http://localhost:5095/api/freelancers/{id}/archive
        public async Task<IActionResult> Archive(int id) =>
            await _repository.ArchiveAsync(id) ? NoContent() : NotFound();

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/unarchive")] //http://localhost:5095/api/freelancers/{id}/unarchive
        public async Task<IActionResult> Unarchive(int id) =>
            await _repository.UnarchiveAsync(id) ? NoContent() : NotFound();

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")] //http://localhost:5095/api/freelancers/{id}
        public async Task<IActionResult> Delete(int id) =>
            await _repository.DeleteAsync(id) ? NoContent() : NotFound();
    }
}
