using Banebooking.Api.Data;
using Microsoft.EntityFrameworkCore;
using Banebooking.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

var connectionString =
    builder.Configuration["ConnectionStrings:DefaultConnection"]
    ?? builder.Configuration["SUPABASE_CONNECTIONSTRING"];

builder.Services.AddDbContext<BanebookingDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddSupabaseAuthentication(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<BanebookingDbContext>();
        db.Database.Migrate();

        Tesdata.Seed(db);
    }

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
