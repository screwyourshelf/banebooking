using Banebooking.Api.Data;
using Microsoft.EntityFrameworkCore;
using Banebooking.Api.Extensions;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

var cultureInfo = new CultureInfo("en-US");
CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;

var connectionString =
    builder.Configuration["ConnectionStrings:DefaultConnection"]
    ?? builder.Configuration["SUPABASE_CONNECTIONSTRING"];

builder.Services.AddDbContext<BanebookingDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddSupabaseAuthentication(builder.Configuration);
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
        options.JsonSerializerOptions.Converters.Add(new TimeOnlyJsonConverter());
    });
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
