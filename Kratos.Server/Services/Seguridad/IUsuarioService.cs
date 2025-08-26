using Kratos.Server.Models.Seguridad;

namespace kratos.Server.Services.Seguridad
{
    public interface IUsuarioService
    {
        Task<Empresa> ObtenerEmpresa(string email, string contraseña);
        Task<Usuario> ObtenerUsuario(string email, string contraseña);
        Task<int> ObtenerModuloIdPorNombre(string nombreControlador);
        Task<Permiso> ObtenerPermisoPorRolYModulo(int rolId, int moduloId);
        Task<UsuarioLogueadoDto?> ObtenerIdUsuarioLogueado();
    }
}
