using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using TechAssessment.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace TechAssessment.Pages
{
    public class CreateFreelancerModel : PageModel
    {
        private readonly IHttpClientFactory _clientFactory;

        public CreateFreelancerModel(IHttpClientFactory clientFactory)
        {
            _clientFactory = clientFactory;
        }

        [BindProperty]
        public Freelancer Freelancer { get; set; } = new Freelancer
        {
            Username = "",
            Email = "",
            PhoneNum = "",
            Skillsets = new List<Skillset>(),
            Hobbies = new List<Hobby>()
        };

        public string Message { get; set; }

        public void OnGet()
        {
            // Page loads empty form
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            var client = _clientFactory.CreateClient();
            var response = await client.PostAsJsonAsync("https://localhost:7202/api/freelancersapi",new
                {
                    Username = Freelancer.Username,
                    Email = Freelancer.Email,
                    PhoneNum = Freelancer.PhoneNum,
                    Skillsets = Freelancer.Skillsets,
                    Hobbies = Freelancer.Hobbies
                });

            if (response.IsSuccessStatusCode)
            {
                Message = "Freelancer created successfully!";
            }
            else
            {
                Message = $"Error: {response.StatusCode}";
            }

            return Page();
        }
    }
}
