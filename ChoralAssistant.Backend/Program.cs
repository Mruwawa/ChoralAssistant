using ChoralAssistant.Backend.Authorization;
using ChoralAssistant.Backend.Calendar;
using ChoralAssistant.Storage;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();
builder.Services.AddAuthModule(builder.Configuration);
builder.Services.AddStorageModule();
builder.Services.AddCalendarModule();
builder.Services.AddAuthorization();
var app = builder.Build();


app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.RegisterAuthEndpoints();
app.RegisterStorageEndpoints();
app.RegisterCalendarEndpoints();

app.UseAuthentication();
app.UseAuthorization();
app.MapFallbackToFile("index.html");
app.Run();