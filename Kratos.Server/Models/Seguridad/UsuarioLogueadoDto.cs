namespace Kratos.Server.Models.Seguridad
{
    public class UsuarioLogueadoDto
    {
        public int id { get; set; }
        public int TipoLogin { get; set; } // 1 = Empresa, 2 = Usuario
        public string Email { get; set; } = string.Empty;
        public int Rol { get; set; }
        public string Nombre { get; set; } = string.Empty;
    }
}
