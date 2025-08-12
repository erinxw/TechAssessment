using System.Collections.Generic;
using System.Threading.Tasks;
using TechAssessment.Models;

namespace TechAssessment.Data
{
    public interface IFreelancerRepository
    {
        Task<IEnumerable<Freelancer>> GetAllFreelancersAsync();
        Task<Freelancer> GetFreelancerDetailsAsync(int id);
        Task ArchiveFreelancer(int id);
        Task UnarchiveFreelancer(int id);
        Task<IEnumerable<Freelancer>> GetArchivedFreelancers();
        Task<Freelancer> CreateFreelancerAsync(Freelancer freelancer, string skillsets, string hobbies);
        Task UpdateFreelancerAsync(Freelancer freelancer);
    }
}
