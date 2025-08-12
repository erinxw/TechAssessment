using TechAssessment.Data;

var builder = WebApplication.CreateBuilder(args);

// Tell Kestrel to listen on these URLs explicitly
builder.WebHost.UseUrls("http://localhost:5095", "https://localhost:7202");

// Only add API controllers (no Views)
builder.Services.AddControllers();
builder.Services.AddSingleton<IConfiguration>(builder.Configuration);
builder.Services.AddScoped<IFreelancerRepository, FreelancerRepository>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

//app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();

app.MapControllers();

app.Run();
