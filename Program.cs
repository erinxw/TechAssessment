using TechAssessment.Data;
var builder = WebApplication.CreateBuilder(args);

// Tell Kestrel to listen on these URLs explicitly
builder.WebHost.UseUrls("http://localhost:5095", "https://localhost:7202");

//CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IConfiguration>(builder.Configuration);
builder.Services.AddScoped<IFreelancerRepository, FreelancerRepository>();
builder.Services.AddRazorPages();
builder.Services.AddHttpClient();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

// Serve static files (wwwroot)
app.UseStaticFiles();
app.UseRouting();

app.UseCors("AllowReactApp");

app.UseAuthorization();
app.MapRazorPages();
app.MapControllers();

app.Run();