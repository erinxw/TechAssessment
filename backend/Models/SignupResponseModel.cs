namespace TechAssessment.Models
{
    public class SignupResponseModel
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public string AccessToken { get; set; } = string.Empty;
        public int ExpiresIn { get; set; }
    }
}