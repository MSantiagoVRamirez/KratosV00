namespace Kratos.Server.Models.Seguridad
{
    public class EmpresaEditarDto
    {
        public int id { get; set; }
        public int tiposociedadId { get; set; }
        public int actividadId { get; set; }
        public int regimenId { get; set; }

        public string razonSocial { get; set; } = "";
        public string nombreComercial { get; set; } = "";
        public string nit { get; set; } = "";
        public string dv { get; set; } = "";

        public string telefono { get; set; } = "";
        public string email { get; set; } = "";
        public string representanteLegal { get; set; } = "";

        public bool activo { get; set; }

        // Imagen: puedes recibir cualquiera de los dos
        public string? ImagenUrl { get; set; }         // (URL o base64, si quieres)
        public IFormFile? ImagenArchivo { get; set; }  // ar
    }
}
