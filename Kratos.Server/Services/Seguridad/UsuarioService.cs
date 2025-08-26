using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Kratos.Server.Models.Seguridad;
using Kratos.Server.Models.Contexto;
using System.Security.Claims;


namespace kratos.Server.Services.Seguridad;
public class UsuarioService : IUsuarioService
{

    private readonly KratosContext _context;
    private readonly ILogger<UsuarioService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    public UsuarioService(KratosContext context, ILogger<UsuarioService> logger, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }
    public async Task<Empresa> ObtenerEmpresa(string email, string contraseña)
    {
        var empresa = await _context.Empresa
            .Where(e => e.email == email && e.contraseña == contraseña)
            .FirstOrDefaultAsync();
        return empresa;

    }
    public async Task<Usuario> ObtenerUsuario(string email, string contraseña)
    {
        var usuario = await _context.Usuario
            .Where(e => e.email == email && e.contraseña == contraseña)
            .FirstOrDefaultAsync();
        return usuario;

    }
    public async Task<int> ObtenerModuloIdPorNombre(string nombreControlador)
    {

        var modulo = await _context.Modulo
            .FirstOrDefaultAsync(m => m.nombre == nombreControlador);

        return modulo?.id ?? 0;
    }
    public async Task<Permiso> ObtenerPermisoPorRolYModulo(int rolId, int moduloId)
    {
        // Realiza la consulta para buscar el permiso específico basado en rolId y moduloId
        var permiso = await _context.Permiso
            .FirstOrDefaultAsync(p => p.rolesId == rolId && p.modulosId == moduloId);

        return permiso;
    }
    public async Task<UsuarioLogueadoDto?> ObtenerIdUsuarioLogueado()
    {
        var httpContext = _httpContextAccessor.HttpContext;

        if (httpContext == null)
        {
            _logger.LogWarning("No se pudo acceder al contexto HTTP.");
            return null;
        }

        var tipoLoginClaim = httpContext.User.FindFirst("tipoLogin");
        var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            _logger.LogWarning("No se pudo obtener el ID del usuario desde los claims.");
            return null;
        }

        if (tipoLoginClaim == null)
        {
            _logger.LogWarning("No se encontró el claim 'tipoLogin'.");
            return null;
        }

        var tipoLogin = tipoLoginClaim.Value;

        var usuarioLogueado = new UsuarioLogueadoDto();

        if (tipoLogin == "1")
        {
            var empresa = await _context.Empresa.FirstOrDefaultAsync(u => u.id == userId);
            if (empresa == null)
            {
                _logger.LogWarning($"No se encontró una empresa con el ID {userId}.");
                return null;
            }
            usuarioLogueado.id = empresa.id;
            usuarioLogueado.TipoLogin = 1;
            usuarioLogueado.Email = empresa.email;
            usuarioLogueado.Rol = 0; // Rol por defecto para empresa
            usuarioLogueado.Nombre = empresa.razonSocial;
        }
        else if (tipoLogin == "2")
        {
            var usuario = await _context.Usuario
                .Include(u => u.usuariosrolesFk)
                .FirstOrDefaultAsync(u => u.id == userId);

            if (usuario == null)
            {
                _logger.LogWarning($"No se encontró un usuario con el ID {userId}.");
                return null;
            }
            usuarioLogueado.id = usuario.id;
            usuarioLogueado.TipoLogin = 2;
            usuarioLogueado.Email = usuario.email;
            usuarioLogueado.Rol = usuario.rolesId;
            usuarioLogueado.Nombre = $"{usuario.nombres} {usuario.apellidos}";
        }
        else
        {
            _logger.LogWarning("El valor del claim 'tipoLogin' no es válido.");
            return null;
        }

        return usuarioLogueado;
    }
}