using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Http;
using System.Net.Http.Json;
using TechAssessment.Models;

namespace TechAssessment.Pages
{
    public class IndexModel : PageModel
    {
        private readonly IHttpClientFactory _clientFactory;

        public IndexModel(IHttpClientFactory clientFactory)
        {
            _clientFactory = clientFactory;
        }

        // List to show existing freelancers
        public List<Freelancer> Freelancers { get; set; } = new List<Freelancer>();

        // Load all freelancers on page load
        public async Task OnGetAsync()
        {
            var client = _clientFactory.CreateClient();
            var response = await client.GetFromJsonAsync<List<Freelancer>>("https://localhost:7202/api/freelancersapi");
            if (response != null)
            {
                Freelancers = response;
            }
        }
    }
}
