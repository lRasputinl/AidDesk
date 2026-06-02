using AidDeskAPI.API.AuditLog.Services;
using AidDeskAPI.API.Auth.Services;
using AidDeskAPI.API.Comments.Services;
using AidDeskAPI.API.TicketHistory.Services;
using AidDeskAPI.API.Tickets.Services;
using AidDeskAPI.API.Users.Services;
using AidDeskDatabase_DataAccess_EF;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSwaggerGen(o =>
{
    o.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Paste a JWT access token here."
    });
    o.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("bearer", document)] = []
    });
});

builder.Services.AddControllers();
builder.Services.AddDbContext<AidDeskDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = Environment.GetEnvironmentVariable("Jwt__Issuer"),
            ValidAudience = Environment.GetEnvironmentVariable("Jwt__Audience"),

            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("Jwt__Key")))
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend-part", policy =>
    {
        policy.WithOrigins("http://localhost:5173");
        policy.AllowAnyHeader();
        policy.AllowAnyMethod();
        policy.AllowCredentials();
    });
});

builder.Services.AddTransient<ITicketService, TicketService>();
builder.Services.AddTransient<IUserService, UserService>();
builder.Services.AddTransient<ICommentService, CommentService>();
builder.Services.AddTransient<ITicketHistoryService, TicketHistoryService>();
builder.Services.AddTransient<IAuditLogService, AuditLogService>();
builder.Services.AddTransient<IAuthService, AuthService>();

var app = builder.Build();
app.UseCors("frontend-part");
app.UseExceptionHandler(errApp =>
{
    errApp.Run(async context =>
    {
        var feature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        var ex = feature?.Error;

        context.Response.ContentType = "application/json";

        if (ex is InvalidOperationException)
        {
            context.Response.StatusCode = 400;
        }
        else if (ex is UnauthorizedAccessException)
        {
            context.Response.StatusCode = 403;
        }
        else
        {
            context.Response.StatusCode = 500;
        }

        var message = ex?.Message ?? "Внутренняя ошибка сервера.";
        await context.Response.WriteAsJsonAsync(new { message });
    });
});

app.UseAuthentication();
app.UseAuthorization();
app.UseSwagger().UseSwaggerUI();
app.MapControllers();
app.Run();