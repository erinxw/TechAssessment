using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TechAssessment.Data;
using TechAssessment.Models;

public class JwtService
{
    private readonly IFreelancerRepository _repository;
    private readonly IConfiguration _configuration;

    public JwtService(IFreelancerRepository repository, IConfiguration configuration)
    {
        _repository = repository;
        _configuration = configuration;
    }

    public async Task<LoginResponseModel> Authenticate(LoginRequestModel request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            return null;

        // Use the repository method to get freelancer by username
        var freelancer = await _repository.GetByUsernameAsync(request.Username);

        if (freelancer is null)
        {
            return null;
        }

        if (!PasswordHashHandler.VerifyPassword(request.Password, freelancer.Password))
        {
            return null;
        }

        var issuer = _configuration["JwtConfig:Issuer"];
        var audience = _configuration["JwtConfig:Audience"];
        var key = _configuration["JwtConfig:Key"];
        var tokenValidityMins = _configuration.GetValue<int>("JwtConfig:TokenValidityMins");

        var tokenExpiryTimeStamp = DateTime.UtcNow.AddMinutes(tokenValidityMins);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Name, request.Username),
                new Claim(JwtRegisteredClaimNames.Sub, freelancer.Id.ToString())
            }),
            Expires = tokenExpiryTimeStamp,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.ASCII.GetBytes(key)), 
                SecurityAlgorithms.HmacSha256Signature),
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var securityToken = tokenHandler.CreateToken(tokenDescriptor);
        var accessToken = tokenHandler.WriteToken(securityToken);

        return new LoginResponseModel
        {
            Username = request.Username,
            AccessToken = accessToken,
            ExpiresIn = (int)tokenExpiryTimeStamp.Subtract(DateTime.UtcNow).TotalSeconds
        };
    }
}