using TechAssessment.Models;

namespace TechAssessment.Data
{
    public interface IFreelancerRepository
    {
        Task<PaginationResponse<List<Freelancer>>> GetFreelancersAsync(int currentPageNumber = 1, int pageSize = 10, bool? isArchived = null, string? searchPhrase = null);

        Task<Freelancer?> GetByIdAsync(int id);
        Task<int> CreateAsync(Freelancer freelancer);
        Task<bool> UpdateAsync(Freelancer freelancer);
        Task<bool> ArchiveAsync(int id);
        Task<bool> UnarchiveAsync(int id);
        Task<bool> DeleteAsync(int id);

        //Task<IEnumerable<Freelancer>> GetAllAsync();
        //Task<IEnumerable<Freelancer>> GetArchivedAsync();
        //Task<IEnumerable<Freelancer>> GetUnarchivedAsync();
        //Task<IEnumerable<Freelancer>> SearchAsync(string searchPhrase, bool archived = false);
    }
}