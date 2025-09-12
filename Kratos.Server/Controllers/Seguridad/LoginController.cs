using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using kratos.Server.Services.Seguridad;
using Microsoft.EntityFrameworkCore;
using Kratos.Server.Models.Seguridad;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Services.Storage;


namespace Kratos.Server.Controllers.Seguridad
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly KratosContext _context;
        private readonly IUsuarioService _usuarioService;
        private readonly IFilesHelper _filesHelper;

        public LoginController(KratosContext context, IUsuarioService usuarioService, IFilesHelper filesHelper)
        {
            _context = context;
            _usuarioService = usuarioService;
            _filesHelper = filesHelper;
        }
        [HttpPost]
        [Route("registroEmpresa")]
        public async Task<IActionResult> registroEmpresa([FromForm] Empresa empresas)
        {

            // Valida que la contraseña y la confirmación coincidan
            if (empresas.contraseña != empresas.confirmarContraseña)
            {
                return BadRequest("Error: La contraseña no coincide.");
            }

            // Encripta la contraseña y configura otros datos
            empresas.contraseña = Encriptar.EncriptarClave(empresas.contraseña);
            empresas.confirmarContraseña = Encriptar.EncriptarClave(empresas.confirmarContraseña);
            empresas.token = Encriptar.EncriptarClave(empresas.token);
            empresas.creadoEn = DateTime.Now;


            // Subir imagen si viene archivo (prioridad) o respetar URL si viene
            if (empresas.ImagenArchivo is { Length: > 0 })
            {
                await using var stream = empresas.ImagenArchivo.OpenReadStream();
                var url = await _filesHelper.SubirArchivo(stream, empresas.ImagenArchivo.FileName);
                empresas.ImagenUrl = url;
            }

            // Agrega el usuario a la base de datos
            _context.Empresa.Add(empresas);
            await _context.SaveChangesAsync();

            return Ok(empresas);
        }

        [HttpPost("iniciarSesion")]
        public async Task<IActionResult> iniciarSesion([FromBody] IniciarSesionRequest request, int tipoLogin)
        {
            if (tipoLogin == 1)
            {
                if (string.IsNullOrEmpty(request.email) || string.IsNullOrEmpty(request.contraseña))
                {
                    return BadRequest("Por favor, complete todos los campos.");
                }
                request.contraseña = Encriptar.EncriptarClave(request.contraseña);

                var empresa = await _usuarioService.ObtenerEmpresa(request.email, request.contraseña);

                if (empresa == null)
                {
                    return BadRequest("Nombre de usuario o contraseña incorrectos.");
                }
                var rolId = 1;

                var claims = new List<Claim>
                {
                   new Claim(ClaimTypes.Name, empresa.email),
                   new Claim(ClaimTypes.NameIdentifier, empresa.id.ToString()),
                   new Claim("RoleId", rolId.ToString()),
                   new Claim("tipoLogin", tipoLogin.ToString())
                };
                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, claimsPrincipal);
                return Ok(new { Message = "Inicio de sesión exitoso", empresa });
            }
            else if (tipoLogin == 2)
            {
                if (string.IsNullOrEmpty(request.email) || string.IsNullOrEmpty(request.contraseña))
                {
                    return BadRequest("Por favor, complete todos los campos.");
                }
                request.contraseña = Encriptar.EncriptarClave(request.contraseña);

                var usuario = await _usuarioService.ObtenerUsuario(request.email, request.contraseña);

                if (usuario == null)
                {
                    return BadRequest("Nombre de usuario o contraseña incorrectos.");
                }
                var rolId = usuario.rolesId;

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, usuario.email),
                    new Claim(ClaimTypes.NameIdentifier, usuario.id.ToString()),
                    new Claim("RoleId", rolId.ToString()),
                    new Claim("tipoLogin", tipoLogin.ToString()) // Fix: Convert 'tipoLogin' to string
                };
                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, claimsPrincipal);

                return Ok(new { Message = "Inicio de sesión exitoso", usuario });
            }
            return BadRequest("Acceso Denegado.");
        }


        [HttpPost("cerrarSesion")]
        public async Task<IActionResult> cerrarSesion()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            return Ok(new { Message = "Sesión cerrada exitosamente" });
        }
        [HttpPost]
        [Route("registroUsuario")]
        public async Task<IActionResult> registroUsuario([FromForm] Usuario usuario)
        {

            // Valida que la contraseña y la confirmación coincidan
            if (usuario.contraseña != usuario.confirmarContraseña)
            {
                return BadRequest("Error: La contraseña no coincide.");
            }

            // Encripta la contraseña y configura otros datos
            usuario.contraseña = Encriptar.EncriptarClave(usuario.contraseña);
            usuario.confirmarContraseña = Encriptar.EncriptarClave(usuario.confirmarContraseña);
            usuario.token = Encriptar.EncriptarClave(usuario.token);
            usuario.creadoEn = DateTime.Now;

            // Subir imagen si se envió archivo
            if (usuario.ImagenArchivo != null && usuario.ImagenArchivo.Length > 0)
            {
                await using var imageStream = usuario.ImagenArchivo.OpenReadStream();
                var uploadedUrl = await _filesHelper.SubirArchivo(imageStream, usuario.ImagenArchivo.FileName);
                usuario.ImagenUrl = uploadedUrl;
            }

            var empresaAsociada = await _context.Empresa.FirstOrDefaultAsync(e => e.token == usuario.token);
            if (empresaAsociada == null)
            {
                return BadRequest(" Error: Token invalido verifique y vuelva a intentar.");
            }

            // Agrega el usuario a la base de datos
            _context.Usuario.Add(usuario);
            await _context.SaveChangesAsync();

            return Ok(usuario);
        }
    }
}
