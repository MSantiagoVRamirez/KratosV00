using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Kratos.Server.Models.Seguridad;
using Kratos.Server.Models.Contexto;


namespace kratos.Server.Services.Seguridad;
public class UsuarioService : IUsuarioService
{

    private readonly KratosContext _context;
    public UsuarioService(KratosContext context)
    {
        _context = context;
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

}