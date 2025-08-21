using Microsoft.AspNetCore.Mvc;
using TechAssessment.Data;
using TechAssessment.Models;

namespace TechAssessment.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class FreelancersController : ControllerBase
    {
        private readonly IFreelancerRepository _repository;

        public FreelancersController(IFreelancerRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("filter")]             //http://localhost:5095/api/freelancers/filter?isArchived={true/false}&searchPhrase={searchPhrase}
        public async Task<IActionResult> GetFiltered(int currentPageNumber = 1, int pageSize = 10, [FromQuery] bool? isArchived = null, [FromQuery] string? searchPhrase = null)
        {
            if (!string.IsNullOrWhiteSpace(searchPhrase) && searchPhrase.Length < 2)
                return BadRequest("Search phrase must be at least 2 characters long.");     //400

            return Ok(await _repository.GetFreelancersAsync(currentPageNumber, pageSize, isArchived, searchPhrase));
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
            var newId = await _repository.CreateAsync(freelancer);
            return CreatedAtAction(nameof(GetById), new { id = newId }, freelancer);
        }

        [HttpPut("{id}")]               //http://localhost:5095/api/freelancers/{id}
        public async Task<IActionResult> Update(int id, [FromBody] Freelancer freelancer)
        {
            if (id != freelancer.Id)
                return BadRequest("Freelancer ID mismatch.");

            return await _repository.UpdateAsync(freelancer) ? NoContent() : NotFound();        // 201
        }

        [HttpPatch("{id}/archive")]     //http://localhost:5095/api/freelancers/{id}/archive
        public async Task<IActionResult> Archive(int id) =>
            await _repository.ArchiveAsync(id) ? NoContent() : NotFound();

        [HttpPatch("{id}/unarchive")]   //http://localhost:5095/api/freelancers/{id}/unarchive
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