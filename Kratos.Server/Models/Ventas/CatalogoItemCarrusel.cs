using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kratos.Server.Models.Ventas
{
    public class CatalogoItemCarrusel
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int empresaId { get; set; }
        public Empresa? empresaFk { get; set; }

        [MaxLength(150)]
        public string? titulo { get; set; }

        [MaxLength(500)]
        public string? descripcion { get; set; }

        [MaxLength(20)]
        public string? tituloColor { get; set; }

        [MaxLength(300)]
        public string? imagenUrl { get; set; }

        public int orden { get; set; } = 0;

        // Intervalo por diapositiva en milisegundos
        public int intervaloMs { get; set; } = 3000;

        // Sección del catálogo: "productos" o "servicios"
        [MaxLength(50)]
        public string? seccion { get; set; }

        public bool activo { get; set; } = true;

        public DateTime creadoEn { get; set; } = DateTime.Now;
        public DateTime? actualizadoEn { get; set; }

        [NotMapped]
        public IFormFile? ImagenArchivo { get; set; }
    }
}
