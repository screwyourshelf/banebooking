using Banebooking.Api.Data;
using Microsoft.EntityFrameworkCore;
using Banebooking.Api.Extensions;
using System.Globalization;
using Banebooking.Api.Tjenester;

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

builder.Services.AddMemoryCache();

builder.Services.AddHttpClient("VaerApi", client =>
{
    client.DefaultRequestHeaders.UserAgent.ParseAdd("Banebooking/1.0 (+mailto:andreas.lotarev@gmail.com)");
});

builder.Services.AddScoped<IKlubbService, KlubbService>();
builder.Services.AddScoped<IVaerService, VaerService>();
builder.Services.AddScoped<SlotBerikerMedVaer>();
builder.Services.AddScoped<IBookingService, BookingService>();

var app = builder.Build();

if (app.Environment.IsDevelopment() || 1 == 1)
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
