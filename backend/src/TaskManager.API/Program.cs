using System.Text;
using System.Text.Json.Serialization;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TaskManager.Application;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Infrastructure;
using TaskManager.Infrastructure.Data;
using TaskManager.Infrastructure.Services;

// Load environment variables from .env file
var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".env");
if (File.Exists(envPath))
{
    Env.Load(envPath);
}
else
{
    Console.WriteLine($"Warning: .env file not found at {envPath}");
}

var builder = WebApplication.CreateBuilder(args);

// Override configuration with environment variables
builder.Configuration.AddInMemoryCollection(new[]
{
    new KeyValuePair<string, string?>("ConnectionStrings:DefaultConnection", Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING")),
    new KeyValuePair<string, string?>("Jwt:Secret", Environment.GetEnvironmentVariable("JWT_SECRET")),
    new KeyValuePair<string, string?>("Jwt:Issuer", Environment.GetEnvironmentVariable("JWT_ISSUER")),
    new KeyValuePair<string, string?>("Jwt:Audience", Environment.GetEnvironmentVariable("JWT_AUDIENCE")),
    new KeyValuePair<string, string?>("CorsOrigins", Environment.GetEnvironmentVariable("CORS_ORIGINS")),
    new KeyValuePair<string, string?>("Slack:WebhookUrl", Environment.GetEnvironmentVariable("SLACK_WEBHOOK_URL")),
    new KeyValuePair<string, string?>("Slack:Channel", Environment.GetEnvironmentVariable("SLACK_CHANNEL")),
    new KeyValuePair<string, string?>("Slack:BaseUrl", Environment.GetEnvironmentVariable("API_BASE_URL")),
    new KeyValuePair<string, string?>("Slack:ClientBaseUrl", Environment.GetEnvironmentVariable("BASE_WEBHOOK_URL"))
});

// Add services to the container
builder.Services.AddControllers().AddJsonOptions(options => {
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<TaskManagerContext>(options => 
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add layer-specific services
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Add Slack webhook integration
builder.Services.Configure<TaskManager.Infrastructure.Models.SlackSettings>(builder.Configuration.GetSection("Slack"));
builder.Services.AddHttpClient<ISlackNotifier, SlackNotifierService>();

// Service registration
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"] ?? "default-key-that-should-be-changed"))
        };
    });

builder.Services.AddAuthorization();

// CORS configuration - Allow all origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Previous CORS configuration (commented out for reference)
// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("AllowFrontend", policy =>
//     {
//         var corsOrigins = builder.Configuration["CorsOrigins"]?.Split(',') ?? new[] { "http://localhost:4200" };
//         policy.WithOrigins(corsOrigins)
//               .AllowAnyHeader()
//               .AllowAnyMethod()
//               .AllowCredentials();
//     });
// });

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TaskManagerContext>();
    context.Database.EnsureCreated();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
