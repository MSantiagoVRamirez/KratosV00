using kratos.Server.Services.Seguridad;
using Kratos.Server.Filters;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Services.Storage;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor();

// 1. Configuraci�n de la base de datos y rutas
builder.Services.AddDbContext<KratosContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configurar rutas de archivos est�ticos
var webRootPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
if (!Directory.Exists(webRootPath))
{
    Directory.CreateDirectory(webRootPath);
}

// Configuraci�n para subida de archivos
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10MB m�ximo
    options.MemoryBufferThreshold = Int32.MaxValue;
});

builder.Services.AddHttpsRedirection(options =>
{
    options.HttpsPort = 7221;
});

// 2. Configuraci�n de cookies
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Login/IniciarSesion";
        options.LogoutPath = "/Login/CerrarSesion";
        options.AccessDeniedPath = "/AccesoDenegado";
    });

// 3. Servicios de controladores, Swagger y CORS
builder.Services.AddControllers();
builder.Services.AddScoped<Encriptar>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IFilesHelper, FilesHelper>();
builder.Services.AddSwaggerGen();
builder.Logging.AddConsole();
//anadir referencia a Kratos.Server.Filters
builder.Services.AddScoped<PermisoAuthorizationFilter>();


// 4. Pol�tica CORS mejorada
const string corsPolicyName = "AllowReact";
builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicyName,
        policy => policy
            .WithOrigins(
                "https://localhost:63586",  // React desarrollo
                "http://localhost:3000",   // React alternativo
                "https://tuproduccion.com"  // Producci�n
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithExposedHeaders("Content-Disposition")); // Para descargas
});

var app = builder.Build();

// 5. Configuraci�n del entorno web
app.Environment.WebRootPath = webRootPath;

// Crear carpetas necesarias para im�genes
var imagesPath = Path.Combine(webRootPath, "images");
if (!Directory.Exists(imagesPath))
{
    Directory.CreateDirectory(imagesPath);
}

var categoriasImagesPath = Path.Combine(imagesPath, "categorias");
if (!Directory.Exists(categoriasImagesPath))
{
    Directory.CreateDirectory(categoriasImagesPath);
}

// 6. Middleware de archivos est�ticos con configuraci�n adicional
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(webRootPath),
    RequestPath = "",
    OnPrepareResponse = ctx =>
    {
        // Cachear archivos est�ticos por 1 a�o (excepto en desarrollo)
        if (!app.Environment.IsDevelopment())
        {
            ctx.Context.Response.Headers.Append(
                "Cache-Control", "public,max-age=31536000");
        }
    }
});

// 7. Middleware de Swagger (solo en desarrollo)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Krat1 API v1");
        c.RoutePrefix = "swagger";
    });

    // Mostrar m�s detalles de error en desarrollo
    app.UseDeveloperExceptionPage();
}

// 8. Pipeline de solicitudes HTTP
app.UseHttpsRedirection();
app.UseRouting();

// 9. Seguridad - Orden CRUCIAL
app.UseCors(corsPolicyName); // CORS debe estar antes de Authentication
app.UseAuthentication();
app.UseAuthorization();

// 10. Manejo de excepciones global
app.UseExceptionHandler("/error");

// 11. Endpoints
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();