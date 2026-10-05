var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Включаем поиск index.html по умолчанию и отдачу файлов из wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();