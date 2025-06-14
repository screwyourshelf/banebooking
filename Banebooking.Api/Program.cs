using Banebooking.Api.Data;
using Microsoft.EntityFrameworkCore;
using Banebooking.Api.Extensions;
using System.Globalization;
using Banebooking.Api.Tjenester;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Legg til miljøvariabler
builder.Configuration.AddEnvironmentVariables();

// Sett kultur
var cultureInfo = new CultureInfo("en-US");
CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;

// Hent tilkoblingsstreng fra miljøvariabel eller konfigurasjon
var connectionString =
    builder.Configuration["ConnectionStrings:DefaultConnection"]
    ?? builder.Configuration["SUPABASE_CONNECTIONSTRING"];

// Legg til DbContext
builder.Services.AddDbContext<BanebookingDbContext>(options =>
    options.UseNpgsql(connectionString));

// Supabase auth
builder.Services.AddSupabaseAuthentication(builder.Configuration);

// Legg til CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCorsPolicy", builder =>
    {
        builder
            .WithOrigins("http://localhost:5173") // React dev-server
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); // Hvis du bruker cookies
    });
});

// JSON-serialisering
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
        options.JsonSerializerOptions.Converters.Add(new TimeOnlyJsonConverter());
    });

// Swagger + cache
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();

// HTTP-klienter
builder.Services.AddHttpClient("VaerApi", client =>
{
    client.DefaultRequestHeaders.UserAgent.ParseAdd("Banebooking/1.0 (+mailto:andreas.lotarev@gmail.com)");
});

// Dependency injection
builder.Services.AddSingleton<ICacheService, CacheService>();
builder.Services.AddScoped<IKlubbService, KlubbService>();
builder.Services.AddScoped<IVaerService, VaerService>();
builder.Services.AddScoped<SlotBerikerMedVaer>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<ITidProvider, NorskTidProvider>();
builder.Services.AddScoped<IBrukerService, BrukerService>();
builder.Services.AddScoped<IBaneService, BaneService>();
builder.Services.AddScoped<IArrangementService, ArrangementService>();
builder.Services.AddScoped<IFeedService, FeedService>();

var app = builder.Build();

// Bruk Swagger i utvikling
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<BanebookingDbContext>();
    db.Database.Migrate();
    Testdata.Seed(db);

    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<BanebookingDbContext>();
    Testdata.Seed(db);
}

// Aktiver CORS
app.UseCors("DevCorsPolicy");

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();

