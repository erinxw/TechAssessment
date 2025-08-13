using Microsoft.AspNetCore.Mvc;
using TechAssessment.Data;
using TechAssessment.Models;

namespace TechAssessment.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class FreelancersAPIController : ControllerBase
    {
        private readonly IFreelancerRepository _repository;

        public FreelancersAPIController(IFreelancerRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]                       //http://localhost:5095/api/freelancersapi
        public async Task<IActionResult> GetAll() =>
            Ok(await _repository.GetAllAsync());

        [HttpGet("archived")]           //http://localhost:5095/api/freelancersapi/archived
        public async Task<IActionResult> GetArchived() =>
            Ok(await _repository.GetArchivedAsync());

        [HttpGet("unarchived")]         //http://localhost:5095/api/freelancersapi/unarchived
        public async Task<IActionResult> GetUnarchived() =>
            Ok(await _repository.GetUnarchivedAsync());

        [HttpGet("{id}")]               //http://localhost:5095/api/freelancersapi/{id}
        public async Task<IActionResult> GetById(int id)
        {
            var freelancer = await _repository.GetByIdAsync(id);
            return freelancer is null ? NotFound() : Ok(freelancer);
        }

        [HttpGet("search")]             //http://localhost:5095/api/freelancersapi/search?searchPhrase={searchPhrase}
        public async Task<IActionResult> Search([FromQuery] string searchPhrase, [FromQuery] bool archived = false)
        {
            if (string.IsNullOrWhiteSpace(searchPhrase))
                return BadRequest("Search phrase cannot be empty.");

            return Ok(await _repository.SearchAsync(searchPhrase, archived));
        }

        [HttpPost]                      //http://localhost:5095/api/freelancersapi
        public async Task<IActionResult> Create([FromBody] Freelancer freelancer)
        {
            var newId = await _repository.CreateAsync(freelancer);
            return CreatedAtAction(nameof(GetById), new { id = newId }, freelancer);
        }

        [HttpPut("{id}")]               //http://localhost:5095/api/freelancersapi/{id}
        public async Task<IActionResult> Update(int id, [FromBody] Freelancer freelancer)
        {
            if (id != freelancer.Id)
                return BadRequest("Freelancer ID mismatch.");

            return await _repository.UpdateAsync(freelancer) ? NoContent() : NotFound();
        }

        [HttpPatch("{id}/archive")]     //http://localhost:5095/api/freelancersapi/{id}/archive
        public async Task<IActionResult> Archive(int id) =>
            await _repository.ArchiveAsync(id) ? NoContent() : NotFound();

        [HttpPatch("{id}/unarchive")]   //http://localhost:5095/api/freelancersapi/{id}/unarchive
        public async Task<IActionResult> Unarchive(int id) =>
            await _repository.UnarchiveAsync(id) ? NoContent() : NotFound();

        [HttpDelete("{id}")]            //http://localhost:5095/api/freelancersapi/{id}
        public async Task<IActionResult> Delete(int id) =>
            await _repository.DeleteAsync(id) ? NoContent() : NotFound();
    }
}
